package com.example.rental.tenant.dto;

import java.time.Instant;

import com.example.rental.tenant.TenantProfile;

public record TenantProfileResponse(
		Long id,
		Long userId,
		Long ownerId,
		String name,
		String email,
		String phone,
		String identityNumber,
		String emergencyContact,
		Instant createdAt,
		Instant updatedAt) {
	public static TenantProfileResponse from(TenantProfile profile) {
		return new TenantProfileResponse(
				profile.getId(),
				profile.getUser().getId(),
				profile.getOwner().getId(),
				profile.getUser().getName(),
				profile.getUser().getEmail(),
				profile.getPhone(),
				profile.getIdentityNumber(),
				profile.getEmergencyContact(),
				profile.getCreatedAt(),
				profile.getUpdatedAt());
	}
}
