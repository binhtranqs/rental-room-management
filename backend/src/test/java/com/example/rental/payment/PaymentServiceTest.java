package com.example.rental.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.payment.dto.MomoPaymentRequest;
import com.example.rental.payment.dto.PaymentRequest;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class PaymentServiceTest {
	@Autowired
	private PaymentService paymentService;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private BillRepository billRepository;

	@Autowired
	private ContractRepository contractRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	void tenantCanPayOwnUnpaidBillWithMockPayment() {
		User owner = saveUser("payment-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("payment-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.UNPAID);

		var payment = paymentService.createMockPayment(
				tenant,
				new PaymentRequest(bill.getId(), PaymentMethod.MOCK_BANK_TRANSFER));

		Bill paidBill = billRepository.findById(bill.getId()).orElseThrow();
		assertThat(payment.billId()).isEqualTo(bill.getId());
		assertThat(payment.tenantId()).isEqualTo(tenant.getId());
		assertThat(payment.ownerId()).isEqualTo(owner.getId());
		assertThat(payment.amount()).isEqualByComparingTo("3850000");
		assertThat(payment.method()).isEqualTo(PaymentMethod.MOCK_BANK_TRANSFER);
		assertThat(payment.status()).isEqualTo(PaymentStatus.SUCCESS);
		assertThat(payment.paidAt()).isNotNull();
		assertThat(paidBill.getStatus()).isEqualTo(BillStatus.PAID);
		assertThat(paidBill.getPaidAt()).isNotNull();
		assertThat(paymentRepository.findAll()).anyMatch(savedPayment -> savedPayment.getBill().getId().equals(bill.getId()));
	}

	@Test
	void tenantCannotPayAnotherTenantsBill() {
		User owner = saveUser("payment-private-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("payment-private-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		User otherTenant = saveUser("payment-other-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.UNPAID);

		assertThatThrownBy(() -> paymentService.createMockPayment(
				otherTenant,
				new PaymentRequest(bill.getId(), PaymentMethod.MOCK_E_WALLET)))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Bill not found");
	}

	@Test
	void payingAlreadyPaidBillReturnsConflict() {
		User owner = saveUser("payment-paid-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("payment-paid-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.PAID);

		assertThatThrownBy(() -> paymentService.createMockPayment(
				tenant,
				new PaymentRequest(bill.getId(), PaymentMethod.MOCK_CASH)))
				.isInstanceOf(ConflictException.class)
				.hasMessage("Bill is already paid");
	}

	@Test
	void momoPaymentRequiresConfigurationAndKeepsBillUnpaid() {
		User owner = saveUser("payment-momo-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("payment-momo-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.UNPAID);

		assertThatThrownBy(() -> paymentService.createMomoPayment(tenant, new MomoPaymentRequest(bill.getId())))
				.isInstanceOf(ConflictException.class)
				.hasMessage("MoMo payment is not configured. Use mock payment instead.");

		Bill unchangedBill = billRepository.findById(bill.getId()).orElseThrow();
		assertThat(unchangedBill.getStatus()).isEqualTo(BillStatus.UNPAID);
		assertThat(unchangedBill.getPaidAt()).isNull();
	}

	private Bill saveBill(User owner, User tenant, BillStatus status) {
		Contract contract = saveContract(owner, tenant, saveRoom(owner));
		return billRepository.save(Bill.builder()
				.owner(owner)
				.tenant(tenant)
				.contract(contract)
				.month(LocalDate.now().withDayOfMonth(1))
				.roomRent(BigDecimal.valueOf(3500000))
				.electricityFee(BigDecimal.valueOf(150000))
				.waterFee(BigDecimal.valueOf(100000))
				.serviceFee(BigDecimal.valueOf(100000))
				.totalAmount(BigDecimal.valueOf(3850000))
				.status(status)
				.dueDate(LocalDate.now().withDayOfMonth(10))
				.build());
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

	private Room saveRoom(User owner) {
		return roomRepository.save(Room.builder()
				.owner(owner)
				.name("Payment Room")
				.address("District 1")
				.area(25.0)
				.price(BigDecimal.valueOf(3500000))
				.status(RoomStatus.OCCUPIED)
				.description("Payment test room")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("Payment User")
				.email(email)
				.password("encoded-password")
				.role(role)
				.build());
	}
}
