package com.example.rental.payment.dto;

import com.example.rental.bill.BillStatus;
import com.example.rental.payment.Payment;
import com.example.rental.payment.PaymentStatus;

public record MomoPaymentCallbackResponse(
		Long paymentId,
		Long billId,
		PaymentStatus paymentStatus,
		BillStatus billStatus,
		String orderId,
		String requestId,
		Long transactionId,
		Integer resultCode,
		String message) {
	public static MomoPaymentCallbackResponse from(Payment payment) {
		return new MomoPaymentCallbackResponse(
				payment.getId(),
				payment.getBill().getId(),
				payment.getStatus(),
				payment.getBill().getStatus(),
				payment.getExternalOrderId(),
				payment.getExternalRequestId(),
				payment.getExternalTransactionId(),
				payment.getGatewayResultCode(),
				payment.getGatewayMessage());
	}
}
