package com.library.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectLoanDto {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public RejectLoanDto() {
    }

    public RejectLoanDto(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

