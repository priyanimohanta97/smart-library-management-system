package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Objects;

@Document(collection = "books")
public class Book {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("code")
    private String code;

    @Field("title")
    private String title;

    @Field("subtitle")
    private String subtitle;

    @Field("author")
    private String author;

    @Field("author_role")
    private String authorRole;

    @Field("publication_year")
    private Integer publicationYear;

    @Indexed
    @Field("category")
    private String category;

    @Field("category_label")
    private String categoryLabel;

    @Field("cover_image")
    private String coverImage;

    @Field("curator_quote")
    private String curatorQuote;

    @Field("call_number")
    private String callNumber;

    @Field("location")
    private String location;

    @Field("rating")
    private Double rating;

    @Field("reviews_count")
    private Integer reviewsCount;

    @Field("pages")
    private Integer pages;

    @Field("total_copies")
    private int totalCopies = 1;

    @Field("copies_available")
    private int copiesAvailable = 1;

    @Field("synopsis")
    private String synopsis;

    @Field("tags")
    private String tags;

    @Version
    private Long version;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("updated_at")
    private Instant updatedAt = Instant.now();

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
        this.createdAt = Instant.now();
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
        this.updatedAt = Instant.now();
    }

    public void incrementCopiesAvailable() {
        if (this.copiesAvailable >= this.totalCopies) {
            this.copiesAvailable = this.totalCopies;
            this.updatedAt = Instant.now();
            return;
        }
        this.copiesAvailable++;
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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
