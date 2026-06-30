package com.example.rental.auth;

import java.time.Duration;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.example.rental.common.exception.RateLimitExceededException;

@Service
public class LoginRateLimitService {
	private static final int MAX_FAILED_ATTEMPTS = 5;
	private static final Duration WINDOW = Duration.ofMinutes(15);
	private static final String KEY_PREFIX = "login:rate:";

	private final StringRedisTemplate redisTemplate;
	private final boolean enabled;

	public LoginRateLimitService(
			StringRedisTemplate redisTemplate,
			@Value("${app.rate-limit.enabled:true}") boolean enabled) {
		this.redisTemplate = redisTemplate;
		this.enabled = enabled;
	}

	public void checkAllowed(String identifier) {
		if (!enabled) {
			return;
		}

		String attempts = redisTemplate.opsForValue().get(key(identifier));
		if (attempts != null && Integer.parseInt(attempts) >= MAX_FAILED_ATTEMPTS) {
			throw new RateLimitExceededException("Too many failed login attempts. Please try again later.");
		}
	}

	public void recordFailedAttempt(String identifier) {
		if (!enabled) {
			return;
		}

		Long attempts = redisTemplate.opsForValue().increment(key(identifier));
		if (attempts != null && attempts == 1) {
			redisTemplate.expire(key(identifier), WINDOW);
		}
	}

	public void clearFailedAttempts(String identifier) {
		if (!enabled) {
			return;
		}

		redisTemplate.delete(key(identifier));
	}

	private String key(String identifier) {
		return KEY_PREFIX + identifier.trim().toLowerCase(Locale.ROOT);
	}
}
