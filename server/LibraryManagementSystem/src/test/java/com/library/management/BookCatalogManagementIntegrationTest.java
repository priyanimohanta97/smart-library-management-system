package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.config.MongoTestServerConfig;
import com.library.management.dto.BookCreateRequest;
import com.library.management.dto.LoanRequestDto;
import com.library.management.entity.Book;
import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.LoanRepository;
import com.library.management.repository.NotificationRepository;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(MongoTestServerConfig.class)
public class BookCatalogManagementIntegrationTest {

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
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User admin;
    private User manager;
    private User student;
    private String adminToken;
    private String managerToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        admin = new User("System Admin", "admin@vssut.ac.in", passwordEncoder.encode("secret123"), Role.ADMIN);
        admin.setEnabled(true);
        admin = userRepository.save(admin);
        adminToken = "Bearer " + jwtService.generateToken(admin.getEmail(), "ADMIN", admin.getId(), admin.getFullName());

        manager = new User("Chief Librarian", "librarian@vssut.ac.in", passwordEncoder.encode("secret123"), Role.MANAGER);
        manager.setEnabled(true);
        manager = userRepository.save(manager);
        managerToken = "Bearer " + jwtService.generateToken(manager.getEmail(), "MANAGER", manager.getId(), manager.getFullName());

        student = new User("Alice Walker", "student@vssut.ac.in", passwordEncoder.encode("secret123"), Role.USER);
        student.setEnabled(true);
        student = userRepository.save(student);
        studentToken = "Bearer " + jwtService.generateToken(student.getEmail(), "USER", student.getId(), student.getFullName());
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

    @Nested
    @DisplayName("A. Add Book End-to-End Suite")
    class AddBookSuite {

        @Test
        @DisplayName("1. ADMIN can create a book: HTTP 201 Created with valid BookResponse")
        void testAdminCanCreateBook() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Design Patterns", "GoF", "ai-computing", "QA76.5 .G64 1994", 4);
            req.setLocation("Engineering Wing · 3rd Floor");
            req.setPublicationYear(1994);

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.code").isNotEmpty())
                    .andExpect(jsonPath("$.title").value("Design Patterns"))
                    .andExpect(jsonPath("$.author").value("GoF"))
                    .andExpect(jsonPath("$.category").value("ai-computing"))
                    .andExpect(jsonPath("$.categoryLabel").value("AI & Computational Thinking"))
                    .andExpect(jsonPath("$.totalCopies").value(4))
                    .andExpect(jsonPath("$.copiesAvailable").value(4))
                    .andExpect(jsonPath("$.archived").value(false));

            assertThat(bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCase("Design Patterns", "GoF")).isTrue();
        }

        @Test
        @DisplayName("2. MANAGER can create a book: HTTP 201 Created")
        void testManagerCanCreateBook() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Introduction to Algorithms", "CLRS", "ai-computing", null, 2);

            mockMvc.perform(post("/api/books")
                            .header("Authorization", managerToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title").value("Introduction to Algorithms"))
                    .andExpect(jsonPath("$.callNumber").isNotEmpty())
                    .andExpect(jsonPath("$.location").value("Engineering & Tech Wing · 3rd Floor, Section CS"))
                    .andExpect(jsonPath("$.copiesAvailable").value(2));
        }

        @Test
        @DisplayName("3. STUDENT receives HTTP 403 Forbidden when attempting to create a book")
        void testStudentCannotCreateBook() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Hacking 101", "Unknown", "ai-computing");

            mockMvc.perform(post("/api/books")
                            .header("Authorization", studentToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("4. Unauthenticated request receives HTTP 401 Unauthorized")
        void testUnauthenticatedCannotCreateBook() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Anonymous Book", "Anon", "ai-computing");

            mockMvc.perform(post("/api/books")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("5. Missing required fields (title, author, category) returns HTTP 400 Bad Request")
        void testMissingRequiredFieldsReturns400() throws Exception {
            BookCreateRequest emptyReq = new BookCreateRequest("", "", "");

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(emptyReq)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.title").exists())
                    .andExpect(jsonPath("$.validationErrors.author").exists())
                    .andExpect(jsonPath("$.validationErrors.category").exists());
        }

        @Test
        @DisplayName("6. Duplicate title + author combination rejected with HTTP 409 Conflict")
        void testDuplicateTitleAuthorRejected() throws Exception {
            Book existing = new Book("EX-01", "Clean Code", "Robert C. Martin", "ai-computing", "QA76.76", 3);
            bookRepository.save(existing);

            BookCreateRequest req = new BookCreateRequest("clean code", "robert c. martin", "ai-computing");

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("already exists")));
        }

        @Test
        @DisplayName("7. Duplicate call number rejected with HTTP 409 Conflict")
        void testDuplicateCallNumberRejected() throws Exception {
            Book existing = new Book("EX-02", "Original Book", "Author One", "ai-computing", "QA100.DUP", 2);
            bookRepository.save(existing);

            BookCreateRequest req = new BookCreateRequest("Different Title", "Different Author", "ai-computing", "QA100.DUP", 1);

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("call number")));
        }

