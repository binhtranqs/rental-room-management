package com.example.rental.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MomoPaymentCallbackRequest(
		@NotBlank String partnerCode,
		@NotBlank String orderId,
		@NotBlank String requestId,
		@NotNull Long amount,
		@NotBlank String orderInfo,
		@NotBlank String orderType,
		@NotNull Long transId,
		@NotNull Integer resultCode,
		@NotBlank String message,
		@NotBlank String payType,
		@NotNull Long responseTime,
		String extraData,
		@NotBlank String signature) {
}
