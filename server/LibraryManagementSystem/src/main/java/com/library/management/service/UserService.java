package com.library.management.service;

import com.library.management.dto.UserResponse;

public interface UserService {

    UserResponse getCurrentUser(String email);
}

