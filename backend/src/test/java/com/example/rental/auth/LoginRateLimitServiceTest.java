package com.example.rental.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.example.rental.common.exception.RateLimitExceededException;

@ExtendWith(MockitoExtension.class)
class LoginRateLimitServiceTest {
	@Mock
	private StringRedisTemplate redisTemplate;

	@Mock
	private ValueOperations<String, String> valueOperations;

	@Test
	void disabledRateLimitDoesNothing() {
		LoginRateLimitService service = new LoginRateLimitService(redisTemplate, false);

		service.checkAllowed("owner@example.com");
		service.recordFailedAttempt("owner@example.com");
		service.clearFailedAttempts("owner@example.com");

		verifyNoInteractions(redisTemplate);
	}

	@Test
	void checkAllowedBlocksAtLimit() {
		LoginRateLimitService service = new LoginRateLimitService(redisTemplate, true);
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("login:rate:owner@example.com")).thenReturn("5");

		assertThatThrownBy(() -> service.checkAllowed("owner@example.com"))
				.isInstanceOf(RateLimitExceededException.class)
				.hasMessage("Too many failed login attempts. Please try again later.");
	}

	@Test
	void recordFailedAttemptSetsExpiryOnFirstFailure() {
		LoginRateLimitService service = new LoginRateLimitService(redisTemplate, true);
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.increment("login:rate:owner@example.com")).thenReturn(1L);

		service.recordFailedAttempt("owner@example.com");

		verify(redisTemplate).expire("login:rate:owner@example.com", Duration.ofMinutes(15));
	}

	@Test
	void successfulLoginClearsCounter() {
		LoginRateLimitService service = new LoginRateLimitService(redisTemplate, true);

		service.clearFailedAttempts(" OWNER@example.com ");

		verify(redisTemplate).delete("login:rate:owner@example.com");
	}
}
