package com.example.rental.contract;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.dto.ContractRequest;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.tenant.TenantProfile;
import com.example.rental.tenant.TenantProfileRepository;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class ContractServiceTest {
	@Autowired
	private ContractService contractService;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private TenantProfileRepository tenantProfileRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	void creatingAndEndingActiveContractUpdatesRoomStatus() {
		User owner = saveUser("contract-owner@example.com", Role.OWNER);
		TenantProfile tenant = saveTenantProfile(owner, "contract-tenant@example.com");
		Room room = saveRoom(owner, "Contract Room");

		var contract = contractService.createContract(owner, request(tenant.getId(), room.getId(), ContractStatus.ACTIVE));

		assertThat(contract.status()).isEqualTo(ContractStatus.ACTIVE);
		assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus()).isEqualTo(RoomStatus.OCCUPIED);

		var endedContract = contractService.endContract(owner, contract.id());

		assertThat(endedContract.status()).isEqualTo(ContractStatus.ENDED);
		assertThat(roomRepository.findById(room.getId()).orElseThrow().getStatus()).isEqualTo(RoomStatus.AVAILABLE);
	}

	@Test
	void tenantCannotReadAnotherTenantsContract() {
		User owner = saveUser("visibility-owner@example.com", Role.OWNER);
		TenantProfile tenant = saveTenantProfile(owner, "visible-tenant@example.com");
		User otherTenant = saveUser("other-tenant@example.com", Role.TENANT);
		Room room = saveRoom(owner, "Visible Room");
		var contract = contractService.createContract(owner, request(tenant.getId(), room.getId(), ContractStatus.ACTIVE));

		assertThatThrownBy(() -> contractService.getContract(otherTenant, contract.id()))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Contract not found");
	}

	private ContractRequest request(Long tenantId, Long roomId, ContractStatus status) {
		return new ContractRequest(
				tenantId,
				roomId,
				LocalDate.now(),
				LocalDate.now().plusMonths(12),
				BigDecimal.valueOf(1000000),
				BigDecimal.valueOf(3500000),
				status);
	}

	private TenantProfile saveTenantProfile(User owner, String email) {
		User tenant = saveUser(email, Role.TENANT);
		return tenantProfileRepository.save(TenantProfile.builder()
				.owner(owner)
				.user(tenant)
				.phone("0909000001")
				.identityNumber("ID-" + tenant.getId())
				.emergencyContact("Mom 0909000002")
				.build());
	}

	private Room saveRoom(User owner, String name) {
		return roomRepository.save(Room.builder()
				.owner(owner)
				.name(name)
				.address("District 1")
				.area(25.0)
				.price(BigDecimal.valueOf(3500000))
				.status(RoomStatus.AVAILABLE)
				.description("Test room")
				.build());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("User")
				.email(email)
				.password("encoded-password")
				.role(role)
				.build());
	}
}
