package com.library.management.service;

import com.library.management.dto.BookDatasetRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Robust RFC-4180 compliant CSV parser implemented with pure Java standard library.
 * Correctly parses quoted tokens, escaped double quotes, and comma delimiters.
 */
@Component
public class BookDatasetCsvParser {

    private static final Logger log = LoggerFactory.getLogger(BookDatasetCsvParser.class);

    public record ParseResult(
        List<BookDatasetRecord> records,
        List<String> parseErrors
    ) {}

    /**
     * Parses the CSV input stream into structured {@link BookDatasetRecord} objects.
     *
     * @param inputStream the CSV stream
     * @return ParseResult containing successfully parsed records and any parse errors
     * @throws IOException on I/O error
     */
    public ParseResult parse(InputStream inputStream) throws IOException {
        List<BookDatasetRecord> records = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.trim().isEmpty()) {
                errors.add("CSV file is empty or missing header line.");
                return new ParseResult(records, errors);
            }

            // Remove Byte Order Mark (BOM) if present
            if (headerLine.startsWith("\uFEFF")) {
                headerLine = headerLine.substring(1);
            }

            List<String> headers = parseLine(headerLine);
            Map<String, Integer> colIndexMap = new HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                colIndexMap.put(headers.get(i).trim().toLowerCase(), i);
            }

            // Verify essential header fields
            String[] requiredHeaders = {"record_id", "title", "authors", "category"};
            for (String req : requiredHeaders) {
                if (!colIndexMap.containsKey(req)) {
                    errors.add("Missing required CSV header column: " + req);
                }
            }
            if (!errors.isEmpty()) {
                return new ParseResult(records, errors);
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue;
                }

                try {
                    List<String> tokens = parseLine(line);
                    if (tokens.size() < headers.size()) {
                        String errMsg = String.format("Line %d: column count mismatch (expected %d, got %d). Raw: %s",
                                lineNumber, headers.size(), tokens.size(), line);
                        log.warn(errMsg);
                        errors.add(errMsg);
                        continue;
                    }

                    String recordIdStr = getColumnValue(tokens, colIndexMap, "record_id");
                    Long recordId = null;
                    if (recordIdStr != null && !recordIdStr.isEmpty()) {
                        try {
                            recordId = Long.parseLong(recordIdStr);
                        } catch (NumberFormatException nfe) {
                            String errMsg = String.format("Line %d: invalid non-numeric record_id '%s'", lineNumber, recordIdStr);
                            log.warn(errMsg);
                            errors.add(errMsg);
                            continue;
                        }
                    }

                    String title = getColumnValue(tokens, colIndexMap, "title");
                    String authors = getColumnValue(tokens, colIndexMap, "authors");
                    String category = getColumnValue(tokens, colIndexMap, "category");

                    if (title == null || title.isEmpty()) {
                        String errMsg = String.format("Line %d: missing required field 'title'", lineNumber);
                        log.warn(errMsg);
                        errors.add(errMsg);
                        continue;
                    }
                    if (authors == null || authors.isEmpty()) {
                        String errMsg = String.format("Line %d: missing required field 'authors'", lineNumber);
                        log.warn(errMsg);
                        errors.add(errMsg);
                        continue;
                    }
                    if (category == null || category.isEmpty()) {
                        String errMsg = String.format("Line %d: missing required field 'category'", lineNumber);
                        log.warn(errMsg);
                        errors.add(errMsg);
                        continue;
                    }

                    BookDatasetRecord record = new BookDatasetRecord(
                            recordId,
                            title,
                            authors,
                            getColumnValue(tokens, colIndexMap, "publisher"),
                            getColumnValue(tokens, colIndexMap, "isbn"),
                            getColumnValue(tokens, colIndexMap, "publication_year"),
                            category,
                            getColumnValue(tokens, colIndexMap, "subject"),
                            getColumnValue(tokens, colIndexMap, "exam_type"),
                            getColumnValue(tokens, colIndexMap, "language"),
                            getColumnValue(tokens, colIndexMap, "description"),
                            getColumnValue(tokens, colIndexMap, "cover_image_url"),
                            getColumnValue(tokens, colIndexMap, "source_name"),
                            getColumnValue(tokens, colIndexMap, "source_search_url"),
                            getColumnValue(tokens, colIndexMap, "metadata_note")
                    );
                    records.add(record);
                } catch (Exception ex) {
                    String errMsg = String.format("Line %d: unexpected parsing error: %s", lineNumber, ex.getMessage());
                    log.warn(errMsg, ex);
                    errors.add(errMsg);
                }
            }
        }

        return new ParseResult(records, errors);
    }

    /**
     * Parses a single CSV line according to RFC 4180 rules.
     */
    public List<String> parseLine(String line) {
        List<String> tokens = new ArrayList<>();
        if (line == null) {
            return tokens;
        }

        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        int len = line.length();

        for (int i = 0; i < len; i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < len && line.charAt(i + 1) == '"') {
                    // Escaped quote: "" inside quotes becomes "
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        tokens.add(current.toString().trim());
        return tokens;
    }

    private String getColumnValue(List<String> tokens, Map<String, Integer> colIndexMap, String colName) {
        Integer idx = colIndexMap.get(colName.toLowerCase());
        if (idx == null || idx >= tokens.size()) {
            return null;
        }
        String val = tokens.get(idx);
        return (val == null || val.trim().isEmpty()) ? null : val.trim();
    }
}

