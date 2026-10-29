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
            BorrowingPolicyConfig borrowingPolicyConfig
    ) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.borrowingPolicyConfig = borrowingPolicyConfig;
    }

    @Override
    @Transactional
    public LoanResponse requestLoan(LoanRequestDto dto, User student) {
        if (student == null) {
            throw new AccessDeniedException("Authentication required to submit book loan request.");
        }

        // 1. Lock student user record using row-level pessimistic write lock (SELECT ... FOR UPDATE)
        // to strictly serialize capacity counting and duplicate checks across concurrent requests
        User lockedStudent = userRepository.findByIdForUpdate(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found with id: " + student.getId()));

        long activeCount = loanRepository.countByUserAndStatusIn(lockedStudent, ACTIVE_STATUSES);
        if (activeCount >= borrowingPolicyConfig.getMaxActiveLoans()) {
            throw new LoanOperationException(
                    "Borrowing capacity reached: maximum of " + borrowingPolicyConfig.getMaxActiveLoans() +
                    " combined active loans and pending requests permitted."
            );
        }

        // 2. Validate book existence
        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));

        // 3. Prevent duplicate active loans or pending requests for the same book
        if (loanRepository.existsByUserAndBookAndStatusIn(lockedStudent, book, ACTIVE_STATUSES)) {
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
        Loan loan = new Loan(lockedStudent, book, dto.getNotes());
        loan = loanRepository.save(loan);

        // 6. Notify librarians in the same transaction
        notificationService.notifyLibrarians(
                "New Book Loan Request",
                lockedStudent.getFullName() + " requested a loan for '" + book.getTitle() + "'.",
                NotificationType.LOAN_REQUEST,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, Instant.now());
    }

    @Override
    @Transactional
    public LoanResponse approveLoan(Long loanId, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new LoanOperationException("Cannot approve loan: current status is " + loan.getStatus() + ". Only PENDING requests can be approved.");
        }

        // Lock student user row first to serialize capacity re-check across concurrent approvals
        User student = loan.getUser();
        if (student != null) {
            userRepository.findByIdForUpdate(student.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student user not found with id: " + student.getId()));
        }

        // Recheck student capacity without double-counting the current loan being approved
        long otherActiveCount = loanRepository.countByUserAndStatusInAndIdNot(student, ACTIVE_STATUSES, loanId);
        if (otherActiveCount >= borrowingPolicyConfig.getMaxActiveLoans()) {
            throw new LoanOperationException(
                    "Approval failed: Student has reached the borrowing capacity limit (" +
                    borrowingPolicyConfig.getMaxActiveLoans() + " active/pending loans)."
            );
        }

        // Concurrency Lock: Acquire row-level pessimistic write lock on Book (SELECT ... FOR UPDATE)
        final Long targetBookId = loan.getBook().getId();
        Book book = bookRepository.findByIdForUpdate(targetBookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + targetBookId));

        if (book.getCopiesAvailable() <= 0) {
            throw new LoanOperationException(
                    "Approval failed: No physical copies available in inventory for '" + book.getTitle() + "'."
            );
        }

        // Atomically decrement inventory
        book.decrementCopiesAvailable();
        bookRepository.save(book);

        // Update loan record
        Instant now = Instant.now();
        loan.setStatus(LoanStatus.ISSUED);
        loan.setIssueDate(now);
        loan.setDueDate(now.plus(Duration.ofDays(borrowingPolicyConfig.getLoanDurationDays())));
        loan.setApprovedBy(librarian);
        loan = loanRepository.save(loan);

        // Co-located notification to the student
        notificationService.sendNotification(
                loan.getUser(),
                "Loan Request Approved",
                "Your loan request for '" + book.getTitle() + "' was approved. Please collect it from " +
                (book.getLocation() != null ? book.getLocation() : "the main circulation desk") + ".",
                NotificationType.LOAN_APPROVED,
                loan.getId()
        );

        return LoanResponse.fromEntity(loan, now);
    }

    @Override
    @Transactional
    public LoanResponse rejectLoan(Long loanId, RejectLoanDto dto, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new LoanOperationException("Cannot reject loan: current status is " + loan.getStatus() + ". Only PENDING requests can be rejected.");
        }

        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectionReason(dto.getReason());
        loan.setApprovedBy(librarian);
        loan = loanRepository.save(loan);

        // Co-located notification to the student
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
    public LoanResponse requestReturn(Long loanId, User student) {
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
    public LoanResponse confirmReturn(Long loanId, User librarian) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() != LoanStatus.RETURN_PENDING && loan.getStatus() != LoanStatus.ISSUED) {
            throw new LoanOperationException("Cannot confirm return: loan is currently in status " + loan.getStatus() + ". Expected RETURN_PENDING or ISSUED.");
        }

        // Concurrency Lock: Lock book row before incrementing inventory
        final Long targetBookId = loan.getBook().getId();
        Book book = bookRepository.findByIdForUpdate(targetBookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + targetBookId));

        book.incrementCopiesAvailable();
        bookRepository.save(book);

        Instant now = Instant.now();
        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnDate(now);
        loan = loanRepository.save(loan);

        // Co-located notification to the student
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
