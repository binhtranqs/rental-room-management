package com.example.rental.contract.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.rental.contract.ContractStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public record ContractRequest(
		@NotNull Long tenantId,
		@NotNull Long roomId,
		@NotNull LocalDate startDate,
		@NotNull @FutureOrPresent LocalDate endDate,
		@NotNull @DecimalMin("0.0") BigDecimal deposit,
		@NotNull @DecimalMin("0.0") BigDecimal monthlyRent,
		@NotNull ContractStatus status) {
}
