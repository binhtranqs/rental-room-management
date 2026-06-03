package com.example.rental.contract.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractStatus;
import com.example.rental.room.RoomStatus;

public record ContractResponse(
		Long id,
		Long ownerId,
		Long tenantId,
		String tenantName,
		String tenantEmail,
		Long roomId,
		String roomName,
		RoomStatus roomStatus,
		LocalDate startDate,
		LocalDate endDate,
		BigDecimal deposit,
		BigDecimal monthlyRent,
		ContractStatus status,
		Instant createdAt,
		Instant updatedAt) {
	public static ContractResponse from(Contract contract) {
		return new ContractResponse(
				contract.getId(),
				contract.getOwner().getId(),
				contract.getTenant().getId(),
				contract.getTenant().getName(),
				contract.getTenant().getEmail(),
				contract.getRoom().getId(),
				contract.getRoom().getName(),
				contract.getRoom().getStatus(),
				contract.getStartDate(),
				contract.getEndDate(),
				contract.getDeposit(),
				contract.getMonthlyRent(),
				contract.getStatus(),
				contract.getCreatedAt(),
				contract.getUpdatedAt());
	}
}
