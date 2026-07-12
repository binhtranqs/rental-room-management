package com.example.rental.payment;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.payment.dto.MomoPaymentRequest;
import com.example.rental.payment.dto.MomoPaymentResponse;
import com.example.rental.payment.dto.PaymentRequest;
import com.example.rental.payment.dto.PaymentResponse;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments")
@PreAuthorize("hasRole('TENANT')")
public class PaymentController {
	private final PaymentService paymentService;

	public PaymentController(PaymentService paymentService) {
		this.paymentService = paymentService;
	}

	@PostMapping("/mock")
	@ResponseStatus(HttpStatus.CREATED)
	public PaymentResponse createMockPayment(
			@AuthenticationPrincipal User tenant,
			@Valid @RequestBody PaymentRequest request) {
		return paymentService.createMockPayment(tenant, request);
	}

	@PostMapping("/momo")
	@ResponseStatus(HttpStatus.CREATED)
	public MomoPaymentResponse createMomoPayment(
			@AuthenticationPrincipal User tenant,
			@Valid @RequestBody MomoPaymentRequest request) {
		return paymentService.createMomoPayment(tenant, request);
	}
}
