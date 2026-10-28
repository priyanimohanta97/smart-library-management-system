package com.library.management.config;

import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminInitializer adminInitializer;

    @BeforeEach
    void setUp() {
        adminInitializer = new AdminInitializer(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Admin Bootstrap Safeguard: Does nothing when credentials are not configured")
    void testBootstrapSkippedWhenCredentialsNotConfigured() {
        adminInitializer.setAdminEmail(null);
        adminInitializer.setAdminPassword(null);

        adminInitializer.run(null);

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin Bootstrap Safeguard: Does nothing when credentials are blank strings")
    void testBootstrapSkippedWhenCredentialsAreBlank() {
        adminInitializer.setAdminEmail("   ");
        adminInitializer.setAdminPassword("   ");

        adminInitializer.run(null);

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin Bootstrap: Provisions administrator with BCrypt password and ADMIN role when configured")
    void testBootstrapSuccessWhenConfigured() {
        adminInitializer.setAdminEmail("admin@athenaeum.edu");
        adminInitializer.setAdminPassword("secureAdminPass2026");
        adminInitializer.setAdminName("Chief Curator");

        when(userRepository.existsByEmail("admin@athenaeum.edu")).thenReturn(false);
        when(passwordEncoder.encode("secureAdminPass2026")).thenReturn("$2a$12$secureBcryptHashForAdmin");

        adminInitializer.run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User admin = captor.getValue();
        assertEquals("admin@athenaeum.edu", admin.getEmail());
        assertEquals("Chief Curator", admin.getFullName());
        assertEquals(Role.ADMIN, admin.getRole());
        assertTrue(admin.isEnabled());
        assertEquals("$2a$12$secureBcryptHashForAdmin", admin.getPassword());
        assertNotEquals("secureAdminPass2026", admin.getPassword(), "Plaintext password must never be saved");
    }

    @Test
    @DisplayName("Admin Bootstrap Safeguard: Preserves existing account and never overwrites unexpectedly")
    void testBootstrapPreservesExistingAccount() {
        adminInitializer.setAdminEmail("admin@athenaeum.edu");
        adminInitializer.setAdminPassword("anotherPassword999");

        when(userRepository.existsByEmail("admin@athenaeum.edu")).thenReturn(true);

        adminInitializer.run(null);

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Admin Bootstrap Safeguard: Skips initialization if password is under 8 characters")
    void testBootstrapSkipsShortPassword() {
        adminInitializer.setAdminEmail("admin@athenaeum.edu");
        adminInitializer.setAdminPassword("short"); // less than 8 characters

        when(userRepository.existsByEmail("admin@athenaeum.edu")).thenReturn(false);

        adminInitializer.run(null);

        verify(userRepository, never()).save(any(User.class));
    }
}

