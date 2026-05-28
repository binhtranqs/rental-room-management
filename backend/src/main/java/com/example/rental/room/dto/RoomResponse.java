package com.example.rental.room.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.rental.room.Room;
import com.example.rental.room.RoomStatus;

public record RoomResponse(
		Long id,
		Long ownerId,
		String name,
		String address,
		Double area,
		BigDecimal price,
		RoomStatus status,
		String description,
		Instant createdAt,
		Instant updatedAt) {
	public static RoomResponse from(Room room) {
		return new RoomResponse(
				room.getId(),
				room.getOwner().getId(),
				room.getName(),
				room.getAddress(),
				room.getArea(),
				room.getPrice(),
				room.getStatus(),
				room.getDescription(),
				room.getCreatedAt(),
				room.getUpdatedAt());
	}
}
