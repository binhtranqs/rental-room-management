package com.example.rental.dashboard.dto;

import java.math.BigDecimal;

public record OwnerDashboardResponse(
		long totalRooms,
		long occupiedRooms,
		long availableRooms,
		long activeContracts,
		long unpaidBills,
		BigDecimal monthlyRevenue) {
}
