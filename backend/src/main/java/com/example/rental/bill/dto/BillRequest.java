package com.example.rental.bill.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.rental.bill.BillStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record BillRequest(
		@NotNull Long contractId,
		@NotNull LocalDate month,
		@NotNull @DecimalMin("0.0") BigDecimal roomRent,
		@NotNull @DecimalMin("0.0") BigDecimal electricityFee,
		@NotNull @DecimalMin("0.0") BigDecimal waterFee,
		@NotNull @DecimalMin("0.0") BigDecimal serviceFee,
		BillStatus status,
		@NotNull LocalDate dueDate) {
}
