package com.library.management.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Objects;

@Document(collection = "loans")
public class Loan {

    @Id
    private String id;

    @DocumentReference
    private User user;

    @DocumentReference
    private Book book;

    @Field("status")
    private LoanStatus status = LoanStatus.PENDING;

    @Field("request_date")
    private Instant requestDate = Instant.now();

    @Field("issue_date")
    private Instant issueDate;

    @Field("due_date")
    private Instant dueDate;

    @Field("return_date")
    private Instant returnDate;

    @DocumentReference
    private User approvedBy;

    @Field("rejection_reason")
    private String rejectionReason;

    @Field("notes")
    private String notes;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("updated_at")
    private Instant updatedAt = Instant.now();

    public Loan() {
    }

    public Loan(User user, Book book) {
        this(user, book, null);
    }

    public Loan(User user, Book book, String notes) {
        this.user = user;
        this.book = book;
        this.notes = notes;
        this.status = LoanStatus.PENDING;
        this.requestDate = Instant.now();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isOverdue(Instant now) {
        return this.status == LoanStatus.ISSUED && this.dueDate != null && now.isAfter(this.dueDate);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public LoanStatus getStatus() {
        return status;
    }

    public void setStatus(LoanStatus status) {
        this.status = status;
    }

    public Instant getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(Instant requestDate) {
        this.requestDate = requestDate;
    }

    public Instant getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Instant issueDate) {
        this.issueDate = issueDate;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Instant returnDate) {
        this.returnDate = returnDate;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
        if (!(o instanceof Loan loan)) return false;
        return Objects.equals(id, loan.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
