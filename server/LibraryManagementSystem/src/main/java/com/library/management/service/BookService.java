package com.library.management.service;

import com.library.management.dto.BookCreateRequest;
import com.library.management.dto.BookResponse;
import com.library.management.entity.Book;

import java.util.List;

public interface BookService {

    List<BookResponse> getAllBooks(String query, String category);

    List<BookResponse> getAllBooks(String query, String category, boolean includeArchived);

    BookResponse getBookById(String id);

    Book getBookEntityById(String id);

    BookResponse createBook(BookCreateRequest request);

    BookResponse archiveBook(String bookId);
}
