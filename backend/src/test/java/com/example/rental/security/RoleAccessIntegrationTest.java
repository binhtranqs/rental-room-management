package com.example.rental.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleAccessIntegrationTest {
	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserRepository userRepository;

	@Test
	void requestWithoutTokenIsBlockedFromProtectedEndpoint() throws Exception {
		mockMvc.perform(get("/rooms"))
				.andExpect(status().isForbidden());
	}

	@Test
	void ownerCanCreateRoomThroughProtectedApi() throws Exception {
		User owner = saveUser("role-owner-" + System.nanoTime() + "@example.com", Role.OWNER);

		mockMvc.perform(post("/rooms")
						.header("Authorization", bearer(owner))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Role Room",
								  "address": "District 1",
								  "area": 25.0,
								  "price": 3500000,
								  "status": "AVAILABLE",
								  "description": "Created from role integration test"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Role Room"))
				.andExpect(jsonPath("$.ownerId").value(owner.getId()));
	}

	@Test
	void tenantCannotAccessOwnerOnlyApis() throws Exception {
		User tenant = saveUser("role-tenant-" + System.nanoTime() + "@example.com", Role.TENANT);

		mockMvc.perform(post("/rooms")
						.header("Authorization", bearer(tenant))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Tenant Room",
								  "address": "District 1",
								  "area": 25.0,
								  "price": 3500000,
								  "status": "AVAILABLE",
								  "description": "Should be forbidden"
								}
								"""))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/tenants")
						.header("Authorization", bearer(tenant))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Tenant Demo",
								  "email": "tenant-demo-%s@example.com",
								  "password": "123456",
								  "phone": "0909000001",
								  "identityNumber": "ID123456",
								  "emergencyContact": "Mom 0909000002"
								}
								""".formatted(System.nanoTime())))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/contracts")
						.header("Authorization", bearer(tenant))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "tenantId": 1,
								  "roomId": 1,
								  "startDate": "2026-06-16",
								  "endDate": "2027-06-16",
								  "deposit": 1000000,
								  "monthlyRent": 3500000,
								  "status": "ACTIVE"
								}
								"""))
				.andExpect(status().isForbidden());
	}

	private User saveUser(String email, Role role) {
		return userRepository.save(User.builder()
				.name("Role User")
				.email(email)
				.password(passwordEncoder.encode("123456"))
				.role(role)
				.build());
	}

	private String bearer(User user) {
		return "Bearer " + jwtService.generateToken(user);
	}
}
