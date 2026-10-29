package com.library.management.service;

import com.library.management.dto.BookDatasetImportResult;
import com.library.management.dto.BookDatasetRecord;
import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service for safely and idempotently importing real book dataset records
 * into the authoritative Library Management System database.
 */
@Service
public class BookDatasetImporter {

    private static final Logger log = LoggerFactory.getLogger(BookDatasetImporter.class);

    private final BookRepository bookRepository;
    private final int defaultCopies;

    public BookDatasetImporter(
            BookRepository bookRepository,
            @Value("${app.book-dataset.import.default-copies:3}") int defaultCopies
    ) {
        this.bookRepository = bookRepository;
        this.defaultCopies = defaultCopies > 0 ? defaultCopies : 3;
    }

    /**
     * Imports a list of parsed dataset records into the Book repository.
     *
     * @param records parsed book dataset records
     * @return summary result detailing imported, skipped, and rejected counts
     */
    @Transactional
    public BookDatasetImportResult importRecords(List<BookDatasetRecord> records) {
        if (records == null || records.isEmpty()) {
            return new BookDatasetImportResult(0, 0, 0, 0, List.of("No records provided for import."));
        }

        int importedCount = 0;
        int skippedCount = 0;
        int rejectedCount = 0;
        List<String> rejections = new ArrayList<>();

        for (BookDatasetRecord record : records) {
            try {
                // 1. Validate required fields
                if (record.title() == null || record.title().trim().isEmpty()) {
                    String reason = String.format("Record %s rejected: missing title.", record.recordId());
                    log.warn(reason);
                    rejections.add(reason);
                    rejectedCount++;
                    continue;
                }
                if (record.authors() == null || record.authors().trim().isEmpty()) {
                    String reason = String.format("Record %s ('%s') rejected: missing authors.", record.recordId(), record.title());
                    log.warn(reason);
                    rejections.add(reason);
                    rejectedCount++;
                    continue;
                }
                if (record.category() == null || record.category().trim().isEmpty()) {
                    String reason = String.format("Record %s ('%s') rejected: missing category.", record.recordId(), record.title());
                    log.warn(reason);
                    rejections.add(reason);
                    rejectedCount++;
                    continue;
                }

                String trimmedTitle = record.title().trim();
                String trimmedAuthor = record.authors().trim();

                // Validate maximum field lengths per database entity annotations
                if (trimmedTitle.length() > 200) {
                    String reason = String.format("Record %s rejected: title exceeds 200 characters (length: %d).",
                            record.recordId(), trimmedTitle.length());
                    log.warn(reason);
                    rejections.add(reason);
                    rejectedCount++;
                    continue;
                }
                if (trimmedAuthor.length() > 150) {
                    String reason = String.format("Record %s rejected: author exceeds 150 characters (length: %d).",
                            record.recordId(), trimmedAuthor.length());
                    log.warn(reason);
                    rejections.add(reason);
                    rejectedCount++;
                    continue;
                }

                // 2. Generate deterministic code
                String code = generateDeterministicCode(record.recordId(), trimmedTitle);

                // 3. Deduplication check: by code and by title+author
                if (bookRepository.existsByCode(code)) {
                    log.debug("Skipping record {}: book with code '{}' already exists.", record.recordId(), code);
                    skippedCount++;
                    continue;
                }

                if (bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCase(trimmedTitle, trimmedAuthor)) {
                    log.info("Skipping record {}: book '{}' by '{}' already exists in catalogue.",
                            record.recordId(), trimmedTitle, trimmedAuthor);
                    skippedCount++;
                    continue;
                }

                // 4. Map category to frontend supported category IDs and keep specific label
                String frontendCategory = mapToFrontendCategory(record.category());
                String categoryLabel = record.category().trim();

                // 5. Generate deterministic, collision-free call number
                String callNumber = generateCallNumber(record.category(), record.recordId(), trimmedAuthor);

                // 6. Map optional fields safely without fabricating data
                Integer pubYear = parsePublicationYear(record.publicationYear());
                String coverImage = sanitizeCoverImage(record.coverImageUrl());
                String synopsis = sanitizeSynopsis(record.description());
                String tags = buildTags(record.subject(), record.examType());
                String location = determineLocation(frontendCategory);

                Book book = new Book();
                book.setCode(code);
                book.setTitle(trimmedTitle);
                book.setAuthor(trimmedAuthor);
                book.setCategory(frontendCategory);
                book.setCategoryLabel(categoryLabel);
                book.setCallNumber(callNumber);
                book.setLocation(location);
                book.setTotalCopies(defaultCopies);
                book.setCopiesAvailable(defaultCopies);
                book.setPublicationYear(pubYear);
                book.setCoverImage(coverImage);
                book.setSynopsis(synopsis);
                book.setTags(tags);

                // Leave optional fields strictly unset/null without fabricating fake ratings, reviews, or pages
                book.setRating(null);
                book.setReviewsCount(null);
                book.setPages(null);
                book.setSubtitle(null);
                book.setAuthorRole(null);
                book.setCuratorQuote(null);

                bookRepository.save(book);
                importedCount++;

            } catch (Exception ex) {
                String reason = String.format("Record %s ('%s') failed during import: %s",
                        record.recordId(), record.title(), ex.getMessage());
                log.error(reason, ex);
                rejections.add(reason);
                rejectedCount++;
            }
        }

        log.info("Dataset import batch completed: total={}, imported={}, skipped={}, rejected={}",
                records.size(), importedCount, skippedCount, rejectedCount);

        return new BookDatasetImportResult(records.size(), importedCount, skippedCount, rejectedCount, rejections);
    }

