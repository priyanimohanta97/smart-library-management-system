package com.library.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BookCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 150, message = "Author cannot exceed 150 characters")
    private String author;

    @NotBlank(message = "Category is required")
    private String category;

    @Size(max = 100, message = "Call number cannot exceed 100 characters")
    private String callNumber;

    @Min(value = 1, message = "Total copies must be at least 1")
    private Integer totalCopies;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @Size(max = 2000, message = "Synopsis cannot exceed 2000 characters")
    private String synopsis;

    private Integer publicationYear;

    public BookCreateRequest() {
    }

    public BookCreateRequest(String title, String author, String category) {
        this.title = title;
        this.author = author;
        this.category = category;
    }

    public BookCreateRequest(String title, String author, String category, String callNumber, Integer totalCopies) {
        this.title = title;
        this.author = author;
        this.category = category;
        this.callNumber = callNumber;
        this.totalCopies = totalCopies;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCallNumber() {
        return callNumber;
    }

    public void setCallNumber(String callNumber) {
        this.callNumber = callNumber;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }
}

