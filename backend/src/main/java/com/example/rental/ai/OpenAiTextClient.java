package com.example.rental.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class OpenAiTextClient {
	private final String apiKey;
	private final String model;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public OpenAiTextClient(
			@Value("${app.ai.openai-api-key}") String apiKey,
			@Value("${app.ai.model}") String model,
			ObjectMapper objectMapper) {
		this.apiKey = apiKey;
		this.model = model;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newHttpClient();
	}

	public boolean isEnabled() {
		return apiKey != null && !apiKey.isBlank();
	}

	public String complete(String prompt, int maxOutputTokens) {
		if (!isEnabled()) {
			throw new IllegalStateException("OpenAI API key is not configured");
		}

		try {
			String requestBody = objectMapper.writeValueAsString(Map.of(
					"model", model,
					"input", prompt,
					"max_output_tokens", maxOutputTokens,
					"temperature", 0.3));

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://api.openai.com/v1/responses"))
					.header("Authorization", "Bearer " + apiKey)
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(requestBody))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new IllegalStateException("OpenAI request failed with status " + response.statusCode());
			}

			return extractText(response.body());
		} catch (IOException exception) {
			throw new IllegalStateException("Cannot call OpenAI", exception);
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("OpenAI request was interrupted", exception);
		}
	}

	private String extractText(String responseBody) throws IOException {
		JsonNode root = objectMapper.readTree(responseBody);
		String outputText = root.path("output_text").asText("");
		if (!outputText.isBlank()) {
			return outputText;
		}

		List<String> textParts = new ArrayList<>();
		for (JsonNode output : root.path("output")) {
			for (JsonNode content : output.path("content")) {
				String text = content.path("text").asText("");
				if (!text.isBlank()) {
					textParts.add(text);
				}
			}
		}

		return String.join("\n", textParts);
	}
}
