package com.library.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Minimal unauthenticated health check endpoint for cloud platform service monitoring
 * (e.g. Render Health Check Path).
 * Does not expose internal diagnostics, stack traces, or credentials.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, String>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Athenaeum Library Management System",
                "timestamp", Instant.now().toString()
        ));
    }
}

