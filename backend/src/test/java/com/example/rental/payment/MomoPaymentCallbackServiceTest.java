package com.example.rental.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.payment.dto.MomoPaymentCallbackRequest;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest(properties = {
		"app.momo.partner-code=MOMO_TEST",
		"app.momo.access-key=test-access-key",
		"app.momo.secret-key=test-secret-key",
		"app.momo.redirect-url=http://localhost:5173/tenant/bills",
		"app.momo.ipn-url=http://localhost:8080/payments/momo/ipn"
})
@ActiveProfiles("test")
class MomoPaymentCallbackServiceTest {
	private static final String PARTNER_CODE = "MOMO_TEST";
	private static final String ACCESS_KEY = "test-access-key";
	private static final String SECRET_KEY = "test-secret-key";

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
	void successfulMomoCallbackMarksPaymentAndBillPaid() {
		User owner = saveUser("momo-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("momo-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.UNPAID);
		String orderId = "BILL-" + bill.getId() + "-1000";
		String requestId = "request-" + bill.getId();
		Payment payment = savePendingMomoPayment(bill, owner, tenant, orderId, requestId);

		MomoPaymentCallbackRequest request = successfulCallback(orderId, requestId, bill.getId());
		var response = paymentService.handleMomoCallback(request);

		Payment updatedPayment = paymentRepository.findById(payment.getId()).orElseThrow();
		Bill updatedBill = billRepository.findById(bill.getId()).orElseThrow();
		assertThat(response.paymentId()).isEqualTo(payment.getId());
		assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
		assertThat(response.billStatus()).isEqualTo(BillStatus.PAID);
		assertThat(updatedPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
		assertThat(updatedPayment.getPaidAt()).isNotNull();
		assertThat(updatedPayment.getExternalTransactionId()).isEqualTo(4088878653L);
		assertThat(updatedPayment.getGatewayPayType()).isEqualTo("qr");
		assertThat(updatedBill.getStatus()).isEqualTo(BillStatus.PAID);
		assertThat(updatedBill.getPaidAt()).isNotNull();
	}

	@Test
	void momoCallbackRejectsInvalidSignature() {
		User owner = saveUser("momo-invalid-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("momo-invalid-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = saveBill(owner, tenant, BillStatus.UNPAID);
		String orderId = "BILL-" + bill.getId() + "-1000";
		String requestId = "request-" + bill.getId();
		Payment payment = savePendingMomoPayment(bill, owner, tenant, orderId, requestId);

		MomoPaymentCallbackRequest request = new MomoPaymentCallbackRequest(
				PARTNER_CODE,
				orderId,
				requestId,
				3850000L,
				"Pay bill #" + bill.getId(),
				"momo_wallet",
				4088878653L,
				0,
				"Successful.",
				"qr",
				1721720663942L,
				"",
				"bad-signature");

		assertThatThrownBy(() -> paymentService.handleMomoCallback(request))
				.isInstanceOf(ForbiddenException.class)
				.hasMessage("Invalid MoMo callback signature");

		Payment unchangedPayment = paymentRepository.findById(payment.getId()).orElseThrow();
		Bill unchangedBill = billRepository.findById(bill.getId()).orElseThrow();
		assertThat(unchangedPayment.getStatus()).isEqualTo(PaymentStatus.PENDING);
		assertThat(unchangedBill.getStatus()).isEqualTo(BillStatus.UNPAID);
	}

	private MomoPaymentCallbackRequest successfulCallback(String orderId, String requestId, Long billId) {
		String orderInfo = "Pay bill #" + billId;
		String rawSignature = "accessKey=" + ACCESS_KEY
				+ "&amount=3850000"
				+ "&extraData="
				+ "&message=Successful."
				+ "&orderId=" + orderId
				+ "&orderInfo=" + orderInfo
				+ "&orderType=momo_wallet"
				+ "&partnerCode=" + PARTNER_CODE
				+ "&payType=qr"
				+ "&requestId=" + requestId
				+ "&responseTime=1721720663942"
				+ "&resultCode=0"
				+ "&transId=4088878653";

		return new MomoPaymentCallbackRequest(
				PARTNER_CODE,
				orderId,
				requestId,
				3850000L,
				orderInfo,
				"momo_wallet",
				4088878653L,
				0,
				"Successful.",
				"qr",
				1721720663942L,
				"",
				hmacSha256(rawSignature));
	}

	private Payment savePendingMomoPayment(Bill bill, User owner, User tenant, String orderId, String requestId) {
		return paymentRepository.save(Payment.builder()
				.bill(bill)
				.owner(owner)
				.tenant(tenant)
				.amount(bill.getTotalAmount())
				.method(PaymentMethod.MOMO)
				.status(PaymentStatus.PENDING)
				.externalOrderId(orderId)
				.externalRequestId(requestId)
				.build());
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
				.name("MoMo Room")
				.address("District 1")
				.area(25.0)
				.price(BigDecimal.valueOf(3500000))
				.status(RoomStatus.OCCUPIED)
				.description("MoMo callback test room")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("MoMo User")
				.email(email)
				.password("encoded-password")
				.role(role)
				.build());
	}

	private String hmacSha256(String value) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
		}
		catch (Exception ex) {
			throw new IllegalStateException(ex);
		}
	}
}
