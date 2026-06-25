package com.example.rental.bill;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.bill.dto.BillRequest;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class BillServiceTest {
	@Autowired
	private BillService billService;

	@Autowired
	private ContractRepository contractRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	void ownerCanCreateBillAndTotalAmountIsCalculated() {
		User owner = saveUser("bill-owner@example.com", Role.OWNER);
		User tenant = saveUser("bill-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Bill Room"));

		var bill = billService.createBill(owner, request(contract.getId()));

		assertThat(bill.status()).isEqualTo(BillStatus.UNPAID);
		assertThat(bill.totalAmount()).isEqualByComparingTo("3850000");
		assertThat(bill.ownerId()).isEqualTo(owner.getId());
		assertThat(bill.tenantId()).isEqualTo(tenant.getId());
	}

	@Test
	void ownerAndTenantCanListVisibleBills() {
		User owner = saveUser("bill-visible-owner@example.com", Role.OWNER);
		User tenant = saveUser("bill-visible-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Visible Bill Room"));
		billService.createBill(owner, request(contract.getId()));

		var ownerBills = billService.getBills(owner, "visible", BillStatus.UNPAID, LocalDate.of(2026, 6, 1), PageRequest.of(0, 10));
		var tenantBills = billService.getBills(tenant, "visible", BillStatus.UNPAID, LocalDate.of(2026, 6, 1), PageRequest.of(0, 10));

		assertThat(ownerBills.getTotalElements()).isEqualTo(1);
		assertThat(tenantBills.getTotalElements()).isEqualTo(1);
	}

	@Test
	void tenantCannotReadAnotherTenantsBill() {
		User owner = saveUser("bill-private-owner@example.com", Role.OWNER);
		User tenant = saveUser("bill-private-tenant@example.com", Role.TENANT);
		User otherTenant = saveUser("bill-other-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Private Bill Room"));
		var bill = billService.createBill(owner, request(contract.getId()));

		assertThatThrownBy(() -> billService.getBill(otherTenant, bill.id()))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Bill not found");
	}

	@Test
	void ownerCanMarkBillAsPaid() {
		User owner = saveUser("bill-paid-owner@example.com", Role.OWNER);
		User tenant = saveUser("bill-paid-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Paid Bill Room"));
		var bill = billService.createBill(owner, request(contract.getId()));

		var paidBill = billService.markPaid(owner, bill.id());

		assertThat(paidBill.status()).isEqualTo(BillStatus.PAID);
		assertThat(paidBill.paidAt()).isNotNull();
	}

	@Test
	void ownerCannotMarkAnotherOwnersBillAsPaid() {
		User owner = saveUser("bill-owner-a@example.com", Role.OWNER);
		User anotherOwner = saveUser("bill-owner-b@example.com", Role.OWNER);
		User tenant = saveUser("bill-owner-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Private Paid Bill Room"));
		var bill = billService.createBill(owner, request(contract.getId()));

		assertThatThrownBy(() -> billService.markPaid(anotherOwner, bill.id()))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Bill not found");
	}

	@Test
	void markingAlreadyPaidBillReturnsConflict() {
		User owner = saveUser("bill-already-paid-owner@example.com", Role.OWNER);
		User tenant = saveUser("bill-already-paid-tenant@example.com", Role.TENANT);
		Contract contract = saveContract(owner, tenant, saveRoom(owner, "Already Paid Bill Room"));
		var bill = billService.createBill(owner, request(contract.getId()));
		billService.markPaid(owner, bill.id());

		assertThatThrownBy(() -> billService.markPaid(owner, bill.id()))
				.isInstanceOf(ConflictException.class)
				.hasMessage("Bill is already paid");
	}

	private BillRequest request(Long contractId) {
		return new BillRequest(
				contractId,
				LocalDate.of(2026, 6, 1),
				BigDecimal.valueOf(3500000),
				BigDecimal.valueOf(150000),
				BigDecimal.valueOf(100000),
				BigDecimal.valueOf(100000),
				null,
				LocalDate.of(2026, 6, 10));
	}

	private Contract saveContract(User owner, User tenant, Room room) {
		return contractRepository.save(Contract.builder()
				.owner(owner)
				.tenant(tenant)
				.room(room)
				.startDate(LocalDate.of(2026, 1, 1))
				.endDate(LocalDate.of(2027, 1, 1))
				.deposit(BigDecimal.valueOf(1000000))
				.monthlyRent(BigDecimal.valueOf(3500000))
				.status(ContractStatus.ACTIVE)
				.build());
	}

	private Room saveRoom(User owner, String name) {
		return roomRepository.save(Room.builder()
				.owner(owner)
				.name(name)
				.address("District 1")
				.area(25.0)
				.price(BigDecimal.valueOf(3500000))
				.status(RoomStatus.OCCUPIED)
				.description("Room for bill test")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("Bill User")
				.email(email)
				.password("encoded-password")
				.role(role)
				.build());
	}
}
