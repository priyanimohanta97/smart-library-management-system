package com.library.management.dto;

import java.util.Collections;
import java.util.List;

/**
 * Encapsulates the results of a dataset import execution.
 */
public record BookDatasetImportResult(
    int totalRead,
    int importedCount,
    int skippedCount,
    int rejectedCount,
    List<String> rejectionReasons
) {
    public BookDatasetImportResult {
        if (rejectionReasons == null) {
            rejectionReasons = Collections.emptyList();
        } else {
            rejectionReasons = List.copyOf(rejectionReasons);
        }
    }
}

