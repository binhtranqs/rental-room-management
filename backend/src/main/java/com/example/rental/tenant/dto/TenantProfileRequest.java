package com.example.rental.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantProfileRequest(
		@NotBlank String name,
		@NotBlank @Email String email,
		@NotBlank @Size(min = 6) String password,
		@NotBlank String phone,
		@NotBlank String identityNumber,
		String emergencyContact) {
}
