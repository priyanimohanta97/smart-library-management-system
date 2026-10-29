package com.library.management.entity;

public enum LoanStatus {
    /**
     * Requested by student; awaiting librarian review. Consumes capacity.
     */
    PENDING,

    /**
     * Approved by librarian; physically issued to student. Consumes capacity.
     */
    ISSUED,

    /**
     * Declined by librarian. Terminal status. Does not consume capacity.
     */
    REJECTED,

    /**
     * Student submitted physical return request; awaiting librarian check-in. Consumes capacity.
     */
    RETURN_PENDING,

    /**
     * Librarian confirmed physical receipt; book returned to stacks. Terminal status. Does not consume capacity.
     */
    RETURNED,

    /**
     * Cancelled by student prior to approval. Terminal status. Does not consume capacity.
     */
    CANCELLED;

    /**
     * Determines whether this status consumes the student's active borrowing capacity.
     */
    public boolean consumesBorrowingCapacity() {
        return this == PENDING || this == ISSUED || this == RETURN_PENDING;
    }
}

