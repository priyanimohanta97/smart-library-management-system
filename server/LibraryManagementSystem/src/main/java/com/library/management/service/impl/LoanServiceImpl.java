package com.library.management.service.impl;

import com.library.management.config.BorrowingPolicyConfig;
import com.library.management.dto.CirculationStatsResponse;
import com.library.management.dto.LoanRequestDto;
import com.library.management.dto.LoanResponse;
import com.library.management.dto.RejectLoanDto;
import com.library.management.entity.Book;
import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;
import com.library.management.entity.NotificationType;
import com.library.management.entity.User;
import com.library.management.exception.LoanOperationException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookRepository;
import com.library.management.repository.LoanRepository;
import com.library.management.repository.UserRepository;
import com.library.management.service.LoanService;
import com.library.management.service.NotificationService;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BorrowingPolicyConfig borrowingPolicyConfig;
    private final MongoTemplate mongoTemplate;

    private static final List<LoanStatus> ACTIVE_STATUSES = List.of(
            LoanStatus.PENDING,
            LoanStatus.ISSUED,
            LoanStatus.RETURN_PENDING
    );

    public LoanServiceImpl(
            LoanRepository loanRepository,
            BookRepository bookRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            BorrowingPolicyConfig borrowingPolicyConfig,
            MongoTemplate mongoTemplate
    ) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.borrowingPolicyConfig = borrowingPolicyConfig;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    @Transactional
    public LoanResponse requestLoan(LoanRequestDto dto, User student) {
        if (student == null) {
            throw new AccessDeniedException("Authentication required to submit book loan request.");
        }

        // 1. Verify student exists
        User currentStudent = userRepository.findById(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found with id: " + student.getId()));

        Loan loan;
        Book book;
        // Synchronize per student to protect capacity limit invariant against concurrent requests
        synchronized (("loan-student-" + currentStudent.getId()).intern()) {
            long activeCount = loanRepository.countByUserAndStatusIn(currentStudent, ACTIVE_STATUSES);
            if (activeCount >= borrowingPolicyConfig.getMaxActiveLoans()) {
                throw new LoanOperationException(
                        "Borrowing capacity reached: maximum of " + borrowingPolicyConfig.getMaxActiveLoans() +
                        " combined active loans and pending requests permitted."
                );
            }

            // 2. Validate book existence
            book = bookRepository.findById(dto.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));

            // 3. Prevent duplicate active loans or pending requests for the same book
            if (loanRepository.existsByUserAndBookAndStatusIn(currentStudent, book, ACTIVE_STATUSES)) {
                throw new LoanOperationException(
                        "You already have an active loan or pending request for '" + book.getTitle() + "'.", 409
                );
            }

            // 4. Validate initial inventory availability
            if (book.getCopiesAvailable() <= 0) {
                throw new LoanOperationException(
                        "No physical copies currently available for '" + book.getTitle() + "' in the library stacks.", 400
                );
            }

            // 5. Persist Loan in PENDING status
            loan = new Loan(currentStudent, book, dto.getNotes());
            loan = loanRepository.save(loan);
        }

        // 6. Notify librarians in the same flow
        notificationService.notifyLibrarians(
                "New Book Loan Request",
                currentStudent.getFullName() + " requested a loan for '" + book.getTitle() + "'.",
                NotificationType.LOAN_REQUEST,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, Instant.now());
    }

    @Override
    @Transactional
    public LoanResponse approveLoan(String loanId, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new LoanOperationException("Cannot approve loan: current status is " + loan.getStatus() + ". Only PENDING requests can be approved.");
        }

        // Recheck student capacity without double-counting the current loan being approved
        User student = loan.getUser();
        if (student != null) {
            userRepository.findById(student.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student user not found with id: " + student.getId()));

            synchronized (("loan-student-" + student.getId()).intern()) {
                long otherActiveCount = loanRepository.countByUserAndStatusInAndIdNot(student, ACTIVE_STATUSES, loanId);
                if (otherActiveCount >= borrowingPolicyConfig.getMaxActiveLoans()) {
                    throw new LoanOperationException(
                            "Approval failed: Student has reached the borrowing capacity limit (" +
                            borrowingPolicyConfig.getMaxActiveLoans() + " active/pending loans)."
                    );
                }
            }
        }

        // Concurrency Guard: Atomic inventory decrement via MongoDB findAndModify with copiesAvailable > 0
        final String targetBookId = loan.getBook().getId();
        Query query = new Query(Criteria.where("_id").is(targetBookId).and("copiesAvailable").gt(0));
        Update update = new Update().inc("copiesAvailable", -1);
        Book updatedBook = mongoTemplate.findAndModify(query, update, FindAndModifyOptions.options().returnNew(true), Book.class);

        if (updatedBook == null) {
            if (!bookRepository.existsById(targetBookId)) {
                throw new ResourceNotFoundException("Book not found with id: " + targetBookId);
            }
            throw new LoanOperationException(
                    "Approval failed: No physical copies available in inventory for '" + loan.getBook().getTitle() + "'."
            );
        }

        // Update loan record with inventory compensation on persistence failure
        Instant now = Instant.now();
        try {
            loan.setStatus(LoanStatus.ISSUED);
            loan.setIssueDate(now);
            loan.setDueDate(now.plus(Duration.ofDays(borrowingPolicyConfig.getLoanDurationDays())));
            loan.setApprovedBy(librarian);
            loan = loanRepository.save(loan);
        } catch (Exception ex) {
            // Compensate inventory decrement if loan persistence fails
            Query revertQuery = new Query(Criteria.where("_id").is(targetBookId));
            Update revertUpdate = new Update().inc("copiesAvailable", 1);
            mongoTemplate.findAndModify(revertQuery, revertUpdate, Book.class);
            throw ex;
        }

        // Notification to the student
        notificationService.sendNotification(
                loan.getUser(),
                "Loan Request Approved",
                "Your loan request for '" + updatedBook.getTitle() + "' was approved. Please collect it from " +
                (updatedBook.getLocation() != null ? updatedBook.getLocation() : "the main circulation desk") + ".",
                NotificationType.LOAN_APPROVED,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, now);
    }

    @Override
    @Transactional
    public LoanResponse rejectLoan(String loanId, RejectLoanDto dto, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new LoanOperationException("Cannot reject loan: current status is " + loan.getStatus() + ". Only PENDING requests can be rejected.");
        }

        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectionReason(dto.getReason());
        loan.setApprovedBy(librarian);
        loan = loanRepository.save(loan);

        // Notification to the student
        notificationService.sendNotification(
                loan.getUser(),
                "Loan Request Declined",
                "Your loan request for '" + loan.getBook().getTitle() + "' was declined. Reason: " + dto.getReason(),
                NotificationType.LOAN_REJECTED,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, Instant.now());
    }

    @Override
    @Transactional
    public LoanResponse requestReturn(String loanId, User student) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (!loan.getUser().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied: You can only request returns for your own loans.");
        }

        if (loan.getStatus() != LoanStatus.ISSUED) {
            throw new LoanOperationException("Cannot submit return request: loan is currently in status " + loan.getStatus() + ". Only active ISSUED books can be returned.");
        }

        loan.setStatus(LoanStatus.RETURN_PENDING);
        loan = loanRepository.save(loan);

        // Notify librarians
        notificationService.notifyLibrarians(
                "Book Return Submitted",
                student.getFullName() + " submitted a return request for '" + loan.getBook().getTitle() + "'. Please inspect at the circulation desk.",
                NotificationType.RETURN_REQUEST,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, Instant.now());
    }

    @Override
    @Transactional
    public LoanResponse confirmReturn(String loanId, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.RETURN_PENDING && loan.getStatus() != LoanStatus.ISSUED) {
            throw new LoanOperationException("Cannot confirm return: loan is currently in status " + loan.getStatus() + ". Expected RETURN_PENDING or ISSUED.");
        }

        // Concurrency Guard: Atomic inventory increment via MongoDB findAndModify
        final String targetBookId = loan.getBook().getId();
        Query query = new Query(Criteria.where("_id").is(targetBookId));
        Update update = new Update().inc("copiesAvailable", 1);
        Book book = mongoTemplate.findAndModify(query, update, FindAndModifyOptions.options().returnNew(true), Book.class);

        if (book == null) {
            throw new ResourceNotFoundException("Book not found with id: " + targetBookId);
        }

        Instant now = Instant.now();
        try {
            loan.setStatus(LoanStatus.RETURNED);
            loan.setReturnDate(now);
            loan = loanRepository.save(loan);
        } catch (Exception ex) {
            // Compensate inventory increment if loan persistence fails
            Query revertQuery = new Query(Criteria.where("_id").is(targetBookId));
            Update revertUpdate = new Update().inc("copiesAvailable", -1);
            mongoTemplate.findAndModify(revertQuery, revertUpdate, Book.class);
            throw ex;
        }

        // Notification to the student
        notificationService.sendNotification(
                loan.getUser(),
                "Book Return Confirmed",
                "Your return for '" + book.getTitle() + "' has been verified by the librarian. The loan is now closed.",
                NotificationType.RETURN_CONFIRMED,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, now);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponse> getStudentLoans(User student) {
        Instant now = Instant.now();
        return loanRepository.findByUserOrderByRequestDateDesc(student)
                .stream()
                .map(l -> LoanResponse.fromEntity(l, now))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponse> getPendingLoans() {
        Instant now = Instant.now();
        return loanRepository.findByStatusOrderByRequestDateAsc(LoanStatus.PENDING)
                .stream()
                .map(l -> LoanResponse.fromEntity(l, now))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponse> getPendingReturns() {
        Instant now = Instant.now();
        return loanRepository.findByStatusOrderByRequestDateAsc(LoanStatus.RETURN_PENDING)
                .stream()
                .map(l -> LoanResponse.fromEntity(l, now))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponse> getActiveLoans() {
        Instant now = Instant.now();
        return loanRepository.findByStatusInOrderByRequestDateDesc(List.of(LoanStatus.ISSUED, LoanStatus.RETURN_PENDING))
                .stream()
                .map(l -> LoanResponse.fromEntity(l, now))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CirculationStatsResponse getCirculationStats() {
        Instant now = Instant.now();
        long pendingRequests = loanRepository.countByStatus(LoanStatus.PENDING);
        long activeLoans = loanRepository.countByStatus(LoanStatus.ISSUED) + loanRepository.countByStatus(LoanStatus.RETURN_PENDING);
        long pendingReturns = loanRepository.countByStatus(LoanStatus.RETURN_PENDING);
        long overdueLoans = loanRepository.countOverdueLoans(now);

        List<Book> allBooks = bookRepository.findAll();
        long totalTitles = allBooks.size();
        long totalCopies = allBooks.stream().mapToLong(Book::getTotalCopies).sum();
        long availableCopies = allBooks.stream().mapToLong(Book::getCopiesAvailable).sum();

        return new CirculationStatsResponse(
                pendingRequests,
                activeLoans,
                pendingReturns,
                overdueLoans,
                totalTitles,
                totalCopies,
                availableCopies
        );
    }
}
