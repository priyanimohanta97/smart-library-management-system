package com.library.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LoanRequestDto {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public LoanRequestDto() {
    }

    public LoanRequestDto(Long bookId, String notes) {
        this.bookId = bookId;
        this.notes = notes;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

