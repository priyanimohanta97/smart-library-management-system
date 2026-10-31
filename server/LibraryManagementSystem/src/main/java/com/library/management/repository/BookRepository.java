package com.library.management.repository;

import com.library.management.entity.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {

    Optional<Book> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCallNumber(String callNumber);

    boolean existsByTitleIgnoreCaseAndAuthorIgnoreCase(String title, String author);

    List<Book> findByCategoryIgnoreCase(String category);

    @Query("{ '$or': [ " +
            "{ 'title': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'author': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'callNumber': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'category': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    List<Book> searchBooks(String query);
}
