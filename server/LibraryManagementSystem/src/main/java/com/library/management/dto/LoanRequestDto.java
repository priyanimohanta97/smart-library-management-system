package com.library.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoanRequestDto {

    @NotBlank(message = "Book ID is required")
    private String bookId;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public LoanRequestDto() {
    }

    public LoanRequestDto(String bookId, String notes) {
        this.bookId = bookId;
        this.notes = notes;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
