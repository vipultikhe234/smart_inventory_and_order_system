package com.smartinventory.user.controller;

import com.smartinventory.user.entity.User;
import com.smartinventory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/admin")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/list")
    public ResponseEntity<?> getAllUsers(@RequestHeader(name = "X-Auth-Roles", defaultValue = "GUEST") String roles) {
        log.info("Received request to list users. Roles: {}", roles);
        
        if (!roles.contains("ROLE_ADMIN")) {
            log.warn("Access denied for roles: {}", roles);
            return new ResponseEntity<>("Access Denied: Admin role required", HttpStatus.FORBIDDEN);
        }
        
        try {
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return new ResponseEntity<>("Internal Server Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader(name = "X-Auth-Roles", defaultValue = "GUEST") String roles,
            @PathVariable Long id) {
            
        if (!roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>("Access Denied", HttpStatus.FORBIDDEN);
        }
        
        try {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getUserStats() {
        return ResponseEntity.ok(java.util.Map.of("totalUsers", userRepository.count()));
    }
}
