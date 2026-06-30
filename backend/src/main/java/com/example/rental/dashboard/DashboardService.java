package com.example.rental.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.dashboard.dto.OwnerDashboardResponse;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.User;

@Service
public class DashboardService {
	private final RoomRepository roomRepository;
	private final ContractRepository contractRepository;
	private final BillRepository billRepository;

	public DashboardService(
			RoomRepository roomRepository,
			ContractRepository contractRepository,
			BillRepository billRepository) {
		this.roomRepository = roomRepository;
		this.contractRepository = contractRepository;
		this.billRepository = billRepository;
	}

	@Transactional(readOnly = true)
	public OwnerDashboardResponse getOwnerDashboard(User owner) {
		LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
		LocalDate nextMonthStart = monthStart.plusMonths(1);

		long totalRooms = roomRepository.countByOwner(owner);
		long occupiedRooms = roomRepository.countByOwnerAndStatus(owner, RoomStatus.OCCUPIED);
		long availableRooms = roomRepository.countByOwnerAndStatus(owner, RoomStatus.AVAILABLE);
		long activeContracts = contractRepository.countByOwnerAndStatus(owner, ContractStatus.ACTIVE);
		long unpaidBills = billRepository.countByOwnerAndStatus(owner, BillStatus.UNPAID);
		BigDecimal monthlyRevenue = billRepository.sumPaidRevenueByOwnerAndMonth(owner, BillStatus.PAID, monthStart, nextMonthStart);

		return new OwnerDashboardResponse(
				totalRooms,
				occupiedRooms,
				availableRooms,
				activeContracts,
				unpaidBills,
				monthlyRevenue);
	}
}
