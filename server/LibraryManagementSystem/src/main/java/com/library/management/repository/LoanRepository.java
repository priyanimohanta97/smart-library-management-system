package com.library.management.repository;

import com.library.management.entity.Book;
import com.library.management.entity.Loan;
import com.library.management.entity.LoanStatus;
import com.library.management.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends MongoRepository<Loan, String> {

    List<Loan> findByUserOrderByRequestDateDesc(User user);

    Optional<Loan> findByIdAndUser(String id, User user);

    long countByUserAndStatusIn(User user, Collection<LoanStatus> statuses);

    long countByUserAndStatusInAndIdNot(User user, Collection<LoanStatus> statuses, String id);

    boolean existsByUserAndBookAndStatusIn(User user, Book book, Collection<LoanStatus> statuses);

    List<Loan> findByStatusOrderByRequestDateAsc(LoanStatus status);

    List<Loan> findByStatusInOrderByRequestDateDesc(Collection<LoanStatus> statuses);

    @Query("{ 'status': 'ISSUED', 'dueDate': { '$lt': ?0 } }")
    List<Loan> findOverdueLoans(Instant now);

    long countByStatus(LoanStatus status);

    @Query(value = "{ 'status': 'ISSUED', 'dueDate': { '$lt': ?0 } }", count = true)
    long countOverdueLoans(Instant now);
}
