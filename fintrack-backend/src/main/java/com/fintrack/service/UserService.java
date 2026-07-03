package com.fintrack.service;

import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetailsImpl) {
            username = ((UserDetailsImpl) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Authenticated user session not found in database."));
    }
}
