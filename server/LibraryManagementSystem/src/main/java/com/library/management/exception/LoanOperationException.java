package com.library.management.exception;

public class LoanOperationException extends RuntimeException {

    private final int statusCode;

    public LoanOperationException(String message) {
        super(message);
        this.statusCode = 400; // BAD_REQUEST by default
    }

    public LoanOperationException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}

