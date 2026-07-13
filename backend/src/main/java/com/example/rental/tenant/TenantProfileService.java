package com.example.rental.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.tenant.dto.TenantProfileRequest;
import com.example.rental.tenant.dto.TenantProfileResponse;
import com.example.rental.tenant.dto.TenantProfileUpdateRequest;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@Service
public class TenantProfileService {
	private final TenantProfileRepository tenantProfileRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public TenantProfileService(
			TenantProfileRepository tenantProfileRepository,
			UserRepository userRepository,
			PasswordEncoder passwordEncoder) {
		this.tenantProfileRepository = tenantProfileRepository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public Page<TenantProfileResponse> getTenants(User owner, String keyword, Pageable pageable) {
		return tenantProfileRepository.searchOwnerTenants(owner, normalizeKeyword(keyword), pageable)
				.map(TenantProfileResponse::from);
	}

	@Transactional(readOnly = true)
	public TenantProfileResponse getTenant(User owner, Long id) {
		return TenantProfileResponse.from(findOwnedTenant(owner, id));
	}

	@Transactional
	public TenantProfileResponse createTenant(User owner, TenantProfileRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new ConflictException("Email already exists");
		}

		User tenantUser = User.builder()
				.name(request.name())
				.email(request.email())
				.password(passwordEncoder.encode(request.password()))
				.role(Role.TENANT)
				.build();

		TenantProfile profile = TenantProfile.builder()
				.user(userRepository.save(tenantUser))
				.owner(owner)
				.phone(request.phone())
				.identityNumber(request.identityNumber())
				.emergencyContact(request.emergencyContact())
				.build();

		return TenantProfileResponse.from(tenantProfileRepository.save(profile));
	}

	@Transactional
	public TenantProfileResponse updateTenant(User owner, Long id, TenantProfileUpdateRequest request) {
		TenantProfile profile = findOwnedTenant(owner, id);
		User tenantUser = profile.getUser();

		userRepository.findByEmail(request.email())
				.filter(existingUser -> !existingUser.getId().equals(tenantUser.getId()))
				.ifPresent(existingUser -> {
					throw new ConflictException("Email already exists");
				});

		tenantUser.setName(request.name());
		tenantUser.setEmail(request.email());
		profile.setPhone(request.phone());
		profile.setIdentityNumber(request.identityNumber());
		profile.setEmergencyContact(request.emergencyContact());

		return TenantProfileResponse.from(profile);
	}

	@Transactional
	public void deleteTenant(User owner, Long id) {
		TenantProfile profile = findOwnedTenant(owner, id);
		tenantProfileRepository.delete(profile);
		userRepository.delete(profile.getUser());
	}

	private TenantProfile findOwnedTenant(User owner, Long id) {
		return tenantProfileRepository.findById(id)
				.filter(profile -> profile.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Tenant not found"));
	}

	private String normalizeKeyword(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return "";
		}
		return keyword.trim();
	}
}
