package com.example.rental.bill;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.rental.bill.dto.BillRequest;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.security.JwtService;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillVisibilityIntegrationTest {
	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private BillService billService;

	@Autowired
	private ContractRepository contractRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@Test
	void ownerCanListAndReadOwnBillThroughApi() throws Exception {
		User owner = saveUser("bill-api-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("bill-api-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = createBill(owner, tenant, "Owner Visible Room");

		mockMvc.perform(get("/bills")
						.header("Authorization", bearer(owner))
						.param("keyword", "owner visible")
						.param("status", "UNPAID")
						.param("month", "2026-06-01")
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(1))
				.andExpect(jsonPath("$.content[0].id").value(bill.getId()))
				.andExpect(jsonPath("$.content[0].ownerId").value(owner.getId()));

		mockMvc.perform(get("/bills/{id}", bill.getId())
						.header("Authorization", bearer(owner))
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(bill.getId()))
				.andExpect(jsonPath("$.ownerId").value(owner.getId()));
	}

	@Test
	void tenantCanOnlyListAndReadOwnBillsThroughApi() throws Exception {
		User owner = saveUser("bill-api-owner-two-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("bill-api-tenant-own-" + System.nanoTime() + "@example.com", Role.TENANT);
		User otherTenant = saveUser("bill-api-tenant-other-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill ownBill = createBill(owner, tenant, "Tenant Own Room");
		Bill otherBill = createBill(owner, otherTenant, "Tenant Other Room");

		mockMvc.perform(get("/bills")
						.header("Authorization", bearer(tenant))
						.param("status", "UNPAID")
						.param("month", "2026-06-01")
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(1))
				.andExpect(jsonPath("$.content[0].id").value(ownBill.getId()))
				.andExpect(jsonPath("$.content[0].tenantId").value(tenant.getId()));

		mockMvc.perform(get("/bills/{id}", ownBill.getId())
						.header("Authorization", bearer(tenant))
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(ownBill.getId()))
				.andExpect(jsonPath("$.tenantId").value(tenant.getId()));

		mockMvc.perform(get("/bills/{id}", otherBill.getId())
						.header("Authorization", bearer(tenant))
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Bill not found"));
	}

	@Test
	void anotherOwnerCannotReadBillThroughApi() throws Exception {
		User owner = saveUser("bill-api-private-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User anotherOwner = saveUser("bill-api-private-another-owner-" + System.nanoTime() + "@example.com", Role.OWNER);
		User tenant = saveUser("bill-api-private-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);
		Bill bill = createBill(owner, tenant, "Private Owner Bill Room");

		mockMvc.perform(get("/bills/{id}", bill.getId())
						.header("Authorization", bearer(anotherOwner))
						.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Bill not found"));
	}

	private Bill createBill(User owner, User tenant, String roomName) {
		Contract contract = saveContract(owner, tenant, saveRoom(owner, roomName));
		var response = billService.createBill(owner, new BillRequest(
				contract.getId(),
				LocalDate.of(2026, 6, 1),
				BigDecimal.valueOf(3500000),
				BigDecimal.valueOf(150000),
				BigDecimal.valueOf(100000),
				BigDecimal.valueOf(100000),
				null,
				LocalDate.of(2026, 6, 10)));

		return new Bill(
				response.id(),
				owner,
				tenant,
				contract,
				response.month(),
				response.roomRent(),
				response.electricityFee(),
				response.waterFee(),
				response.serviceFee(),
				response.totalAmount(),
				response.status(),
				response.dueDate(),
				response.paidAt(),
				response.createdAt(),
				response.updatedAt());
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
				.description("Room for bill visibility test")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("Bill API User")
				.email(email)
				.password(passwordEncoder.encode("123456"))
				.role(role)
				.build());
	}

	private String bearer(User user) {
		return "Bearer " + jwtService.generateToken(user);
	}
}
