package com.example.rental.payment.dto;

import com.example.rental.payment.PaymentMethod;

import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
		@NotNull Long billId,
		@NotNull PaymentMethod method) {
}
