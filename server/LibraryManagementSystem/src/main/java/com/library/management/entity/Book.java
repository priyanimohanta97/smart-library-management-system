package com.library.management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "subtitle", length = 300)
    private String subtitle;

    @Column(name = "author", nullable = false, length = 150)
    private String author;

    @Column(name = "author_role", length = 150)
    private String authorRole;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "category_label", length = 80)
    private String categoryLabel;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "curator_quote", length = 500)
    private String curatorQuote;

    @Column(name = "call_number", nullable = false, length = 60)
    private String callNumber;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "rating")
    private Double rating = 4.8;

    @Column(name = "reviews_count")
    private Integer reviewsCount = 100;

    @Column(name = "pages")
    private Integer pages = 300;

    @Column(name = "total_copies", nullable = false)
    private int totalCopies = 1;

    @Column(name = "copies_available", nullable = false)
    private int copiesAvailable = 1;

    @Column(name = "synopsis", length = 2000)
    private String synopsis;

    @Column(name = "tags", length = 500)
    private String tags;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Book() {
    }

    public Book(String code, String title, String author, String category, String callNumber, int totalCopies) {
        this.code = code;
        this.title = title;
        this.author = author;
        this.category = category;
        this.callNumber = callNumber;
        this.totalCopies = totalCopies;
        this.copiesAvailable = totalCopies;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getStatusString() {
        return this.copiesAvailable > 0 ? "Available" : "Checked Out";
    }

    public void decrementCopiesAvailable() {
        if (this.copiesAvailable <= 0) {
            throw new IllegalStateException("Cannot decrement: no copies available for book " + this.title);
        }
        this.copiesAvailable--;
    }

    public void incrementCopiesAvailable() {
        if (this.copiesAvailable >= this.totalCopies) {
            this.copiesAvailable = this.totalCopies;
            return;
        }
        this.copiesAvailable++;
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

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
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

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Book book)) return false;
        return Objects.equals(id, book.id) && Objects.equals(code, book.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code);
    }
}

