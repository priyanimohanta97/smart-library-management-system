package com.library.management.dto;

import com.library.management.entity.Book;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class BookResponse {

    private Long id;
    private String code;
    private String title;
    private String subtitle;
    private String author;
    private String authorRole;
    private Integer year;
    private String category;
    private String categoryLabel;
    private String coverImage;
    private String curatorQuote;
    private String callNumber;
    private String location;
    private Double rating;
    private Integer reviewsCount;
    private Integer pages;
    private int totalCopies;
    private int copiesAvailable;
    private String status;
    private String synopsis;
    private List<String> tags;

    public BookResponse() {
    }

    public static BookResponse fromEntity(Book book) {
        if (book == null) return null;
        BookResponse dto = new BookResponse();
        dto.setId(book.getId());
        dto.setCode(book.getCode());
        dto.setTitle(book.getTitle());
        dto.setSubtitle(book.getSubtitle());
        dto.setAuthor(book.getAuthor());
        dto.setAuthorRole(book.getAuthorRole());
        dto.setYear(book.getPublicationYear());
        dto.setCategory(book.getCategory());
        dto.setCategoryLabel(book.getCategoryLabel() != null ? book.getCategoryLabel() : book.getCategory());
        dto.setCoverImage(book.getCoverImage());
        dto.setCuratorQuote(book.getCuratorQuote());
        dto.setCallNumber(book.getCallNumber());
        dto.setLocation(book.getLocation());
        dto.setRating(book.getRating());
        dto.setReviewsCount(book.getReviewsCount());
        dto.setPages(book.getPages());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setCopiesAvailable(book.getCopiesAvailable());
        dto.setStatus(book.getStatusString());
        dto.setSynopsis(book.getSynopsis());

        if (book.getTags() != null && !book.getTags().trim().isEmpty()) {
            dto.setTags(Arrays.stream(book.getTags().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
        } else {
            dto.setTags(Collections.emptyList());
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel) {
        this.categoryLabel = categoryLabel;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCuratorQuote() {
        return curatorQuote;
    }

    public void setCuratorQuote(String curatorQuote) {
        this.curatorQuote = curatorQuote;
    }

    public String getCallNumber() {
        return callNumber;
    }

    public void setCallNumber(String callNumber) {
        this.callNumber = callNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public Integer getPages() {
        return pages;
    }

    public void setPages(Integer pages) {
        this.pages = pages;
    }

    public int getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(int totalCopies) {
        this.totalCopies = totalCopies;
    }

    public int getCopiesAvailable() {
        return copiesAvailable;
    }

    public void setCopiesAvailable(int copiesAvailable) {
        this.copiesAvailable = copiesAvailable;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}

