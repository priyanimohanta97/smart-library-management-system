package com.library.management.service;

import com.library.management.dto.BookDatasetImportResult;
import com.library.management.dto.BookDatasetRecord;
import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class BookDatasetImporterTest {

    private BookRepository bookRepository;
    private BookDatasetImporter importer;

    @BeforeEach
    void setUp() {
        bookRepository = mock(BookRepository.class);
        importer = new BookDatasetImporter(bookRepository, 3);
    }

    @Test
    @DisplayName("Deterministic code generation is consistent and unique")
    void testCodeGeneration() {
        String code1 = importer.generateDeterministicCode(15L, "Discrete Mathematics");
        String code2 = importer.generateDeterministicCode(15L, "Discrete Mathematics");
        assertThat(code1).isEqualTo("csv-book-15");
        assertThat(code2).isEqualTo(code1);

        String codeFallback = importer.generateDeterministicCode(null, "Very Long Book Title That Needs Slugs");
        assertThat(codeFallback).startsWith("csv-book-");
    }

    @Test
    @DisplayName("Category mapping maps CSV categories to frontend supported category IDs")
    void testCategoryMapping() {
        assertThat(importer.mapToFrontendCategory("Computer Science")).isEqualTo("ai-computing");
        assertThat(importer.mapToFrontendCategory("AI & Data Science")).isEqualTo("ai-computing");
        assertThat(importer.mapToFrontendCategory("Mathematics & Basic Sciences")).isEqualTo("science-nature");
        assertThat(importer.mapToFrontendCategory("Electrical Engineering")).isEqualTo("science-nature");
        assertThat(importer.mapToFrontendCategory("Mechanical Engineering")).isEqualTo("science-nature");
        assertThat(importer.mapToFrontendCategory("Civil Engineering")).isEqualTo("science-nature");
        assertThat(importer.mapToFrontendCategory("Chemical Engineering")).isEqualTo("science-nature");
        assertThat(importer.mapToFrontendCategory("UPSC Preparation")).isEqualTo("economics-society");
        assertThat(importer.mapToFrontendCategory("SSC Preparation")).isEqualTo("economics-society");
        assertThat(importer.mapToFrontendCategory("Philosophy")).isEqualTo("philosophy");
        assertThat(importer.mapToFrontendCategory("Classical-Lit")).isEqualTo("classical-lit");
    }

    @Test
    @DisplayName("Deterministic call numbers are generated based on category, record ID, and author")
    void testCallNumberGeneration() {
        when(bookRepository.existsByCallNumber(anyString())).thenReturn(false);

        String callNumCS = importer.generateCallNumber("Computer Science", 1L, "Thomas H. Cormen");
        assertThat(callNumCS).isEqualTo("QA76.73 .C01 #001");

        String callNumEE = importer.generateCallNumber("Electrical Engineering", 25L, "B. L. Theraja");
        assertThat(callNumEE).isEqualTo("TK145 .T25 #025");

        String callNumUPSC = importer.generateCallNumber("UPSC Preparation", 91L, "Ramesh Singh");
        assertThat(callNumUPSC).isEqualTo("JQ215 .S91 #091");
    }

    @Test
    @DisplayName("Import correctly maps record fields and leaves unverified optional fields null")
    void testRecordMappingFields() {
        BookDatasetRecord record = new BookDatasetRecord(
                10L,
                "Operating Systems: Internals and Design Principles",
                "William Stallings",
                "Pearson",
                "9780133805918",
                "2018",
                "Computer Science",
                "Operating Systems",
                "GATE CSE",
                "English",
                "A comprehensive exploration of modern operating system concepts.",
                "https://example.com/os-cover.jpg",
                "Open Library",
                "https://openlibrary.org/search",
                "Verified starter record"
        );

        when(bookRepository.existsByCode(anyString())).thenReturn(false);
        when(bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCase(anyString(), anyString())).thenReturn(false);
        when(bookRepository.existsByCallNumber(anyString())).thenReturn(false);

        BookDatasetImportResult result = importer.importRecords(List.of(record));

        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.skippedCount()).isEqualTo(0);
        assertThat(result.rejectedCount()).isEqualTo(0);

        ArgumentCaptor<Book> bookCaptor = ArgumentCaptor.forClass(Book.class);
        verify(bookRepository, times(1)).save(bookCaptor.capture());

        Book saved = bookCaptor.getValue();
        assertThat(saved.getCode()).isEqualTo("csv-book-10");
        assertThat(saved.getTitle()).isEqualTo("Operating Systems: Internals and Design Principles");
        assertThat(saved.getAuthor()).isEqualTo("William Stallings");
        assertThat(saved.getCategory()).isEqualTo("ai-computing");
        assertThat(saved.getCategoryLabel()).isEqualTo("Computer Science");
        assertThat(saved.getPublicationYear()).isEqualTo(2018);
        assertThat(saved.getTotalCopies()).isEqualTo(3);
        assertThat(saved.getCopiesAvailable()).isEqualTo(3);
        assertThat(saved.getCoverImage()).isEqualTo("https://example.com/os-cover.jpg");
        assertThat(saved.getSynopsis()).isEqualTo("A comprehensive exploration of modern operating system concepts.");
        assertThat(saved.getTags()).isEqualTo("Operating Systems, GATE CSE");

        // Strictly verify that ratings and reviews are NOT fabricated
        assertThat(saved.getRating()).isNull();
        assertThat(saved.getReviewsCount()).isNull();
        assertThat(saved.getPages()).isNull();
        assertThat(saved.getSubtitle()).isNull();
        assertThat(saved.getAuthorRole()).isNull();
        assertThat(saved.getCuratorQuote()).isNull();
    }

    @Test
    @DisplayName("Deduplication: existing code is safely skipped")
    void testDeduplicationByCode() {
        BookDatasetRecord record = new BookDatasetRecord(
                1L, "Title 1", "Author 1", "Publisher", null, null,
                "Computer Science", null, null, "English", null, null, null, null, null
        );

        when(bookRepository.existsByCode("csv-book-1")).thenReturn(true);

        BookDatasetImportResult result = importer.importRecords(List.of(record));
        assertThat(result.importedCount()).isEqualTo(0);
        assertThat(result.skippedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isEqualTo(0);
        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deduplication: existing title and author is safely skipped")
    void testDeduplicationByTitleAndAuthor() {
        BookDatasetRecord record = new BookDatasetRecord(
                96L,
                "A Modern Approach to Verbal & Non-Verbal Reasoning",
                "R. S. Aggarwal",
                "S. Chand Publishing",
                null, null, "UPSC Preparation", null, null, "English", null, null, null, null, null
        );

        when(bookRepository.existsByCode("csv-book-96")).thenReturn(false);
        when(bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCase(
                "A Modern Approach to Verbal & Non-Verbal Reasoning", "R. S. Aggarwal")).thenReturn(true);

        BookDatasetImportResult result = importer.importRecords(List.of(record));
        assertThat(result.importedCount()).isEqualTo(0);
        assertThat(result.skippedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isEqualTo(0);
        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejection: titles exceeding 200 chars or authors exceeding 150 chars are rejected")
    void testRejectionOnLengthLimits() {
        String overlongTitle = "A".repeat(201);
        String overlongAuthor = "B".repeat(151);

        BookDatasetRecord badTitle = new BookDatasetRecord(
                1L, overlongTitle, "Valid Author", "Publisher", null, null,
                "Computer Science", null, null, "English", null, null, null, null, null
        );
        BookDatasetRecord badAuthor = new BookDatasetRecord(
                2L, "Valid Title", overlongAuthor, "Publisher", null, null,
                "Computer Science", null, null, "English", null, null, null, null, null
        );

        BookDatasetImportResult result = importer.importRecords(List.of(badTitle, badAuthor));
        assertThat(result.importedCount()).isEqualTo(0);
        assertThat(result.skippedCount()).isEqualTo(0);
        assertThat(result.rejectedCount()).isEqualTo(2);
        assertThat(result.rejectionReasons()).hasSize(2);
        assertThat(result.rejectionReasons().get(0)).contains("title exceeds 200 characters");
        assertThat(result.rejectionReasons().get(1)).contains("author exceeds 150 characters");
        verify(bookRepository, never()).save(any());
    }
}

