package com.example.rental.payment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.rental.payment.dto.MomoPaymentCallbackRequest;
import com.example.rental.payment.dto.MomoPaymentCallbackResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments/momo")
public class MomoCallbackController {
	private final PaymentService paymentService;

	public MomoCallbackController(PaymentService paymentService) {
		this.paymentService = paymentService;
	}

	@PostMapping("/ipn")
	public MomoPaymentCallbackResponse handleIpn(@Valid @RequestBody MomoPaymentCallbackRequest request) {
		return paymentService.handleMomoCallback(request);
	}

	@GetMapping("/return")
	@ResponseStatus(HttpStatus.OK)
	public MomoPaymentCallbackResponse handleReturn(
			@RequestParam String partnerCode,
			@RequestParam String orderId,
			@RequestParam String requestId,
			@RequestParam Long amount,
			@RequestParam String orderInfo,
			@RequestParam String orderType,
			@RequestParam Long transId,
			@RequestParam Integer resultCode,
			@RequestParam String message,
			@RequestParam String payType,
			@RequestParam Long responseTime,
			@RequestParam(defaultValue = "") String extraData,
			@RequestParam String signature) {
		return paymentService.handleMomoCallback(new MomoPaymentCallbackRequest(
				partnerCode,
				orderId,
				requestId,
				amount,
				orderInfo,
				orderType,
				transId,
				resultCode,
				message,
				payType,
				responseTime,
				extraData,
				signature));
	}
}
