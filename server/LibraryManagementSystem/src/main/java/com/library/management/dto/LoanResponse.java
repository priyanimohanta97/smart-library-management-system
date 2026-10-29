package com.library.management.dto;

import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;

import java.time.Instant;

public class LoanResponse {

    private Long id;
    private Long bookId;
    private String bookCode;
    private String bookTitle;
    private String bookAuthor;
    private String bookCallNumber;
    private String bookLocation;
    private String bookCoverImage;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LoanStatus status;
    private Instant requestDate;
    private Instant issueDate;
    private Instant dueDate;
    private Instant returnDate;
    private String approvedByName;
    private String rejectionReason;
    private String notes;
    private boolean overdue;

    public LoanResponse() {
    }

    public static LoanResponse fromEntity(Loan loan, Instant now) {
        if (loan == null) return null;
        LoanResponse dto = new LoanResponse();
        dto.setId(loan.getId());
        if (loan.getBook() != null) {
            dto.setBookId(loan.getBook().getId());
            dto.setBookCode(loan.getBook().getCode());
            dto.setBookTitle(loan.getBook().getTitle());
            dto.setBookAuthor(loan.getBook().getAuthor());
            dto.setBookCallNumber(loan.getBook().getCallNumber());
            dto.setBookLocation(loan.getBook().getLocation());
            dto.setBookCoverImage(loan.getBook().getCoverImage());
        }
        if (loan.getUser() != null) {
            dto.setStudentId(loan.getUser().getId());
            dto.setStudentName(loan.getUser().getFullName());
            dto.setStudentEmail(loan.getUser().getEmail());
        }
        dto.setStatus(loan.getStatus());
        dto.setRequestDate(loan.getRequestDate());
        dto.setIssueDate(loan.getIssueDate());
        dto.setDueDate(loan.getDueDate());
        dto.setReturnDate(loan.getReturnDate());
        if (loan.getApprovedBy() != null) {
            dto.setApprovedByName(loan.getApprovedBy().getFullName());
        }
        dto.setRejectionReason(loan.getRejectionReason());
        dto.setNotes(loan.getNotes());
        dto.setOverdue(loan.isOverdue(now));
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookCode() {
        return bookCode;
    }

    public void setBookCode(String bookCode) {
        this.bookCode = bookCode;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public String getBookCallNumber() {
        return bookCallNumber;
    }

    public void setBookCallNumber(String bookCallNumber) {
        this.bookCallNumber = bookCallNumber;
    }

    public String getBookLocation() {
        return bookLocation;
    }

    public void setBookLocation(String bookLocation) {
        this.bookLocation = bookLocation;
    }

    public String getBookCoverImage() {
        return bookCoverImage;
    }

    public void setBookCoverImage(String bookCoverImage) {
        this.bookCoverImage = bookCoverImage;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
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

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
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

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }
}

