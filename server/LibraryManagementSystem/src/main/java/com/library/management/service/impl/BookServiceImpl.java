package com.library.management.service.impl;

import com.library.management.dto.BookCreateRequest;
import com.library.management.dto.BookResponse;
import com.library.management.entity.Book;
import com.library.management.entity.LoanStatus;
import com.library.management.exception.DuplicateResourceException;
import com.library.management.exception.LoanOperationException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookRepository;
import com.library.management.repository.LoanRepository;
import com.library.management.service.BookService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;

    public BookServiceImpl(BookRepository bookRepository, LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks(String query, String category) {
        return getAllBooks(query, category, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks(String query, String category, boolean includeArchived) {
        List<Book> books;
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category.trim());

        if (includeArchived) {
            if (hasQuery) {
                books = bookRepository.searchBooks(query.trim());
            } else if (hasCategory) {
                books = bookRepository.findByCategoryIgnoreCase(category.trim());
            } else {
                books = bookRepository.findAll();
            }
        } else {
            if (hasQuery) {
                books = bookRepository.searchActiveBooks(query.trim());
            } else if (hasCategory) {
                books = bookRepository.findByCategoryIgnoreCaseActive(category.trim());
            } else {
                books = bookRepository.findAllActive();
            }
        }
        return books.stream().map(BookResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookById(String id) {
        Book book = getBookEntityById(id);
        return BookResponse.fromEntity(book);
    }

    @Override
    @Transactional(readOnly = true)
    public Book getBookEntityById(String id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    @Override
    @Transactional
    public BookResponse createBook(BookCreateRequest request) {
        String trimmedTitle = request.getTitle() != null ? request.getTitle().trim() : "";
        String trimmedAuthor = request.getAuthor() != null ? request.getAuthor().trim() : "";
        String category = request.getCategory() != null ? request.getCategory().trim() : "ai-computing";

        // 1. Deduplication check: title + author
        if (bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCase(trimmedTitle, trimmedAuthor)) {
            throw new DuplicateResourceException(
                    "A book titled '" + trimmedTitle + "' by '" + trimmedAuthor + "' already exists in the catalogue."
            );
        }

        // 2. Call number validation & generation
        String callNumber = request.getCallNumber() != null ? request.getCallNumber().trim() : "";
        if (!callNumber.isEmpty()) {
            if (bookRepository.existsByCallNumber(callNumber)) {
                throw new DuplicateResourceException(
                        "A book with call number '" + callNumber + "' already exists in the catalogue."
                );
            }
        } else {
            callNumber = generateCallNumber(category, trimmedAuthor);
        }

        // 3. Location and Category label derivation
        String location = request.getLocation() != null && !request.getLocation().trim().isEmpty()
                ? request.getLocation().trim()
                : determineLocation(category);
        String categoryLabel = mapCategoryToLabel(category);

        // 4. Copy counts
        int totalCopies = (request.getTotalCopies() != null && request.getTotalCopies() >= 1)
                ? request.getTotalCopies()
                : 1;

        // 5. Unique book code generation
        String code = "admin-book-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        while (bookRepository.existsByCode(code)) {
            code = "admin-book-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        }

        Book book = new Book();
        book.setCode(code);
        book.setTitle(trimmedTitle);
        book.setAuthor(trimmedAuthor);
        book.setCategory(category);
        book.setCategoryLabel(categoryLabel);
        book.setCallNumber(callNumber);
        book.setLocation(location);
        book.setTotalCopies(totalCopies);
        book.setCopiesAvailable(totalCopies);
        book.setArchived(false);
        book.setPublicationYear(request.getPublicationYear());
        book.setSynopsis(request.getSynopsis() != null ? request.getSynopsis().trim() : null);
        book.setCreatedAt(Instant.now());
        book.setUpdatedAt(Instant.now());

        Book saved = bookRepository.save(book);
        return BookResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BookResponse archiveBook(String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        if (book.isArchived()) {
            throw new DuplicateResourceException("Book '" + book.getTitle() + "' is already archived.");
        }

        // Check active or pending loans
        List<LoanStatus> activeStatuses = List.of(
                LoanStatus.PENDING,
                LoanStatus.ISSUED,
                LoanStatus.RETURN_PENDING
        );
        if (loanRepository.existsByBookAndStatusIn(book, activeStatuses)) {
            throw new LoanOperationException(
                    "Cannot archive book '" + book.getTitle() + "': book has active or pending loans in circulation.",
                    409
            );
        }

        book.setArchived(true);
        book.setUpdatedAt(Instant.now());
        Book saved = bookRepository.save(book);
        return BookResponse.fromEntity(saved);
    }

    private String determineLocation(String category) {
        if (category == null) return "Main Stacks · Central Library";
        return switch (category.toLowerCase(Locale.ROOT)) {
            case "ai-computing" -> "Engineering & Tech Wing · 3rd Floor, Section CS";
            case "science-nature" -> "Engineering & Sciences Complex · 2nd Floor";
            case "economics-society" -> "Civil Services & Career Resource Center · Ground Floor";
            case "philosophy" -> "Humanities & Philosophy Alcove · 1st Floor";
            case "classical-lit" -> "Classical Literature Archive · 2nd Floor";
            default -> "Main Stacks · Central Library";
        };
    }

    private String mapCategoryToLabel(String category) {
        if (category == null) return "General Stack";
        return switch (category.toLowerCase(Locale.ROOT)) {
            case "ai-computing" -> "AI & Computational Thinking";
            case "science-nature" -> "Natural History & Physics";
            case "economics-society" -> "Political Economy & Society";
            case "philosophy" -> "Philosophy & Ethics";
            case "classical-lit" -> "Literary Classics & Essays";
            default -> category;
        };
    }

    private String generateCallNumber(String category, String author) {
        String prefix = switch (category != null ? category.toLowerCase(Locale.ROOT) : "") {
            case "ai-computing" -> "QA76.73";
            case "science-nature" -> "QC21.2";
            case "economics-society" -> "HB171";
            case "philosophy" -> "B580";
            case "classical-lit" -> "PR6005";
            default -> "LIB.GEN";
        };
        String cleanAuthor = author != null ? author.toUpperCase(Locale.ROOT).replaceAll("[^A-Z]", "") : "";
        String authorCutter = cleanAuthor.length() >= 3
                ? "." + cleanAuthor.substring(0, 3)
                : (!cleanAuthor.isEmpty() ? "." + cleanAuthor : ".GEN");
        String candidate = prefix + " " + authorCutter + " " + (100 + (int) (Math.random() * 900));
        while (bookRepository.existsByCallNumber(candidate)) {
            candidate = prefix + " " + authorCutter + " " + (100 + (int) (Math.random() * 900));
        }
        return candidate;
    }
}
