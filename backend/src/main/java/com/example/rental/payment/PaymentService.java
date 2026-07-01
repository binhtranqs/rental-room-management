package com.example.rental.payment;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.payment.dto.PaymentRequest;
import com.example.rental.payment.dto.PaymentResponse;
import com.example.rental.user.Role;
import com.example.rental.user.User;

@Service
public class PaymentService {
	private final PaymentRepository paymentRepository;
	private final BillRepository billRepository;

	public PaymentService(PaymentRepository paymentRepository, BillRepository billRepository) {
		this.paymentRepository = paymentRepository;
		this.billRepository = billRepository;
	}

	@Transactional
	public PaymentResponse createMockPayment(User tenant, PaymentRequest request) {
		validateTenant(tenant);

		Bill bill = billRepository.findById(request.billId())
				.filter(existingBill -> existingBill.getTenant().getId().equals(tenant.getId()))
				.orElseThrow(() -> new NotFoundException("Bill not found"));

		if (bill.getStatus() == BillStatus.PAID) {
			throw new ConflictException("Bill is already paid");
		}

		Instant paidAt = Instant.now();
		bill.setStatus(BillStatus.PAID);
		bill.setPaidAt(paidAt);

		Payment payment = Payment.builder()
				.bill(bill)
				.owner(bill.getOwner())
				.tenant(tenant)
				.amount(bill.getTotalAmount())
				.method(request.method())
				.status(PaymentStatus.SUCCESS)
				.paidAt(paidAt)
				.build();

		return PaymentResponse.from(paymentRepository.save(payment));
	}

	private void validateTenant(User user) {
		if (user.getRole() != Role.TENANT) {
			throw new ForbiddenException("Only tenants can pay bills");
		}
	}
}
