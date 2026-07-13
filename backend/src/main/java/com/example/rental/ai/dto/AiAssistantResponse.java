package com.example.rental.ai.dto;

import java.time.Instant;

public record AiAssistantResponse(
		boolean aiEnabled,
		String source,
		Instant generatedAt,
		String answer) {
}
