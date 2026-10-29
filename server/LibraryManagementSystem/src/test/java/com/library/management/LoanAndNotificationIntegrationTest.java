package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.config.BorrowingPolicyConfig;
import com.library.management.dto.LoanRequestDto;
import com.library.management.dto.RejectLoanDto;
import com.library.management.entity.Book;
import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;
import com.library.management.entity.Notification;
import com.library.management.entity.NotificationType;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.LoanRepository;
import com.library.management.repository.NotificationRepository;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtService;
import com.library.management.service.LoanService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LoanAndNotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private LoanService loanService;

    @Autowired
    private BorrowingPolicyConfig borrowingPolicyConfig;

    @Autowired
    private com.library.management.service.OverdueLoanScheduler overdueLoanScheduler;

    private User student1;
    private User student2;
    private User librarian;
    private String student1Token;
    private String student2Token;
    private String librarianToken;

    private Book testBookAvailable;
    private Book testBookSingleCopy;
    private Book testBookOutOfStock;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        student1 = new User("Alice Walker", "alice@vssut.ac.in", passwordEncoder.encode("secret123"), Role.USER);
        student1.setEnabled(true);
        student1 = userRepository.save(student1);
        student1Token = "Bearer " + jwtService.generateToken(student1.getEmail(), "USER", student1.getId(), student1.getFullName());

        student2 = new User("Bob Smith", "bob@vssut.ac.in", passwordEncoder.encode("secret123"), Role.USER);
        student2.setEnabled(true);
        student2 = userRepository.save(student2);
        student2Token = "Bearer " + jwtService.generateToken(student2.getEmail(), "USER", student2.getId(), student2.getFullName());

        librarian = new User("Head Librarian", "librarian@vssut.ac.in", passwordEncoder.encode("secret123"), Role.MANAGER);
        librarian.setEnabled(true);
        librarian = userRepository.save(librarian);
        librarianToken = "Bearer " + jwtService.generateToken(librarian.getEmail(), "MANAGER", librarian.getId(), librarian.getFullName());

        testBookAvailable = new Book("TEST-B01", "Structure and Interpretation", "Abelson & Sussman", "ai-computing", "QA76.6", 4);
        testBookAvailable.setSubtitle("Wizard Book");
        testBookAvailable.setCopiesAvailable(3);
        testBookAvailable = bookRepository.save(testBookAvailable);

        testBookSingleCopy = new Book("TEST-B02", "Single Copy Classic", "Author X", "philosophy", "B580", 1);
        testBookSingleCopy.setCopiesAvailable(1);
        testBookSingleCopy = bookRepository.save(testBookSingleCopy);

        testBookOutOfStock = new Book("TEST-B03", "Rare Manuscript", "Author Y", "classical-lit", "PG3476", 2);
        testBookOutOfStock.setCopiesAvailable(0);
        testBookOutOfStock = bookRepository.save(testBookOutOfStock);
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        notificationRepository.deleteAll();
        loanRepository.deleteAll();
        bookRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Borrowing policy config loads default limits correctly")
    void testBorrowingPolicyConfig() {
        assertThat(borrowingPolicyConfig.getMaxActiveLoans()).isEqualTo(4);
        assertThat(borrowingPolicyConfig.getLoanDurationDays()).isEqualTo(14);
    }

    @Test
    @DisplayName("Public catalogue browsing: GET /api/books succeeds without authentication")
    void testPublicBookBrowsing() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].status").exists());

        mockMvc.perform(get("/api/books/" + testBookAvailable.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("TEST-B01"))
                .andExpect(jsonPath("$.copiesAvailable").value(3))
                .andExpect(jsonPath("$.status").value("Available"));
    }

    @Test
    @DisplayName("Loan request requires authentication: unauthenticated returns 401")
    void testLoanRequestUnauthenticated() throws Exception {
        LoanRequestDto dto = new LoanRequestDto(testBookAvailable.getId(), "For thesis work");
        mockMvc.perform(post("/api/loans/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student submits loan request successfully: 201 Created and PENDING status")
    void testStudentLoanRequestSuccess() throws Exception {
        LoanRequestDto dto = new LoanRequestDto(testBookAvailable.getId(), "Need for research project");

        mockMvc.perform(post("/api/loans/request")
                        .header("Authorization", student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.bookId").value(testBookAvailable.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.studentName").value("Alice Walker"));

        // Verify notification sent to librarians
        List<Notification> notifications = notificationRepository.findAll();
        assertThat(notifications).anyMatch(n -> n.getType() == NotificationType.LOAN_REQUEST);
    }

    @Test
    @DisplayName("Duplicate active loan request for the same book returns 409 Conflict")
    void testDuplicateLoanRequestConflict() throws Exception {
        LoanRequestDto dto = new LoanRequestDto(testBookAvailable.getId(), "First request");

        mockMvc.perform(post("/api/loans/request")
                        .header("Authorization", student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        // Second request for the same book by the same student
        mockMvc.perform(post("/api/loans/request")
                        .header("Authorization", student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("already have an active loan or pending request")));
    }

    @Test
    @DisplayName("Borrowing capacity limit: 5th active/pending request is rejected with 400 Bad Request")
    void testBorrowingCapacityExceeded() throws Exception {
        // Create 4 active books and loans for student1 to reach max 4
        for (int i = 1; i <= 4; i++) {
            Book b = new Book("CAP-B0" + i, "Capacity Book " + i, "Author", "ai-computing", "C0" + i, 2);
            b = bookRepository.save(b);
            Loan loan = new Loan(student1, b);
            loan.setStatus(LoanStatus.ISSUED);
            loan.setIssueDate(Instant.now());
            loan.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
            loanRepository.save(loan);
        }

        // Student tries to request a 5th book
        LoanRequestDto dto = new LoanRequestDto(testBookAvailable.getId(), "Fifth request");
        mockMvc.perform(post("/api/loans/request")
                        .header("Authorization", student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Borrowing capacity reached")));
    }

    @Test
    @DisplayName("Librarian approvals: only MANAGER/ADMIN can access pending loans")
    void testLibrarianAccessSecurity() throws Exception {
        // Student token should return 403 Forbidden
        mockMvc.perform(get("/api/loans/pending")
                        .header("Authorization", student1Token))
                .andExpect(status().isForbidden());

        // Librarian token should succeed 200 OK
        mockMvc.perform(get("/api/loans/pending")
                        .header("Authorization", librarianToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Librarian approves loan: inventory decrements, status becomes ISSUED, due date set, notification dispatched")
    void testApproveLoanSuccess() throws Exception {
        Loan loan = new Loan(student1, testBookAvailable);
        loan.setStatus(LoanStatus.PENDING);
        loan = loanRepository.save(loan);

        int initialCopies = testBookAvailable.getCopiesAvailable();

        mockMvc.perform(post("/api/loans/" + loan.getId() + "/approve")
                        .header("Authorization", librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andExpect(jsonPath("$.dueDate").isNotEmpty())
                .andExpect(jsonPath("$.approvedByName").value("Head Librarian"));

        // Verify authoritative book copy count decremented
        Book updatedBook = bookRepository.findById(testBookAvailable.getId()).orElseThrow();
        assertThat(updatedBook.getCopiesAvailable()).isEqualTo(initialCopies - 1);

        // Verify student received notification
        List<Notification> studentNotifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(student1);
        assertThat(studentNotifications).isNotEmpty();
        assertThat(studentNotifications.get(0).getType()).isEqualTo(NotificationType.LOAN_APPROVED);
    }

    @Test
    @DisplayName("Librarian cannot approve loan when copiesAvailable is 0")
    void testApproveLoanOutOfStockFails() throws Exception {
        Loan loan = new Loan(student1, testBookOutOfStock);
        loan.setStatus(LoanStatus.PENDING);
        loan = loanRepository.save(loan);

        mockMvc.perform(post("/api/loans/" + loan.getId() + "/approve")
                        .header("Authorization", librarianToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("No physical copies available in inventory")));

        // Verify book inventory was not corrupted
        Book updatedBook = bookRepository.findById(testBookOutOfStock.getId()).orElseThrow();
        assertThat(updatedBook.getCopiesAvailable()).isEqualTo(0);
    }

    @Test
    @DisplayName("Librarian rejects loan: status becomes REJECTED, reason stored, notification dispatched")
    void testRejectLoanSuccess() throws Exception {
        Loan loan = new Loan(student1, testBookAvailable);
        loan.setStatus(LoanStatus.PENDING);
        loan = loanRepository.save(loan);

        RejectLoanDto rejectDto = new RejectLoanDto("Reserved for thesis research reserve desk");

        mockMvc.perform(post("/api/loans/" + loan.getId() + "/reject")
                        .header("Authorization", librarianToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Reserved for thesis research reserve desk"));

        // Verify book copy count was NOT decremented
        Book updatedBook = bookRepository.findById(testBookAvailable.getId()).orElseThrow();
        assertThat(updatedBook.getCopiesAvailable()).isEqualTo(testBookAvailable.getCopiesAvailable());

        // Verify student received notification
        List<Notification> studentNotifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(student1);
        assertThat(studentNotifications).anyMatch(n -> n.getType() == NotificationType.LOAN_REJECTED);
    }

    @Test
    @DisplayName("Student return request and librarian return confirmation restores inventory")
    void testReturnWorkflow() throws Exception {
        // Set up an active loan
        Loan loan = new Loan(student1, testBookAvailable);
        loan.setStatus(LoanStatus.ISSUED);
        loan.setIssueDate(Instant.now().minus(2, ChronoUnit.DAYS));
        loan.setDueDate(Instant.now().plus(12, ChronoUnit.DAYS));
        loan = loanRepository.save(loan);

        int copiesBeforeReturn = testBookAvailable.getCopiesAvailable();

        // 1. Student requests return
        mockMvc.perform(post("/api/loans/" + loan.getId() + "/return-request")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURN_PENDING"));

        // 2. IDOR check: Student 2 cannot confirm return or request return on Student 1's loan
        mockMvc.perform(post("/api/loans/" + loan.getId() + "/return-request")
                        .header("Authorization", student2Token))
                .andExpect(status().isForbidden());

        // 3. Librarian confirms physical return
        mockMvc.perform(post("/api/loans/" + loan.getId() + "/confirm-return")
                        .header("Authorization", librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"))
                .andExpect(jsonPath("$.returnDate").isNotEmpty());

        // 4. Verify book inventory atomically restored
        Book updatedBook = bookRepository.findById(testBookAvailable.getId()).orElseThrow();
        assertThat(updatedBook.getCopiesAvailable()).isEqualTo(copiesBeforeReturn + 1);

        // 5. Verify student received RETURN_CONFIRMED notification
        List<Notification> studentNotifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(student1);
        assertThat(studentNotifications).anyMatch(n -> n.getType() == NotificationType.RETURN_CONFIRMED);
    }

    @Test
    @DisplayName("Notifications endpoints: unread count, listing, marking read, marking all read")
    void testNotificationsLifecycle() throws Exception {
        notificationRepository.save(new Notification(student1, "Title 1", "Message 1", NotificationType.LOAN_APPROVED, 101L));
        Notification n2 = notificationRepository.save(new Notification(student1, "Title 2", "Message 2", NotificationType.RETURN_CONFIRMED, 102L));

        // 1. Fetch unread count
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(2));

        // 2. List notifications
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        // 3. Mark single notification as read
        mockMvc.perform(patch("/api/notifications/" + n2.getId() + "/read")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));

        // 4. Mark all as read
        mockMvc.perform(post("/api/notifications/mark-all-read")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markedCount").value(1));

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    @DisplayName("Notification Deletion: Individual deletion removes notification while protecting circulation records")
    void testDeleteIndividualNotification() throws Exception {
        // Setup: student1 has an active loan and two notifications
        Loan activeLoan = new Loan(student1, testBookAvailable);
        activeLoan.setStatus(LoanStatus.ISSUED);
        activeLoan.setIssueDate(Instant.now());
        activeLoan.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
        activeLoan = loanRepository.save(activeLoan);

        Notification n1 = notificationRepository.save(new Notification(student1, "Loan Approved", "Your loan was approved", NotificationType.LOAN_APPROVED, activeLoan.getId()));
        Notification n2 = notificationRepository.save(new Notification(student1, "Due Reminder", "Due in 3 days", NotificationType.LOAN_REQUEST, activeLoan.getId()));

        int initialBookCopies = testBookAvailable.getCopiesAvailable();

        // Delete n1
        mockMvc.perform(delete("/api/notifications/" + n1.getId())
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));

        // Verify n1 is deleted from database
        assertThat(notificationRepository.findById(n1.getId())).isEmpty();

        // Verify n2 is still present
        assertThat(notificationRepository.findById(n2.getId())).isPresent();

        // Verify GET /api/notifications returns only n2
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(n2.getId()));

        // CRITICAL CHECK: Underlying circulation records are 100% UNTOUCHED
        Optional<Loan> loanAfterDelete = loanRepository.findById(activeLoan.getId());
        assertThat(loanAfterDelete).isPresent();
        assertThat(loanAfterDelete.get().getStatus()).isEqualTo(LoanStatus.ISSUED);
        assertThat(loanAfterDelete.get().getUser().getId()).isEqualTo(student1.getId());

        Optional<Book> bookAfterDelete = bookRepository.findById(testBookAvailable.getId());
        assertThat(bookAfterDelete).isPresent();
        assertThat(bookAfterDelete.get().getCopiesAvailable()).isEqualTo(initialBookCopies);
    }

    @Test
    @DisplayName("Notification Clear All: Clears all user notifications, preserves other users' alerts, and protects circulation records")
    void testClearAllNotifications() throws Exception {
        // Setup: active loan for student1
        Loan loan1 = new Loan(student1, testBookAvailable);
        loan1.setStatus(LoanStatus.ISSUED);
        loan1 = loanRepository.save(loan1);

        notificationRepository.save(new Notification(student1, "Alert 1", "Message 1", NotificationType.LOAN_APPROVED, loan1.getId()));
        notificationRepository.save(new Notification(student1, "Alert 2", "Message 2", NotificationType.RETURN_REQUEST, loan1.getId()));

        // Student2 also has a notification
        Notification student2Notif = notificationRepository.save(new Notification(student2, "Student 2 Alert", "Message for student 2", NotificationType.LOAN_REQUEST, 999L));

        // Student1 executes Clear All
        mockMvc.perform(delete("/api/notifications")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clearedCount").value(2));

        // Verify student1 has 0 notifications
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Verify student2's notification was NOT deleted
        assertThat(notificationRepository.findById(student2Notif.getId())).isPresent();

        // CRITICAL CHECK: Underlying loan records remain intact
        Optional<Loan> persistedLoan = loanRepository.findById(loan1.getId());
        assertThat(persistedLoan).isPresent();
        assertThat(persistedLoan.get().getStatus()).isEqualTo(LoanStatus.ISSUED);
    }

    @Test
    @DisplayName("Notification Authorization: Users cannot delete other users' notifications, unauthenticated requests rejected")
    void testNotificationDeletionAuthorization() throws Exception {
        Notification student1Notif = notificationRepository.save(
                new Notification(student1, "Private Alert", "Personal loan alert", NotificationType.LOAN_APPROVED, 555L));

        // 1. Student2 attempts to delete student1's notification -> 403 Forbidden
        mockMvc.perform(delete("/api/notifications/" + student1Notif.getId())
                        .header("Authorization", student2Token))
                .andExpect(status().isForbidden());

        // 2. Unauthenticated request -> 401 Unauthorized
        mockMvc.perform(delete("/api/notifications/" + student1Notif.getId()))
                .andExpect(status().isUnauthorized());

        // 3. Deleting non-existent notification -> 404 Not Found
        mockMvc.perform(delete("/api/notifications/9999999")
                        .header("Authorization", student1Token))
                .andExpect(status().isNotFound());

        // Confirm student1Notif is still intact in the database
        assertThat(notificationRepository.findById(student1Notif.getId())).isPresent();
    }

    @Test
    @DisplayName("Circulation statistics endpoint returns real database counts")
    void testCirculationStatsEndpoint() throws Exception {
        Loan loan = new Loan(student1, testBookAvailable);
        loan.setStatus(LoanStatus.ISSUED);
        loan.setIssueDate(Instant.now());
        loan.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
        loanRepository.save(loan);

        mockMvc.perform(get("/api/loans/stats")
                        .header("Authorization", librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTitlesCount").isNumber())
                .andExpect(jsonPath("$.totalCopiesCount").isNumber())
                .andExpect(jsonPath("$.activeLoansCount").isNumber())
                .andExpect(jsonPath("$.pendingRequestsCount").isNumber());
    }

    @Test
    @DisplayName("Concurrency: Simultaneous approvals for single remaining copy permit exactly one approval")
    void testConcurrentApprovalsSingleCopy() throws Exception {
        // testBookSingleCopy has copiesAvailable = 1, totalCopies = 1
        User studentA = new User("Student A", "studenta@vssut.ac.in", passwordEncoder.encode("pass"), Role.USER);
        User studentB = new User("Student B", "studentb@vssut.ac.in", passwordEncoder.encode("pass"), Role.USER);
        studentA = userRepository.save(studentA);
        studentB = userRepository.save(studentB);

        Loan loanA = loanRepository.save(new Loan(studentA, testBookSingleCopy));
        loanA.setStatus(LoanStatus.PENDING);
        loanA = loanRepository.save(loanA);

        Loan loanB = loanRepository.save(new Loan(studentB, testBookSingleCopy));
        loanB.setStatus(LoanStatus.PENDING);
        loanB = loanRepository.save(loanB);

        final Long loanAId = loanA.getId();
        final Long loanBId = loanB.getId();

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Callable<Void>> tasks = new ArrayList<>();
        tasks.add(() -> {
            startLatch.await();
            try {
                loanService.approveLoan(loanAId, librarian);
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
            }
            return null;
        });

        tasks.add(() -> {
            startLatch.await();
            try {
                loanService.approveLoan(loanBId, librarian);
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
            }
            return null;
        });

        // Release threads simultaneously
        List<Future<Void>> futures = new ArrayList<>();
        for (var task : tasks) {
            futures.add(executor.submit(task));
        }
        startLatch.countDown();

        for (var future : futures) {
            future.get();
        }
        executor.shutdown();

        // Exactly one approval must succeed, one must fail
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);

        // Book available copies must be exactly 0, never negative
        Book bookAfter = bookRepository.findById(testBookSingleCopy.getId()).orElseThrow();
        assertThat(bookAfter.getCopiesAvailable()).isEqualTo(0);
    }

    @Test
    @DisplayName("Capacity Concurrency: Concurrent requests from same student cannot exceed limit of 4")
    void testConcurrentRequestsExceedingCapacity() throws Exception {
        // student1 already has 3 active loans (limit is 4)
        for (int i = 1; i <= 3; i++) {
            Book b = new Book("SEED-CAP-0" + i, "Active Book " + i, "Author", "ai-computing", "QA-0" + i, 2);
            b = bookRepository.save(b);
            Loan loan = new Loan(student1, b);
            loan.setStatus(LoanStatus.ISSUED);
            loan.setIssueDate(Instant.now());
            loan.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
            loanRepository.save(loan);
        }

        // Two distinct books for two concurrent requests
        Book bookA = new Book("CONC-B01", "Book A", "Author A", "philosophy", "B01", 2);
        bookA = bookRepository.save(bookA);
        Book bookB = new Book("CONC-B02", "Book B", "Author B", "philosophy", "B02", 2);
        bookB = bookRepository.save(bookB);

        final Long bookAId = bookA.getId();
        final Long bookBId = bookB.getId();
        final User targetStudent = student1;

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger capacityBlockedCount = new AtomicInteger(0);

        List<Callable<Void>> tasks = new ArrayList<>();
        tasks.add(() -> {
            startLatch.await();
            try {
                loanService.requestLoan(new LoanRequestDto(bookAId, "Notes A"), targetStudent);
                successCount.incrementAndGet();
            } catch (com.library.management.exception.LoanOperationException e) {
                if (e.getMessage().contains("Borrowing capacity reached")) {
                    capacityBlockedCount.incrementAndGet();
                }
            }
            return null;
        });

        tasks.add(() -> {
            startLatch.await();
            try {
                loanService.requestLoan(new LoanRequestDto(bookBId, "Notes B"), targetStudent);
                successCount.incrementAndGet();
            } catch (com.library.management.exception.LoanOperationException e) {
                if (e.getMessage().contains("Borrowing capacity reached")) {
                    capacityBlockedCount.incrementAndGet();
                }
            }
            return null;
        });

        List<Future<Void>> futures = new ArrayList<>();
        for (var task : tasks) {
            futures.add(executor.submit(task));
        }
        startLatch.countDown();

        for (var future : futures) {
            future.get();
        }
        executor.shutdown();

        // Exactly one request must succeed to reach 4; the competing request must be rejected
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(capacityBlockedCount.get()).isEqualTo(1);

        // Verify total active + pending loans for student1 is exactly 4
        long totalForStudent = loanRepository.countByUserAndStatusIn(
                targetStudent, 
                List.of(LoanStatus.PENDING, LoanStatus.ISSUED, LoanStatus.RETURN_PENDING)
        );
        assertThat(totalForStudent).isEqualTo(4);
    }

    @Test
    @DisplayName("Automated Overdue Scheduler: Processes overdue loans and deduplicates repeat runs")
    void testOverdueLoanSchedulerAndDeduplication() {
        // Create an overdue loan for student1
        Loan overdueLoan = new Loan(student1, testBookAvailable);
        overdueLoan.setStatus(LoanStatus.ISSUED);
        overdueLoan.setIssueDate(Instant.now().minus(20, ChronoUnit.DAYS));
        overdueLoan.setDueDate(Instant.now().minus(6, ChronoUnit.DAYS));
        overdueLoan = loanRepository.save(overdueLoan);
        final Long overdueLoanId = overdueLoan.getId();

        // First run of scheduler: should find overdue loan and dispatch notification
        int processedFirst = overdueLoanScheduler.processOverdueLoans();
        assertThat(processedFirst).isGreaterThanOrEqualTo(1);

        List<Notification> notifs = notificationRepository.findByRecipientOrderByCreatedAtDesc(student1);
        assertThat(notifs).anyMatch(n -> n.getType() == NotificationType.LOAN_OVERDUE && n.getReferenceId().equals(overdueLoanId));

        int initialNotifCount = notifs.size();

        // Second run of scheduler (e.g. next day sweep): should deduplicate and NOT generate another notification
        overdueLoanScheduler.processOverdueLoans();

        List<Notification> notifsAfterSecondRun = notificationRepository.findByRecipientOrderByCreatedAtDesc(student1);
        assertThat(notifsAfterSecondRun.size()).isEqualTo(initialNotifCount);
    }
}
