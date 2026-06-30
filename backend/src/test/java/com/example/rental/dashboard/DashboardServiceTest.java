package com.example.rental.dashboard;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.dashboard.dto.OwnerDashboardResponse;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class DashboardServiceTest {
	@Autowired
	private DashboardService dashboardService;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private ContractRepository contractRepository;

	@Autowired
	private BillRepository billRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	void ownerDashboardReturnsOnlyCurrentOwnersMetrics() {
		User owner = saveUser("dashboard-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User otherOwner = saveUser("dashboard-other-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("dashboard-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);

		Room occupiedRoom = saveRoom(owner, "Dashboard Occupied", RoomStatus.OCCUPIED);
		saveRoom(owner, "Dashboard Available", RoomStatus.AVAILABLE);
		saveRoom(owner, "Dashboard Maintenance", RoomStatus.MAINTENANCE);
		Contract activeContract = saveContract(owner, tenant, occupiedRoom, ContractStatus.ACTIVE);
		saveContract(owner, tenant, occupiedRoom, ContractStatus.ENDED);
		saveBill(owner, tenant, activeContract, currentMonth, BillStatus.UNPAID, "1000000");
		saveBill(owner, tenant, activeContract, currentMonth, BillStatus.PAID, "3850000");
		saveBill(owner, tenant, activeContract, currentMonth.minusMonths(1), BillStatus.PAID, "999999");

		Room otherRoom = saveRoom(otherOwner, "Other Owner Room", RoomStatus.OCCUPIED);
		Contract otherContract = saveContract(otherOwner, tenant, otherRoom, ContractStatus.ACTIVE);
		saveBill(otherOwner, tenant, otherContract, currentMonth, BillStatus.UNPAID, "2000000");
		saveBill(otherOwner, tenant, otherContract, currentMonth, BillStatus.PAID, "2000000");

		OwnerDashboardResponse dashboard = dashboardService.getOwnerDashboard(owner);

		assertThat(dashboard.totalRooms()).isEqualTo(3);
		assertThat(dashboard.occupiedRooms()).isEqualTo(1);
		assertThat(dashboard.availableRooms()).isEqualTo(1);
		assertThat(dashboard.activeContracts()).isEqualTo(1);
		assertThat(dashboard.unpaidBills()).isEqualTo(1);
		assertThat(dashboard.monthlyRevenue()).isEqualByComparingTo("3850000");
	}

	private Bill saveBill(
			User owner,
			User tenant,
			Contract contract,
			LocalDate month,
			BillStatus status,
			String totalAmount) {
		return billRepository.save(Bill.builder()
				.owner(owner)
				.tenant(tenant)
				.contract(contract)
				.month(month)
				.roomRent(new BigDecimal(totalAmount))
				.electricityFee(BigDecimal.ZERO)
				.waterFee(BigDecimal.ZERO)
				.serviceFee(BigDecimal.ZERO)
				.totalAmount(new BigDecimal(totalAmount))
				.status(status)
				.dueDate(month.plusDays(10))
				.build());
	}

	private Contract saveContract(User owner, User tenant, Room room, ContractStatus status) {
		return contractRepository.save(Contract.builder()
				.owner(owner)
				.tenant(tenant)
				.room(room)
				.startDate(LocalDate.of(2026, 1, 1))
				.endDate(LocalDate.of(2027, 1, 1))
				.deposit(BigDecimal.valueOf(1000000))
				.monthlyRent(BigDecimal.valueOf(3500000))
				.status(status)
				.build());
	}

	private Room saveRoom(User owner, String name, RoomStatus status) {
		return roomRepository.save(Room.builder()
				.owner(owner)
				.name(name)
				.address("District 1")
				.area(25.0)
				.price(BigDecimal.valueOf(3500000))
				.status(status)
				.description("Dashboard test room")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("Dashboard User")
				.email(email)
				.password("encoded-password")
				.role(role)
				.build());
	}
}
