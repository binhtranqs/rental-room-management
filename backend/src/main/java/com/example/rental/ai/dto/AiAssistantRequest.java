package com.example.rental.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiAssistantRequest(
		@NotBlank @Size(max = 500) String question) {
}
