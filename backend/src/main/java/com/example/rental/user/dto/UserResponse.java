package com.example.rental.user.dto;

import java.time.Instant;

import com.example.rental.user.Role;
import com.example.rental.user.User;

public record UserResponse(
		Long id,
		String name,
		String email,
		Role role,
		Instant createdAt,
		Instant updatedAt) {
	public static UserResponse from(User user) {
		return new UserResponse(
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getRole(),
				user.getCreatedAt(),
				user.getUpdatedAt());
	}
}
