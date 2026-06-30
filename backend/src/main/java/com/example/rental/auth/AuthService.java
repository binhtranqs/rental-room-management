package com.example.rental.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.auth.dto.AuthResponse;
import com.example.rental.auth.dto.LoginRequest;
import com.example.rental.auth.dto.RegisterRequest;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.security.JwtService;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	private final LoginRateLimitService loginRateLimitService;

	public AuthService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			AuthenticationManager authenticationManager,
			LoginRateLimitService loginRateLimitService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
		this.loginRateLimitService = loginRateLimitService;
	}

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new ConflictException("Email already exists");
		}

		User user = User.builder()
				.name(request.name())
				.email(request.email())
				.password(passwordEncoder.encode(request.password()))
				.role(request.role())
				.build();

		User savedUser = userRepository.save(user);
		return AuthResponse.bearer(jwtService.generateToken(savedUser));
	}

	public AuthResponse login(LoginRequest request) {
		loginRateLimitService.checkAllowed(request.email());

		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.email(), request.password()));
		} catch (BadCredentialsException exception) {
			loginRateLimitService.recordFailedAttempt(request.email());
			throw exception;
		}

		User user = userRepository.findByEmail(request.email())
				.orElseThrow();

		loginRateLimitService.clearFailedAttempts(request.email());
		return AuthResponse.bearer(jwtService.generateToken(user));
	}
}
