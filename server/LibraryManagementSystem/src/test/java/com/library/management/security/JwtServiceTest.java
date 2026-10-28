package com.library.management.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String VALID_TEST_SECRET = "secure_athenaeum_library_jwt_signing_secret_key_minimum_256_bits_for_testing!";
    private static final String SHORT_SECRET = "too_short_secret_only_16b!";

    @Test
    @DisplayName("JWT Validation: Missing secret throws IllegalStateException on initialization")
    void testMissingSecretThrowsIllegalStateException() {
        JwtService service = new JwtService();
        service.setJwtSecret("");

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateConfiguration);
        assertTrue(ex.getMessage().contains("JWT signing secret is not configured"));
        assertFalse(ex.getMessage().contains(VALID_TEST_SECRET), "Secret must not be exposed in exception messages");
    }

    @Test
    @DisplayName("JWT Validation: Null secret throws IllegalStateException")
    void testNullSecretThrowsIllegalStateException() {
        JwtService service = new JwtService();
        service.setJwtSecret(null);

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateConfiguration);
        assertTrue(ex.getMessage().contains("JWT signing secret is not configured"));
    }

    @Test
    @DisplayName("JWT Validation: Secret under 256 bits (32 bytes) throws IllegalStateException")
    void testInsecureShortSecretThrowsIllegalStateException() {
        JwtService service = new JwtService();
        service.setJwtSecret(SHORT_SECRET);

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateConfiguration);
        assertTrue(ex.getMessage().contains("at least 256 bits (32 bytes)"));
        assertFalse(ex.getMessage().contains(SHORT_SECRET), "Insecure secret must not be exposed in exception messages");
    }

    @Test
    @DisplayName("JWT Token: Valid 256-bit secret generates token with required claims")
    void testValidSecretGeneratesTokenAndExtractsClaims() {
        JwtService service = new JwtService(VALID_TEST_SECRET, 3600000L);

        String token = service.generateToken("hypatia@alexandria.edu", "MANAGER", 77L, "Hypatia of Alexandria");

        assertNotNull(token);
        assertEquals("hypatia@alexandria.edu", service.extractUsername(token));
        assertEquals("MANAGER", service.extractRole(token));
        assertEquals(77L, service.extractUserId(token));
        assertTrue(service.validateToken(token));

        UserDetails userDetails = new User(
                "hypatia@alexandria.edu",
                "dummy",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_MANAGER"))
        );
        assertTrue(service.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("JWT Security: Tampered token signature is rejected")
    void testTamperedTokenRejected() {
        JwtService service = new JwtService(VALID_TEST_SECRET, 3600000L);

        String token = service.generateToken("scholar@library.edu", "USER", 1L, "Scholar");
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(service.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("JWT Expiration: Expired token is rejected")
    void testExpiredTokenRejected() {
        // Expiration in the past (-10 seconds)
        JwtService service = new JwtService(VALID_TEST_SECRET, -10000L);

        String expiredToken = service.generateToken("expired@library.edu", "USER", 2L, "Expired User");

        assertFalse(service.validateToken(expiredToken));

        UserDetails userDetails = new User(
                "expired@library.edu",
                "dummy",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        assertFalse(service.isTokenValid(expiredToken, userDetails));
    }
}

