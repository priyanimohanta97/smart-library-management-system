package com.library.management;

import com.library.management.config.MongoTestServerConfig;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(MongoTestServerConfig.class)
class SecurityAndControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.library.management.repository.LoanRepository loanRepository;

    @Autowired
    private com.library.management.repository.NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String userToken;
    private String managerToken;
    private String adminToken;

    @BeforeEach
    void setupDatabase() {
        notificationRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Standard Reader (ROLE_USER)
        User standardUser = new User("Standard Reader", "reader@library.edu", passwordEncoder.encode("readerPass123"), Role.USER);
        standardUser.setEnabled(true);
        standardUser = userRepository.save(standardUser);
        userToken = "Bearer " + jwtService.generateToken(standardUser.getEmail(), "USER", standardUser.getId(), standardUser.getFullName());

        // 2. Circulation Manager (ROLE_MANAGER)
        User managerUser = new User("Circulation Manager", "manager@library.edu", passwordEncoder.encode("managerPass123"), Role.MANAGER);
        managerUser.setEnabled(true);
        managerUser = userRepository.save(managerUser);
        managerToken = "Bearer " + jwtService.generateToken(managerUser.getEmail(), "MANAGER", managerUser.getId(), managerUser.getFullName());

        // 3. System Administrator (ROLE_ADMIN)
        User adminUser = new User("Chief Administrator", "admin@library.edu", passwordEncoder.encode("adminPass123"), Role.ADMIN);
        adminUser.setEnabled(true);
        adminUser = userRepository.save(adminUser);
        adminToken = "Bearer " + jwtService.generateToken(adminUser.getEmail(), "ADMIN", adminUser.getId(), adminUser.getFullName());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/register creates user and returns 201 with safe response")
    void testRegisterEndpointSuccess() throws Exception {
        String registerJson = """
            {
                "fullName": "Isaac Newton",
                "email": "newton@cambridge.ac.uk",
                "password": "principiaMathematica"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.fullName", is("Isaac Newton")))
                .andExpect(jsonPath("$.email", is("newton@cambridge.ac.uk")))
                .andExpect(jsonPath("$.role", is("USER")))
                .andExpect(jsonPath("$.enabled", is(true)))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/register rejects invalid inputs with 400 Bad Request")
    void testRegisterEndpointValidationFailure() throws Exception {
        String invalidJson = """
            {
                "fullName": "",
                "email": "not-an-email",
                "password": "short"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.validationErrors.fullName").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/register enforces minimum password length of 8 chars")
    void testRegisterPasswordTooShort() throws Exception {
        String shortPasswordJson = """
            {
                "fullName": "Gottfried Leibniz",
                "email": "leibniz@hannover.de",
                "password": "calc7"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(shortPasswordJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login returns token and user data on valid credentials")
    void testLoginEndpointSuccess() throws Exception {
        String loginJson = """
            {
                "email": "reader@library.edu",
                "password": "readerPass123"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.expiresInMs").isNumber())
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.user.email", is("reader@library.edu")))
                .andExpect(jsonPath("$.user.role", is("USER")))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login rejects wrong password with 401 Unauthorized")
    void testLoginEndpointWrongPassword() throws Exception {
        String loginJson = """
            {
                "email": "reader@library.edu",
                "password": "wrongPassword123"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login rejects unknown email with 401 Unauthorized")
    void testLoginEndpointUnknownEmail() throws Exception {
        String loginJson = """
            {
                "email": "ghost@library.edu",
                "password": "anyPassword123"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login rejects blank fields with 400 Bad Request")
    void testLoginEndpointValidationFailure() throws Exception {
        String invalidJson = """
            {
                "email": "bad-email",
                "password": ""
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")));
    }

    @Test
    @DisplayName("Security: Protected GET /api/loans/my-loans rejects missing Authorization header with 401")
    void testProtectedEndpointRejectsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/loans/my-loans"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Protected GET /api/loans/my-loans rejects invalid JWT signature with 401")
    void testProtectedEndpointRejectsInvalidToken() throws Exception {
        mockMvc.perform(get("/api/loans/my-loans")
                        .header("Authorization", "Bearer invalid.fake.token.signature"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Protected GET /api/loans/my-loans accepts valid USER JWT token")
    void testProtectedEndpointAcceptsValidToken() throws Exception {
        mockMvc.perform(get("/api/loans/my-loans")
                        .header("Authorization", userToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: Librarian GET /api/loans/pending allows MANAGER role")
    void testLibrarianEndpointAllowsManager() throws Exception {
        mockMvc.perform(get("/api/loans/pending")
                        .header("Authorization", managerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: Librarian GET /api/loans/pending allows ADMIN role")
    void testLibrarianEndpointAllowsAdmin() throws Exception {
        mockMvc.perform(get("/api/loans/pending")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: Librarian GET /api/loans/pending forbids USER role with 403 Forbidden")
    void testLibrarianEndpointForbidsUserRole() throws Exception {
        mockMvc.perform(get("/api/loans/pending")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }
}
