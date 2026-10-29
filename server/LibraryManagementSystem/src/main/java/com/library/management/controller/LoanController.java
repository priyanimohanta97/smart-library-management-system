package com.library.management.controller;

import com.library.management.dto.CirculationStatsResponse;
import com.library.management.dto.LoanRequestDto;
import com.library.management.dto.LoanResponse;
import com.library.management.dto.RejectLoanDto;
import com.library.management.entity.User;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.UserRepository;
import com.library.management.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final UserRepository userRepository;

    public LoanController(LoanService loanService, UserRepository userRepository) {
        this.loanService = loanService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResourceNotFoundException("Authenticated user not found in security context");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
    }

    @PostMapping("/request")
    public ResponseEntity<LoanResponse> requestLoan(
            @Valid @RequestBody LoanRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedUser(userDetails);
        LoanResponse response = loanService.requestLoan(requestDto, student);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<LoanResponse>> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(loanService.getStudentLoans(student));
    }

    @PostMapping("/{id}/return-request")
    public ResponseEntity<LoanResponse> requestReturn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(loanService.requestReturn(id, student));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getPendingLoans() {
        return ResponseEntity.ok(loanService.getPendingLoans());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<LoanResponse> approveLoan(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User librarian = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(loanService.approveLoan(id, librarian));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<LoanResponse> rejectLoan(
            @PathVariable Long id,
            @Valid @RequestBody RejectLoanDto rejectDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User librarian = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(loanService.rejectLoan(id, rejectDto, librarian));
    }

    @GetMapping("/return-requests")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getPendingReturns() {
        return ResponseEntity.ok(loanService.getPendingReturns());
    }

    @PostMapping("/{id}/confirm-return")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<LoanResponse> confirmReturn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User librarian = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(loanService.confirmReturn(id, librarian));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getActiveLoans() {
        return ResponseEntity.ok(loanService.getActiveLoans());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<CirculationStatsResponse> getCirculationStats() {
        return ResponseEntity.ok(loanService.getCirculationStats());
    }
}

