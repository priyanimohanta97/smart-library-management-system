package com.library.management.service;

import com.library.management.dto.BookResponse;
import com.library.management.entity.Book;

import java.util.List;

public interface BookService {

    List<BookResponse> getAllBooks(String query, String category);

    BookResponse getBookById(String id);

    Book getBookEntityById(String id);
}
