package com.example.rental.ai;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.ai.dto.AiAssistantRequest;
import com.example.rental.ai.dto.AiAssistantResponse;
import com.example.rental.ai.dto.AiInsightResponse;
import com.example.rental.ai.dto.AiReminderRequest;
import com.example.rental.ai.dto.AiReminderResponse;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/ai")
@PreAuthorize("hasRole('OWNER')")
public class AiOperationsController {
	private final AiOperationsService aiOperationsService;

	public AiOperationsController(AiOperationsService aiOperationsService) {
		this.aiOperationsService = aiOperationsService;
	}

	@GetMapping("/owner-insights")
	public AiInsightResponse getOwnerInsights(@AuthenticationPrincipal User owner) {
		return aiOperationsService.getOwnerInsights(owner);
	}

	@PostMapping("/assistant")
	public AiAssistantResponse askAssistant(
			@AuthenticationPrincipal User owner,
			@Valid @RequestBody AiAssistantRequest request) {
		return aiOperationsService.answerOwnerQuestion(owner, request.question());
	}

	@PostMapping("/bills/{id}/reminder")
	public AiReminderResponse generateReminder(
			@AuthenticationPrincipal User owner,
			@PathVariable Long id,
			@Valid @RequestBody AiReminderRequest request) {
		return aiOperationsService.generateReminder(owner, id, request.normalizedTone());
	}
}
