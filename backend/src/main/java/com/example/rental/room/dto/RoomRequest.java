package com.example.rental.room.dto;

import java.math.BigDecimal;

import com.example.rental.room.RoomStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RoomRequest(
		@NotBlank String name,
		@NotBlank String address,
		@NotNull @Positive Double area,
		@NotNull @DecimalMin("0.0") BigDecimal price,
		@NotNull RoomStatus status,
		String description) {
}
