package com.example.rental.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.rental.payment.Payment;
import com.example.rental.payment.PaymentMethod;
import com.example.rental.payment.PaymentStatus;

public record PaymentResponse(
		Long id,
		Long billId,
		Long ownerId,
		Long tenantId,
		BigDecimal amount,
		PaymentMethod method,
		PaymentStatus status,
		Instant paidAt,
		Instant createdAt,
		Instant updatedAt) {
	public static PaymentResponse from(Payment payment) {
		return new PaymentResponse(
				payment.getId(),
				payment.getBill().getId(),
				payment.getOwner().getId(),
				payment.getTenant().getId(),
				payment.getAmount(),
				payment.getMethod(),
				payment.getStatus(),
				payment.getPaidAt(),
				payment.getCreatedAt(),
				payment.getUpdatedAt());
	}
}
