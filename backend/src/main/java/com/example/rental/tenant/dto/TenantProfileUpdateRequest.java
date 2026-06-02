package com.example.rental.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TenantProfileUpdateRequest(
		@NotBlank String name,
		@NotBlank @Email String email,
		@NotBlank String phone,
		@NotBlank String identityNumber,
		String emergencyContact) {
}
