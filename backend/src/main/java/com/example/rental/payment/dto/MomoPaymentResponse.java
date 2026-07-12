package com.example.rental.payment.dto;

import java.math.BigDecimal;

import com.example.rental.payment.Payment;
import com.example.rental.payment.PaymentMethod;
import com.example.rental.payment.PaymentStatus;

public record MomoPaymentResponse(
		Long paymentId,
		Long billId,
		BigDecimal amount,
		PaymentMethod method,
		PaymentStatus status,
		String partnerCode,
		String orderId,
		String requestId,
		String payUrl,
		String deeplink,
		String qrCodeUrl,
		Integer resultCode,
		String message) {
	public static MomoPaymentResponse from(Payment payment, String partnerCode) {
		return new MomoPaymentResponse(
				payment.getId(),
				payment.getBill().getId(),
				payment.getAmount(),
				payment.getMethod(),
				payment.getStatus(),
				partnerCode,
				payment.getExternalOrderId(),
				payment.getExternalRequestId(),
				payment.getPayUrl(),
				payment.getDeeplink(),
				payment.getQrCodeUrl(),
				payment.getGatewayResultCode(),
				payment.getGatewayMessage());
	}
}
