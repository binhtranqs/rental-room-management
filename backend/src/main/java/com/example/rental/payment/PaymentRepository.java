package com.example.rental.payment;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	Optional<Payment> findByExternalOrderIdAndExternalRequestId(String externalOrderId, String externalRequestId);
}
