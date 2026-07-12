package com.example.rental.payment.dto;

import jakarta.validation.constraints.NotNull;

public record MomoPaymentRequest(
		@NotNull Long billId) {
}
