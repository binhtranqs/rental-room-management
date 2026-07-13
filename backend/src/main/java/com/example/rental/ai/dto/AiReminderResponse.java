package com.example.rental.ai.dto;

import java.time.Instant;

public record AiReminderResponse(
		boolean aiEnabled,
		String source,
		Instant generatedAt,
		String recipientEmail,
		String subject,
		String body) {
}
