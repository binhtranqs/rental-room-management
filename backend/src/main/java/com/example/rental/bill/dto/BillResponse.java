package com.example.rental.bill.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillStatus;

public record BillResponse(
		Long id,
		Long ownerId,
		Long tenantId,
		String tenantName,
		String tenantEmail,
		Long contractId,
		Long roomId,
		String roomName,
		LocalDate month,
		BigDecimal roomRent,
		BigDecimal electricityFee,
		BigDecimal waterFee,
		BigDecimal serviceFee,
		BigDecimal totalAmount,
		BillStatus status,
		LocalDate dueDate,
		Instant paidAt,
		Instant createdAt,
		Instant updatedAt) {
	public static BillResponse from(Bill bill) {
		return new BillResponse(
				bill.getId(),
				bill.getOwner().getId(),
				bill.getTenant().getId(),
				bill.getTenant().getName(),
				bill.getTenant().getEmail(),
				bill.getContract().getId(),
				bill.getContract().getRoom().getId(),
				bill.getContract().getRoom().getName(),
				bill.getMonth(),
				bill.getRoomRent(),
				bill.getElectricityFee(),
				bill.getWaterFee(),
				bill.getServiceFee(),
				bill.getTotalAmount(),
				bill.getStatus(),
				bill.getDueDate(),
				bill.getPaidAt(),
				bill.getCreatedAt(),
				bill.getUpdatedAt());
	}
}
