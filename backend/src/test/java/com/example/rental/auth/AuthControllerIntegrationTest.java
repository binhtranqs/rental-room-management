package com.example.rental.auth;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {
	@Autowired
	private MockMvc mockMvc;

	@Test
	void registerLoginAndMeReturnAuthenticatedUser() throws Exception {
		String email = "auth-owner-" + System.nanoTime() + "@example.com";

		MvcResult registerResult = mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Auth Owner",
								  "email": "%s",
								  "password": "123456",
								  "role": "OWNER"
								}
								""".formatted(email)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.accessToken", not(blankOrNullString())))
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andReturn();

		String token = extractAccessToken(registerResult);

		mockMvc.perform(get("/auth/me")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(email))
				.andExpect(jsonPath("$.role").value("OWNER"));

		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "123456"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken", not(blankOrNullString())))
				.andExpect(jsonPath("$.tokenType").value("Bearer"));
	}

	@Test
	void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
		String email = "auth-wrong-password-" + System.nanoTime() + "@example.com";

		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Wrong Password Owner",
								  "email": "%s",
								  "password": "123456",
								  "role": "OWNER"
								}
								""".formatted(email)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "bad-password"
								}
								""".formatted(email)))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("Invalid email or password"));
	}

	@Test
	void registerWithDuplicateEmailReturnsConflict() throws Exception {
		String email = "auth-duplicate-" + System.nanoTime() + "@example.com";
		String registerBody = """
				{
				  "name": "Duplicate Owner",
				  "email": "%s",
				  "password": "123456",
				  "role": "OWNER"
				}
				""".formatted(email);

		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(registerBody))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(registerBody))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Email already exists"));
	}

	private String extractAccessToken(MvcResult result) throws Exception {
		String response = result.getResponse().getContentAsString();
		String marker = "\"accessToken\":\"";
		int start = response.indexOf(marker) + marker.length();
		int end = response.indexOf("\"", start);
		return response.substring(start, end);
	}
}
