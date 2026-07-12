package com.example.rental.payment.dto;

public record MomoCreatePaymentResponse(
		String partnerCode,
		String orderId,
		String requestId,
		Long amount,
		Long responseTime,
		String message,
		Integer resultCode,
		String payUrl,
		String deeplink,
		String qrCodeUrl) {
}
