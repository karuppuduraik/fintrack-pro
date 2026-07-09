package com.fintrack.controller;

import com.fintrack.dto.MessageResponse;
import com.fintrack.dto.SignupRequest;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Users Manager", description = "User administration controls CRUD (ADMIN role only)")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @Operation(summary = "Get list of all users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<?> createUser(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER") // Default role for created users
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details or password")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long id, @RequestBody User requestData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check unique fields if username/email changed
        if (!user.getUsername().equals(requestData.getUsername()) && userRepository.existsByUsername(requestData.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }
        if (!user.getEmail().equals(requestData.getEmail()) && userRepository.existsByEmail(requestData.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        user.setUsername(requestData.getUsername());
        user.setEmail(requestData.getEmail());
        user.setRole(requestData.getRole());

        // Update password if provided in raw format
        if (requestData.getPassword() != null && !requestData.getPassword().trim().isEmpty() && !requestData.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(requestData.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User account deleted successfully!"));
    }
}
