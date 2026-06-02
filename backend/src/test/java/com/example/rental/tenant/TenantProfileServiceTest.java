package com.example.rental.tenant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.common.exception.NotFoundException;
import com.example.rental.tenant.dto.TenantProfileRequest;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class TenantProfileServiceTest {
	@Autowired
	private TenantProfileService tenantProfileService;

	@Autowired
	private UserRepository userRepository;

	@Test
	void ownerCanCreateAndSearchTenants() {
		User owner = saveOwner("owner-tenant-search@example.com");
		tenantProfileService.createTenant(owner, new TenantProfileRequest(
				"Tenant Demo",
				"tenant-demo@example.com",
				"123456",
				"0909000001",
				"ID123",
				"Mom 0909000002"));

		var tenants = tenantProfileService.getTenants(owner, "demo", PageRequest.of(0, 10));

		assertThat(tenants.getTotalElements()).isEqualTo(1);
		assertThat(tenants.getContent().getFirst().email()).isEqualTo("tenant-demo@example.com");
	}

	@Test
	void ownerCannotReadAnotherOwnersTenant() {
		User owner = saveOwner("tenant-owner-a@example.com");
		User anotherOwner = saveOwner("tenant-owner-b@example.com");
		var tenant = tenantProfileService.createTenant(owner, new TenantProfileRequest(
				"Private Tenant",
				"private-tenant@example.com",
				"123456",
				"0909000003",
				"ID456",
				null));

		assertThatThrownBy(() -> tenantProfileService.getTenant(anotherOwner, tenant.id()))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Tenant not found");
	}

	private User saveOwner(String email) {
		return userRepository.save(User.builder()
				.name("Owner")
				.email(email)
				.password("encoded-password")
				.role(Role.OWNER)
				.build());
	}
}
