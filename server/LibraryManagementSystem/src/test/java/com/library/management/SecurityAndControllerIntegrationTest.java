package com.library.management;

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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
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
                "password": "123"
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
    @DisplayName("Endpoint: POST /api/auth/register rejects duplicate email with 409 Conflict")
    void testRegisterEndpointDuplicateEmail() throws Exception {
        String duplicateJson = """
            {
                "fullName": "Duplicate Reader",
                "email": "reader@library.edu",
                "password": "anotherPassword123"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("reader@library.edu already exists")));
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login succeeds with valid credentials and issues JWT")
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
                .andExpect(jsonPath("$.user.email", is("reader@library.edu")))
                .andExpect(jsonPath("$.user.role", is("USER")))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Endpoint: POST /api/auth/login rejects wrong password with 401 Unauthorized")
    void testLoginEndpointWrongPassword() throws Exception {
        String loginJson = """
            {
                "email": "reader@library.edu",
                "password": "wrongPasswordXYZ"
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
    @DisplayName("Security: Unauthenticated access to /api/users/me is rejected with 401")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("Security: Authenticated access to /api/users/me with valid Bearer token returns profile")
    void testAuthenticatedIdentityEndpoint() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("reader@library.edu")))
                .andExpect(jsonPath("$.fullName", is("Standard Reader")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    @DisplayName("Role Authorization: USER role cannot access manager or admin endpoints (403 Forbidden)")
    void testUserRoleForbiddenFromPrivilegedEndpoints() throws Exception {
        // USER trying to access Manager endpoint
        mockMvc.perform(get("/api/users/manager/test")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        // USER trying to access Admin endpoint
        mockMvc.perform(get("/api/users/admin/test")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Role Authorization: MANAGER role can access manager endpoint but not admin endpoint")
    void testManagerRolePermissions() throws Exception {
        // MANAGER accessing Manager endpoint -> 200 OK
        mockMvc.perform(get("/api/users/manager/test")
                        .header("Authorization", managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("authorized")))
                .andExpect(jsonPath("$.scope", is("CIRCULATION_MANAGEMENT")));

        // MANAGER accessing Admin endpoint -> 403 Forbidden
        mockMvc.perform(get("/api/users/admin/test")
                        .header("Authorization", managerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Role Authorization: ADMIN role can access both manager and admin endpoints")
    void testAdminRolePermissions() throws Exception {
        // ADMIN accessing Manager endpoint -> 200 OK
        mockMvc.perform(get("/api/users/manager/test")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("authorized")));

        // ADMIN accessing Admin endpoint -> 200 OK
        mockMvc.perform(get("/api/users/admin/test")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("authorized")))
                .andExpect(jsonPath("$.scope", is("FULL_SYSTEM_ADMINISTRATION")));
    }
}
