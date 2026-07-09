package com.fintrack.controller;

import com.fintrack.dto.MessageResponse;
import com.fintrack.dto.ProfileUpdateRequest;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users/profile")
@Tag(name = "Profile", description = "User profile and security configuration APIs")
public class ProfileController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @Operation(summary = "Get current logged-in user details")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping
    @Operation(summary = "Update logged-in user email or change password")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = userService.getCurrentUser();

        // If email is changing, check uniqueness
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            user.setEmail(request.getEmail());
        }

        // If password update is requested
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            // Verify current password
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Current password is required to set a new password."));
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Incorrect current password."));
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
