package com.library.management.service;

import com.library.management.dto.AuthResponse;
import com.library.management.dto.LoginRequest;
import com.library.management.dto.RegisterRequest;
import com.library.management.dto.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}

