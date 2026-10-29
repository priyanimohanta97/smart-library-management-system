package com.library.management.config;

import com.library.management.dto.BookDatasetImportResult;
import com.library.management.repository.BookRepository;
import com.library.management.service.BookDatasetCsvParser;
import com.library.management.service.BookDatasetImporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;

/**
 * Controlled startup runner that initializes the real book dataset from CSV
 * into the authoritative book catalogue.
 * Ordered after {@link BookInitializer} to ensure seed records exist first.
 */
@Component
@Order(2)
public class BookDatasetInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BookDatasetInitializer.class);

    private final BookRepository bookRepository;
    private final BookDatasetCsvParser csvParser;
    private final BookDatasetImporter datasetImporter;
    private final ResourceLoader resourceLoader;

    @Value("${app.book-dataset.import.enabled:true}")
    private boolean importEnabled;

    @Value("${app.book-dataset.import.resource-path:data/books-dataset.csv}")
    private String primaryResourcePath;

    @Value("${app.book-dataset.import.fallback-resource-path:data/library_real_books_starter_dataset.csv}")
    private String fallbackResourcePath;

    @Value("${app.book-dataset.import.force:false}")
    private boolean forceImport;

    public BookDatasetInitializer(
            BookRepository bookRepository,
            BookDatasetCsvParser csvParser,
            BookDatasetImporter datasetImporter,
            ResourceLoader resourceLoader
    ) {
        this.bookRepository = bookRepository;
        this.csvParser = csvParser;
        this.datasetImporter = datasetImporter;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!importEnabled) {
            log.info("Book dataset import is disabled via configuration (app.book-dataset.import.enabled=false).");
            return;
        }

        // Fast-path startup check: avoid re-parsing and scanning CSV if dataset is already imported
        if (!forceImport && isDatasetAlreadyImported()) {
            log.info("Authoritative real book dataset already loaded in catalogue. Skipping CSV scan to optimize application startup.");
            return;
        }

        Resource resource = resolveResource();
        if (resource == null || !resource.exists()) {
            log.warn("Book dataset CSV resource not found at '{}' or '{}'. Skipping dataset import.",
                    primaryResourcePath, fallbackResourcePath);
            return;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            log.info("Loading real book dataset from '{}'...", resource.getFilename());
            BookDatasetCsvParser.ParseResult parseResult = csvParser.parse(inputStream);

            if (!parseResult.parseErrors().isEmpty()) {
                log.warn("Encountered {} parsing warnings/errors while reading book dataset CSV.",
                        parseResult.parseErrors().size());
                for (String err : parseResult.parseErrors()) {
                    log.warn("  CSV parse issue: {}", err);
                }
            }

            BookDatasetImportResult importResult = datasetImporter.importRecords(parseResult.records());

            log.info("Real book dataset import completed: {} records parsed, {} imported, {} skipped (existing/duplicate), {} rejected.",
                    importResult.totalRead(),
                    importResult.importedCount(),
                    importResult.skippedCount(),
                    importResult.rejectedCount());

        } catch (Exception ex) {
            log.error("Failed to import real book dataset from CSV: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Checks whether the dataset appears to be already present in the repository.
     */
    private boolean isDatasetAlreadyImported() {
        // Record 1 and Record 104 are the start and end of the starter dataset
        return bookRepository.existsByCode("csv-book-1") && 
              (bookRepository.existsByCode("csv-book-104") || bookRepository.existsByCode("csv-book-103"));
    }

    private Resource resolveResource() {
        Resource primary = resourceLoader.getResource("classpath:" + primaryResourcePath);
        if (primary.exists()) {
            return primary;
        }
        Resource fallback = resourceLoader.getResource("classpath:" + fallbackResourcePath);
        if (fallback.exists()) {
            return fallback;
        }
        return null;
    }
}

