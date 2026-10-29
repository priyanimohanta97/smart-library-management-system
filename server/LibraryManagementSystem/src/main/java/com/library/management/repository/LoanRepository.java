package com.library.management.repository;

import com.library.management.entity.Book;
import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;
import com.library.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserOrderByRequestDateDesc(User user);

    Optional<Loan> findByIdAndUser(Long id, User user);

    /**
     * Counts active and pending loans for a student to enforce borrowing limits.
     */
    long countByUserAndStatusIn(User user, Collection<LoanStatus> statuses);

    /**
     * Counts other active and pending loans for a student excluding the specific loan being approved,
     * preventing double counting of the current loan during approval.
     */
    long countByUserAndStatusInAndIdNot(User user, Collection<LoanStatus> statuses, Long id);

    /**
     * Detects if the student already has an active loan or pending request for the specified book.
     */
    boolean existsByUserAndBookAndStatusIn(User user, Book book, Collection<LoanStatus> statuses);

    List<Loan> findByStatusOrderByRequestDateAsc(LoanStatus status);

    List<Loan> findByStatusInOrderByRequestDateDesc(Collection<LoanStatus> statuses);

    /**
     * Retrieves loans that are currently ISSUED and have passed their due date.
     */
    @Query("SELECT l FROM Loan l WHERE l.status = 'ISSUED' AND l.dueDate < :now ORDER BY l.dueDate ASC")
    List<Loan> findOverdueLoans(@Param("now") Instant now);

    long countByStatus(LoanStatus status);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ISSUED' AND l.dueDate < :now")
    long countOverdueLoans(@Param("now") Instant now);
}

