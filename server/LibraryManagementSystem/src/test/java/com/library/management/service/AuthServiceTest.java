package com.library.management.service;

import com.library.management.dto.AuthResponse;
import com.library.management.dto.LoginRequest;
import com.library.management.dto.RegisterRequest;
import com.library.management.dto.UserResponse;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.exception.DuplicateResourceException;
import com.library.management.exception.InvalidCredentialsException;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtService;
import com.library.management.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("1. Successful registration persists user with hashed password and USER role")
    void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest("Marie Curie", "marie@university.edu", "radioactivity123");

        when(userRepository.existsByEmail("marie@university.edu")).thenReturn(false);
        when(passwordEncoder.encode("radioactivity123")).thenReturn("$2a$12$hashedPasswordExample");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setFullName("Marie Curie");
        savedUser.setEmail("marie@university.edu");
        savedUser.setPassword("$2a$12$hashedPasswordExample");
        savedUser.setRole(Role.USER);
        savedUser.setEnabled(true);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Marie Curie", response.getFullName());
        assertEquals("marie@university.edu", response.getEmail());
        assertEquals("USER", response.getRole());
        assertTrue(response.isEnabled());

        // Verify password was hashed before persistence
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertEquals("$2a$12$hashedPasswordExample", capturedUser.getPassword());
        assertEquals(Role.USER, capturedUser.getRole());
    }

    @Test
    @DisplayName("2. Password hashing occurs strictly before persistence")
    void testPasswordHashingBeforePersistence() {
        RegisterRequest request = new RegisterRequest("Alan Turing", "turing@cambridge.edu", "enigmaSecret789");

        when(userRepository.existsByEmail("turing@cambridge.edu")).thenReturn(false);
        when(passwordEncoder.encode("enigmaSecret789")).thenReturn("$2a$12$secureBcryptHash");

        User savedUser = new User("Alan Turing", "turing@cambridge.edu", "$2a$12$secureBcryptHash", Role.USER);
        savedUser.setId(11L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        assertNotEquals("enigmaSecret789", captor.getValue().getPassword(), "Raw password must never be stored");
        assertEquals("$2a$12$secureBcryptHash", captor.getValue().getPassword());
    }

    @Test
    @DisplayName("3. Duplicate email registration is rejected with Conflict exception")
    void testDuplicateEmailRejection() {
        RegisterRequest request = new RegisterRequest("Duplicate User", "existing@library.edu", "password123");

        when(userRepository.existsByEmail("existing@library.edu")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("4. Public registration strictly assigns USER role and cannot assign ADMIN or MANAGER")
    void testPublicRegistrationCannotAssignAdminOrManager() {
        RegisterRequest request = new RegisterRequest("Sneaky Admin Attempt", "sneaky@library.edu", "secretPass99");

        when(userRepository.existsByEmail("sneaky@library.edu")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashed");

        User savedUser = new User("Sneaky Admin Attempt", "sneaky@library.edu", "$2a$12$hashed", Role.USER);
        savedUser.setId(12L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = authService.register(request);

        assertEquals("USER", response.getRole(), "Public registration must assign USER role only");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals(Role.USER, captor.getValue().getRole());
    }

    @Test
    @DisplayName("5. Successful login returns JWT token and user profile")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest("scholar@athenaeum.edu", "correctPassword");

        User user = new User("Scholar Reader", "scholar@athenaeum.edu", "$2a$12$storedHash", Role.USER);
        user.setId(5L);
        user.setEnabled(true);

        when(userRepository.findByEmail("scholar@athenaeum.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctPassword", "$2a$12$storedHash")).thenReturn(true);
        when(jwtService.generateToken("scholar@athenaeum.edu", "USER", 5L, "Scholar Reader"))
                .thenReturn("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validToken");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse authResponse = authService.login(request);

        assertNotNull(authResponse);
        assertEquals("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validToken", authResponse.getToken());
        assertEquals("Bearer", authResponse.getTokenType());
        assertEquals(86400000L, authResponse.getExpiresInMs());
        assertNotNull(authResponse.getUser());
        assertEquals("scholar@athenaeum.edu", authResponse.getUser().getEmail());
        assertEquals("USER", authResponse.getUser().getRole());
    }

    @Test
    @DisplayName("6. Invalid credentials (wrong password) is rejected")
    void testLoginWithInvalidPassword() {
        LoginRequest request = new LoginRequest("scholar@athenaeum.edu", "wrongPassword");

        User user = new User("Scholar Reader", "scholar@athenaeum.edu", "$2a$12$storedHash", Role.USER);
        user.setEnabled(true);

        when(userRepository.findByEmail("scholar@athenaeum.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "$2a$12$storedHash")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
        verify(jwtService, never()).generateToken(anyString(), anyString(), anyLong(), anyString());
    }

    @Test
    @DisplayName("7. Non-existent email login is rejected with InvalidCredentialsException")
    void testLoginWithNonExistentEmail() {
        LoginRequest request = new LoginRequest("unknown@library.edu", "somePass123");

        when(userRepository.findByEmail("unknown@library.edu")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
        verify(jwtService, never()).generateToken(anyString(), anyString(), anyLong(), anyString());
    }

    @Test
    @DisplayName("8. Disabled account login is rejected")
    void testLoginWithDisabledAccount() {
        LoginRequest request = new LoginRequest("disabled@library.edu", "password123");

        User disabledUser = new User("Disabled Scholar", "disabled@library.edu", "$2a$12$hash", Role.USER);
        disabledUser.setEnabled(false);

        when(userRepository.findByEmail("disabled@library.edu")).thenReturn(Optional.of(disabledUser));
        when(passwordEncoder.matches("password123", "$2a$12$hash")).thenReturn(true);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
        verify(jwtService, never()).generateToken(anyString(), anyString(), anyLong(), anyString());
    }

    @Test
    @DisplayName("9. Sensitive fields (password, passwordHash) are strictly absent from UserResponse")
    void testSensitiveFieldsAbsentFromUserResponse() {
        User user = new User("Ada Lovelace", "ada@analytical.org", "$2a$12$superSecretHash12345", Role.ADMIN);
        user.setId(42L);

        UserResponse response = UserResponse.fromEntity(user);

        assertNotNull(response);
        assertEquals(42L, response.getId());
        assertEquals("Ada Lovelace", response.getFullName());
        assertEquals("ada@analytical.org", response.getEmail());
        assertEquals("ADMIN", response.getRole());

        // Verify class has no getPassword method
        assertNull(findMethod(UserResponse.class, "getPassword"));
        assertNull(findMethod(UserResponse.class, "getPasswordHash"));
    }

    private java.lang.reflect.Method findMethod(Class<?> clazz, String methodName) {
        try {
            return clazz.getMethod(methodName);
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
}

