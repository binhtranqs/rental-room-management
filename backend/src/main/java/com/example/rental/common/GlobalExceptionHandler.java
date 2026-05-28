package com.example.rental.common;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.common.exception.NotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<ApiError> handleConflict(ConflictException exception) {
		return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(ApiError.of(HttpStatus.CONFLICT.value(), exception.getMessage()));
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(NotFoundException exception) {
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(ApiError.of(HttpStatus.NOT_FOUND.value(), exception.getMessage()));
	}

	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<ApiError> handleForbidden(ForbiddenException exception) {
		return ResponseEntity
				.status(HttpStatus.FORBIDDEN)
				.body(ApiError.of(HttpStatus.FORBIDDEN.value(), exception.getMessage()));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ApiError> handleBadCredentials() {
		return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(ApiError.of(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password"));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
		Map<String, String> errors = exception.getBindingResult().getFieldErrors().stream()
				.collect(Collectors.toMap(
						error -> error.getField(),
						error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(),
						(first, second) -> first));

		return ResponseEntity
				.badRequest()
				.body(ApiError.validation(HttpStatus.BAD_REQUEST.value(), "Validation failed", errors));
	}
}
