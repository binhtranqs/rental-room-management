package com.example.rental.ai.dto;

import jakarta.validation.constraints.Pattern;

public record AiReminderRequest(
		@Pattern(regexp = "POLITE|FIRM|OVERDUE") String tone) {
	public String normalizedTone() {
		return tone == null || tone.isBlank() ? "POLITE" : tone;
	}
}
