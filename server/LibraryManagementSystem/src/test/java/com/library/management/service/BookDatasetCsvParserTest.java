package com.library.management.service;

import com.library.management.dto.BookDatasetRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BookDatasetCsvParserTest {

    private BookDatasetCsvParser parser;

    @BeforeEach
    void setUp() {
        parser = new BookDatasetCsvParser();
    }

    @Test
    @DisplayName("ParseLine correctly handles unquoted tokens")
    void testParseLineUnquoted() {
        String line = "1,Operating Systems,Silberschatz,Wiley,1234567890,2020,Computer Science,OS,GATE,English,A good OS book,https://cover.jpg,OpenLibrary,https://url,Note";
        List<String> tokens = parser.parseLine(line);

        assertThat(tokens).hasSize(15);
        assertThat(tokens.get(0)).isEqualTo("1");
        assertThat(tokens.get(1)).isEqualTo("Operating Systems");
        assertThat(tokens.get(2)).isEqualTo("Silberschatz");
        assertThat(tokens.get(6)).isEqualTo("Computer Science");
    }

    @Test
    @DisplayName("ParseLine correctly handles commas inside quoted fields and escaped quotes")
    void testParseLineQuotedAndEscaped() {
        String line = "95,\"Ethics, Integrity and Aptitude\",\"Subba Rao; P. N. \"\"Roy\"\" Chowdhury\",,,,\"UPSC Preparation\",Ethics,UPSC CSE,English,,,Source,https://url,\"Note with, commas and; semicolons.\"";
        List<String> tokens = parser.parseLine(line);

        assertThat(tokens).hasSize(15);
        assertThat(tokens.get(0)).isEqualTo("95");
        assertThat(tokens.get(1)).isEqualTo("Ethics, Integrity and Aptitude");
        assertThat(tokens.get(2)).isEqualTo("Subba Rao; P. N. \"Roy\" Chowdhury");
        assertThat(tokens.get(6)).isEqualTo("UPSC Preparation");
        assertThat(tokens.get(14)).isEqualTo("Note with, commas and; semicolons.");
    }

    @Test
    @DisplayName("Parser rejects CSV missing required headers")
    void testMissingRequiredHeader() throws Exception {
        String badHeaderCsv = "record_id,wrong_title,authors,wrong_category\n1,Algorithms,Cormen,CS\n";
        try (InputStream is = new ByteArrayInputStream(badHeaderCsv.getBytes(StandardCharsets.UTF_8))) {
            BookDatasetCsvParser.ParseResult result = parser.parse(is);
            assertThat(result.records()).isEmpty();
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("Missing required CSV header column"));
        }
    }

    @Test
    @DisplayName("Parser skips and logs rows with missing required fields or invalid record_id")
    void testMalformedRows() throws Exception {
        String csv = """
                record_id,title,authors,publisher,isbn,publication_year,category,subject,exam_type,language,description,cover_image_url,source_name,source_search_url,metadata_note
                1,,Author One,,,,Computer Science,,,,,,,,
                not-a-number,Valid Title,Author Two,,,,Computer Science,,,,,,,,
                3,Title Three,,,,,Computer Science,,,,,,,,
                4,Title Four,Author Four,,,,,,,,,,,,
                5,Title Five,Author Five,,,,Computer Science,,
                6,Valid Title,Valid Author,,,,Computer Science,,,,,,,,
                """;

        try (InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8))) {
            BookDatasetCsvParser.ParseResult result = parser.parse(is);
            // Only line with record_id=6 is completely valid
            assertThat(result.records()).hasSize(1);
            assertThat(result.records().get(0).title()).isEqualTo("Valid Title");
            assertThat(result.parseErrors()).hasSize(5);
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("missing required field 'title'"));
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("invalid non-numeric record_id"));
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("missing required field 'authors'"));
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("missing required field 'category'"));
            assertThat(result.parseErrors()).anyMatch(e -> e.contains("column count mismatch"));
        }
    }

    @Test
    @DisplayName("Parser successfully reads the complete starter dataset file from classpath")
    void testParseRealStarterDatasetFromClasspath() throws Exception {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("data/library_real_books_starter_dataset.csv")) {
            assertThat(is).as("Starter dataset CSV must be present in classpath resources").isNotNull();
            BookDatasetCsvParser.ParseResult result = parser.parse(is);

            assertThat(result.parseErrors()).isEmpty();
            assertThat(result.records()).hasSize(104);

            BookDatasetRecord first = result.records().get(0);
            assertThat(first.recordId()).isEqualTo(1L);
            assertThat(first.title()).isEqualTo("Introduction to Algorithms");
            assertThat(first.authors()).contains("Thomas H. Cormen");
            assertThat(first.category()).isEqualTo("Computer Science");

            BookDatasetRecord last = result.records().get(103);
            assertThat(last.recordId()).isEqualTo(104L);
            assertThat(last.title()).isEqualTo("Objective Computer Awareness");
            assertThat(last.authors()).isEqualTo("Arihant Experts");
            assertThat(last.category()).isEqualTo("SSC Preparation");
        }
    }
}

