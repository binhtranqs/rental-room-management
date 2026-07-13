package com.example.rental.ai.dto;

import java.time.Instant;
import java.util.List;

public record AiInsightResponse(
		boolean aiEnabled,
		String source,
		Instant generatedAt,
		String summary,
		List<InsightItem> insights) {
	public record InsightItem(
			String severity,
			String title,
			String detail,
			String action) {
	}
}
