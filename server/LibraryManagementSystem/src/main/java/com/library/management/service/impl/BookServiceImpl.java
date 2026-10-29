package com.library.management.service.impl;

import com.library.management.dto.BookResponse;
import com.library.management.entity.Book;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookRepository;
import com.library.management.service.BookService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks(String query, String category) {
        List<Book> books;
        if (query != null && !query.trim().isEmpty()) {
            books = bookRepository.searchBooks(query.trim());
        } else if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category.trim())) {
            books = bookRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            books = bookRepository.findAll();
        }
        return books.stream().map(BookResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        Book book = getBookEntityById(id);
        return BookResponse.fromEntity(book);
    }

    @Override
    @Transactional(readOnly = true)
    public Book getBookEntityById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    @Override
    @Transactional
    public Book getBookEntityByIdForUpdate(Long id) {
        return bookRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }
}

