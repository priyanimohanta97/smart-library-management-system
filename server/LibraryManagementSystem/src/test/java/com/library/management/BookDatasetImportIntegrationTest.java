package com.library.management;

import com.library.management.dto.BookDatasetImportResult;
import com.library.management.dto.BookResponse;
import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import com.library.management.service.BookDatasetCsvParser;
import com.library.management.service.BookDatasetImporter;
import com.library.management.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BookDatasetImportIntegrationTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookDatasetCsvParser csvParser;

    @Autowired
    private BookDatasetImporter datasetImporter;

    @Autowired
    private BookService bookService;

    @Autowired
    private ResourceLoader resourceLoader;

    @BeforeEach
    void ensureSeedBooksExist() {
        // BookInitializer has already executed on context startup, providing book-1 through book-8
        assertThat(bookRepository.existsByCode("book-1")).isTrue();
    }

    @Test
    @DisplayName("End-to-end dataset import into database: verifies counts, idempotence, search, and filtering")
    void testEndToEndImportAndIdempotence() throws Exception {
        Resource resource = resourceLoader.getResource("classpath:data/books-dataset.csv");
        if (!resource.exists()) {
            resource = resourceLoader.getResource("classpath:data/library_real_books_starter_dataset.csv");
        }
        assertThat(resource.exists()).isTrue();

        // 1. Initial State: seed books are in DB
        long initialBookCount = bookRepository.count();
        assertThat(initialBookCount).isGreaterThanOrEqualTo(8L);

        // 2. Parse CSV
        BookDatasetCsvParser.ParseResult parseResult;
        try (InputStream is = resource.getInputStream()) {
            parseResult = csvParser.parse(is);
        }
        assertThat(parseResult.parseErrors()).isEmpty();
        assertThat(parseResult.records()).hasSize(104);

        // 3. First Import Run
        BookDatasetImportResult firstRunResult = datasetImporter.importRecords(parseResult.records());

        // 104 rows in starter CSV:
        // - 103 unique books imported
        // - 1 skipped (Record 101: duplicate of Record 96 "A Modern Approach to Verbal & Non-Verbal Reasoning" by "R. S. Aggarwal")
        // - 0 rejected
        assertThat(firstRunResult.totalRead()).isEqualTo(104);
        assertThat(firstRunResult.importedCount()).isEqualTo(103);
        assertThat(firstRunResult.skippedCount()).isEqualTo(1);
        assertThat(firstRunResult.rejectedCount()).isEqualTo(0);

        long countAfterFirstImport = bookRepository.count();
        assertThat(countAfterFirstImport).isEqualTo(initialBookCount + 103);

        // 4. Verify seed books are completely preserved and untouched
        Optional<Book> seedBook1 = bookRepository.findByCode("book-1");
        assertThat(seedBook1).isPresent();
        assertThat(seedBook1.get().getTitle()).isEqualTo("Gödel, Escher, Bach: An Eternal Golden Braid");
        assertThat(seedBook1.get().getCopiesAvailable()).isEqualTo(3);
        assertThat(seedBook1.get().getTotalCopies()).isEqualTo(4);

        // 5. Verify sample imported book
        Optional<Book> importedBook1 = bookRepository.findByCode("csv-book-1");
        assertThat(importedBook1).isPresent();
        Book cormen = importedBook1.get();
        assertThat(cormen.getTitle()).isEqualTo("Introduction to Algorithms");
        assertThat(cormen.getAuthor()).contains("Thomas H. Cormen");
        assertThat(cormen.getCategory()).isEqualTo("ai-computing");
        assertThat(cormen.getCategoryLabel()).isEqualTo("Computer Science");
        assertThat(cormen.getTotalCopies()).isEqualTo(3);
        assertThat(cormen.getCopiesAvailable()).isEqualTo(3);
        assertThat(cormen.getCallNumber()).startsWith("QA76.73");
        // No fabricated metadata
        assertThat(cormen.getRating()).isNull();
        assertThat(cormen.getReviewsCount()).isNull();
        assertThat(cormen.getPages()).isNull();

        // 6. Idempotence Check: Second Import Run with identical dataset
        BookDatasetImportResult secondRunResult = datasetImporter.importRecords(parseResult.records());
        assertThat(secondRunResult.totalRead()).isEqualTo(104);
        assertThat(secondRunResult.importedCount()).isEqualTo(0);
        assertThat(secondRunResult.skippedCount()).isEqualTo(104);
        assertThat(secondRunResult.rejectedCount()).isEqualTo(0);

        long countAfterSecondImport = bookRepository.count();
        assertThat(countAfterSecondImport).isEqualTo(countAfterFirstImport);

        // Verify inventory of cormen is still untouched (3 copies)
        Optional<Book> cormenAfterSecondRun = bookRepository.findByCode("csv-book-1");
        assertThat(cormenAfterSecondRun).isPresent();
        assertThat(cormenAfterSecondRun.get().getCopiesAvailable()).isEqualTo(3);
        assertThat(cormenAfterSecondRun.get().getTotalCopies()).isEqualTo(3);

        // 7. Verify Category Filtering via BookService
        List<BookResponse> csBooks = bookService.getAllBooks(null, "ai-computing");
        assertThat(csBooks).isNotEmpty();
        assertThat(csBooks).anyMatch(b -> b.getTitle().equals("Introduction to Algorithms"));

        List<BookResponse> engBooks = bookService.getAllBooks(null, "science-nature");
        assertThat(engBooks).isNotEmpty();
        assertThat(engBooks).anyMatch(b -> b.getCategoryLabel().equals("Electrical Engineering") ||
                                          b.getCategoryLabel().equals("Mechanical Engineering"));

        List<BookResponse> upscBooks = bookService.getAllBooks(null, "economics-society");
        assertThat(upscBooks).isNotEmpty();
        assertThat(upscBooks).anyMatch(b -> b.getCategoryLabel().equals("UPSC Preparation") ||
                                            b.getCategoryLabel().equals("SSC Preparation"));

        // 8. Verify Search Query via BookService
        List<BookResponse> searchAlgo = bookService.getAllBooks("Algorithms", null);
        assertThat(searchAlgo).isNotEmpty();
        assertThat(searchAlgo).anyMatch(b -> b.getTitle().contains("Introduction to Algorithms"));

        List<BookResponse> searchAuthor = bookService.getAllBooks("Cormen", null);
        assertThat(searchAuthor).isNotEmpty();
        assertThat(searchAuthor.get(0).getAuthor()).contains("Cormen");
    }
}

