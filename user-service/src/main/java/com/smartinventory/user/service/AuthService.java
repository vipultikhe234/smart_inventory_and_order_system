package com.smartinventory.user.service;

import com.smartinventory.user.dto.AuthRequest;
import com.smartinventory.user.dto.AuthResponse;
import com.smartinventory.user.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
}
