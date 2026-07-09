package com.fintrack.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @Email(message = "Please enter a valid email address")
    private String email;

    private String currentPassword;
    private String newPassword;
}