        @Test
        @DisplayName("8. MongoDB String ObjectId and unique code generated properly")
        void testMongoStringIdAndCodeGenerated() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Refactoring", "Martin Fowler", "ai-computing");

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", isA(String.class)))
                    .andExpect(jsonPath("$.code", startsWith("admin-book-")));
        }

        @Test
        @DisplayName("9. Available copies equal total copies upon initial creation")
        void testCopiesAvailableEqualsTotalCopies() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Database Systems", "Silberschatz", "ai-computing", null, 5);

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.totalCopies").value(5))
                    .andExpect(jsonPath("$.copiesAvailable").value(5));
        }

        @Test
        @DisplayName("10. Public GET /api/books returns the created active book")
        void testGetBooksReturnsCreatedActiveBook() throws Exception {
            BookCreateRequest req = new BookCreateRequest("Operating Systems", "Tanenbaum", "ai-computing");

            mockMvc.perform(post("/api/books")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/books"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].title", hasItem("Operating Systems")));
        }
    }

    @Nested
    @DisplayName("B. Archive Book Suite")
    class ArchiveBookSuite {

        @Test
        @DisplayName("1. ADMIN can archive an eligible book: HTTP 200 OK and archived=true")
        void testAdminCanArchiveEligibleBook() throws Exception {
            Book b = new Book("CODE-10", "Old Architecture", "Vitruvius", "classical-lit", "NA2515", 1);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(b.getId()))
                    .andExpect(jsonPath("$.archived").value(true));

            Book found = bookRepository.findById(b.getId()).orElseThrow();
            assertThat(found.isArchived()).isTrue();
        }

        @Test
        @DisplayName("2. MANAGER can archive an eligible book")
        void testManagerCanArchiveEligibleBook() throws Exception {
            Book b = new Book("CODE-11", "Outdated Edition", "Author Z", "science-nature", "QC10", 2);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", managerToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.archived").value(true));
        }

        @Test
        @DisplayName("3. STUDENT cannot archive: HTTP 403 Forbidden")
        void testStudentCannotArchive() throws Exception {
            Book b = new Book("CODE-12", "Student Target", "Author", "philosophy", "B10", 1);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("4. Unauthenticated request to archive returns HTTP 401 Unauthorized")
        void testUnauthenticatedCannotArchive() throws Exception {
            Book b = new Book("CODE-13", "Anon Target", "Author", "philosophy", "B11", 1);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("5. Nonexistent book returns HTTP 404 Not Found")
        void testArchiveNonexistentBookReturns404() throws Exception {
            mockMvc.perform(patch("/api/books/6729e41b8a531737e42d9999/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("6. Already archived book handled with HTTP 409 Conflict")
        void testAlreadyArchivedBookReturnsConflict() throws Exception {
            Book b = new Book("CODE-14", "Already Archived", "Author", "philosophy", "B12", 1);
            b.setArchived(true);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("already archived")));
        }

        @Test
        @DisplayName("7. Book with active (ISSUED) loan cannot be archived: HTTP 409 Conflict")
        void testBookWithActiveLoanCannotBeArchived() throws Exception {
            Book b = new Book("CODE-15", "Active Book", "Author", "ai-computing", "QA20", 2);
            b = bookRepository.save(b);

            Loan activeLoan = new Loan(student, b);
            activeLoan.setStatus(LoanStatus.ISSUED);
            activeLoan.setIssueDate(Instant.now());
            loanRepository.save(activeLoan);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("active or pending loans")));

            Book check = bookRepository.findById(b.getId()).orElseThrow();
            assertThat(check.isArchived()).isFalse();
        }

        @Test
        @DisplayName("8. Book with PENDING loan request cannot be archived: HTTP 409 Conflict")
        void testBookWithPendingLoanCannotBeArchived() throws Exception {
            Book b = new Book("CODE-16", "Pending Book", "Author", "ai-computing", "QA21", 2);
            b = bookRepository.save(b);

            Loan pendingLoan = new Loan(student, b);
            pendingLoan.setStatus(LoanStatus.PENDING);
            loanRepository.save(pendingLoan);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("active or pending loans")));
        }

        @Test
        @DisplayName("9. Book with only historical RETURNED or REJECTED loans can be archived")
        void testBookWithHistoricalLoansCanBeArchived() throws Exception {
            Book b = new Book("CODE-17", "History Book", "Author", "philosophy", "B30", 1);
            b = bookRepository.save(b);

            Loan returnedLoan = new Loan(student, b);
            returnedLoan.setStatus(LoanStatus.RETURNED);
            returnedLoan.setReturnDate(Instant.now());
            loanRepository.save(returnedLoan);

            Loan rejectedLoan = new Loan(student, b);
            rejectedLoan.setStatus(LoanStatus.REJECTED);
            loanRepository.save(rejectedLoan);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.archived").value(true));

            // Verify both loan documents remain preserved
            assertThat(loanRepository.findAll()).hasSize(2);
        }

        @Test
        @DisplayName("10. Archived book document remains permanently in MongoDB (never deleted)")
        void testArchivedBookRemainsInMongo() throws Exception {
            Book b = new Book("CODE-18", "Preserved Document", "Author", "classical-lit", "PR100", 1);
            b = bookRepository.save(b);

            mockMvc.perform(patch("/api/books/" + b.getId() + "/archive")
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk());

            assertThat(bookRepository.findById(b.getId())).isPresent();
            assertThat(bookRepository.findById(b.getId()).get().isArchived()).isTrue();
        }

        @Test
        @DisplayName("11. Archived books are excluded from public GET /api/books and search/category endpoints")
        void testArchivedBooksExcludedFromPublicGet() throws Exception {
            Book active = new Book("CODE-19A", "Active AI Book", "Author A", "ai-computing", "QA50", 1);
            active.setArchived(false);
            bookRepository.save(active);

            Book archived = new Book("CODE-19B", "Archived AI Book", "Author B", "ai-computing", "QA51", 1);
            archived.setArchived(true);
            bookRepository.save(archived);

            // Public GET /api/books (default)
            mockMvc.perform(get("/api/books"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].title", hasItem("Active AI Book")))
                    .andExpect(jsonPath("$[*].title", not(hasItem("Archived AI Book"))));

            // Public search
            mockMvc.perform(get("/api/books").param("search", "Archived"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));

            // Public category
            mockMvc.perform(get("/api/books").param("category", "ai-computing"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].title", hasItem("Active AI Book")))
                    .andExpect(jsonPath("$[*].title", not(hasItem("Archived AI Book"))));
        }

        @Test
        @DisplayName("12. Archived books remain visible in admin inventory when includeArchived=true")
        void testArchivedBooksVisibleInAdminInventory() throws Exception {
            Book archived = new Book("CODE-20", "Archived Volume", "Author", "ai-computing", "QA60", 1);
            archived.setArchived(true);
            bookRepository.save(archived);

            // Admin with includeArchived=true
            mockMvc.perform(get("/api/books")
                            .param("includeArchived", "true")
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].title", hasItem("Archived Volume")));

            // Student with includeArchived=true gets 403 Forbidden
            mockMvc.perform(get("/api/books")
                            .param("includeArchived", "true")
                            .header("Authorization", studentToken))
                    .andExpect(status().isForbidden());

            // Unauthenticated with includeArchived=true gets 403 Forbidden
            mockMvc.perform(get("/api/books")
                            .param("includeArchived", "true"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("13. LoanServiceImpl rejects borrowing an archived book")
        void testLoanServiceRejectsBorrowingArchivedBook() throws Exception {
            Book archived = new Book("CODE-21", "Archived Borrow Target", "Author", "philosophy", "B80", 2);
            archived.setArchived(true);
            archived = bookRepository.save(archived);

            LoanRequestDto loanReq = new LoanRequestDto(archived.getId(), "Trying to borrow archived book");

            mockMvc.perform(post("/api/loans/request")
                            .header("Authorization", studentToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loanReq)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("archived")));
        }
    }
}