    /**
     * Generates a deterministic, unique book code based on the record ID.
     */
    public String generateDeterministicCode(Long recordId, String title) {
        if (recordId != null && recordId > 0) {
            return "csv-book-" + recordId;
        }
        // Fallback for missing recordId: clean slug from title
        String slug = title.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (slug.startsWith("-")) slug = slug.substring(1);
        if (slug.length() > 30) slug = slug.substring(0, 30);
        return "csv-book-" + Math.abs(title.hashCode() % 100000) + "-" + slug;
    }

    /**
     * Maps CSV categories to existing frontend category IDs:
     * - "ai-computing"
     * - "science-nature"
     * - "economics-society"
     * - "philosophy"
     * - "classical-lit"
     */
    public String mapToFrontendCategory(String rawCategory) {
        if (rawCategory == null) return "science-nature";
        String norm = rawCategory.trim().toLowerCase(Locale.ROOT);

        return switch (norm) {
            case "computer science", "ai & data science" -> "ai-computing";
            case "mathematics & basic sciences",
                 "electrical engineering",
                 "electronics engineering",
                 "mechanical engineering",
                 "civil engineering",
                 "chemical engineering" -> "science-nature";
            case "upsc preparation", "ssc preparation" -> "economics-society";
            case "philosophy" -> "philosophy";
            case "classical-lit", "literature" -> "classical-lit";
            default -> "science-nature";
        };
    }

    /**
     * Generates a deterministic Library of Congress style call number.
     */
    public String generateCallNumber(String category, Long recordId, String author) {
        String catNorm = category != null ? category.trim().toLowerCase(Locale.ROOT) : "";
        String prefix = switch (catNorm) {
            case "computer science" -> "QA76.73";
            case "ai & data science" -> "QA76.87";
            case "mathematics & basic sciences" -> "QA300";
            case "electrical engineering" -> "TK145";
            case "electronics engineering" -> "TK7815";
            case "mechanical engineering" -> "TJ145";
            case "civil engineering" -> "TA145";
            case "chemical engineering" -> "TP145";
            case "upsc preparation" -> "JQ215";
            case "ssc preparation" -> "HF5381";
            default -> "Z665";
        };

        // Derive cutter letter from author surname
        char cutterChar = 'A';
        if (author != null && !author.isEmpty()) {
            String[] parts = author.trim().split("[\\s,;]+");
            String surname = parts[parts.length - 1].replaceAll("[^a-zA-Z]", "");
            if (!surname.isEmpty()) {
                cutterChar = Character.toUpperCase(surname.charAt(0));
            }
        }

        long idNum = recordId != null ? recordId : 1L;
        String baseCallNumber = String.format("%s .%c%02d #%03d", prefix, cutterChar, idNum % 100, idNum);

        // Ensure call number uniqueness
        if (!bookRepository.existsByCallNumber(baseCallNumber)) {
            return baseCallNumber;
        }

        return String.format("%s-R%d", baseCallNumber, idNum);
    }

    private String determineLocation(String frontendCategory) {
        return switch (frontendCategory) {
            case "ai-computing" -> "Engineering & Tech Wing · 3rd Floor, Section CS";
            case "science-nature" -> "Engineering & Sciences Complex · 2nd Floor";
            case "economics-society" -> "Civil Services & Career Resource Center · Ground Floor";
            default -> "Main Stacks · Central Library";
        };
    }

    private Integer parsePublicationYear(String rawYear) {
        if (rawYear == null || rawYear.trim().isEmpty()) {
            return null;
        }
        try {
            int year = Integer.parseInt(rawYear.trim());
            if (year >= 1000 && year <= 2100) {
                return year;
            }
        } catch (NumberFormatException ignored) {
        }
        return null;
    }

    private String sanitizeCoverImage(String coverImageUrl) {
        if (coverImageUrl == null || coverImageUrl.trim().isEmpty()) {
            return null;
        }
        String trimmed = coverImageUrl.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed;
        }
        return null;
    }

    private String sanitizeSynopsis(String description) {
        if (description == null || description.trim().isEmpty()) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.length() > 2000 ? trimmed.substring(0, 2000) : trimmed;
    }

    private String buildTags(String subject, String examType) {
        List<String> tagParts = new ArrayList<>();
        if (subject != null && !subject.trim().isEmpty()) {
            for (String part : subject.split("[;,]")) {
                String t = part.trim();
                if (!t.isEmpty() && !tagParts.contains(t)) {
                    tagParts.add(t);
                }
            }
        }
        if (examType != null && !examType.trim().isEmpty()) {
            for (String part : examType.split("[;,]")) {
                String t = part.trim();
                if (!t.isEmpty() && !tagParts.contains(t)) {
                    tagParts.add(t);
                }
            }
        }

        if (tagParts.isEmpty()) {
            return null;
        }
        String joined = String.join(", ", tagParts);
        return joined.length() > 500 ? joined.substring(0, 500) : joined;
    }
}

