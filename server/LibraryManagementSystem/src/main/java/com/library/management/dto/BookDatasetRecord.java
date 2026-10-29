package com.library.management.dto;

/**
 * Immutable DTO representing a raw row parsed from the starter book dataset CSV.
 */
public record BookDatasetRecord(
    Long recordId,
    String title,
    String authors,
    String publisher,
    String isbn,
    String publicationYear,
    String category,
    String subject,
    String examType,
    String language,
    String description,
    String coverImageUrl,
    String sourceName,
    String sourceSearchUrl,
    String metadataNote
) {}

