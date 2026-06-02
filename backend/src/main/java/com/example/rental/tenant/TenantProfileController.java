package com.example.rental.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.tenant.dto.TenantProfileRequest;
import com.example.rental.tenant.dto.TenantProfileResponse;
import com.example.rental.tenant.dto.TenantProfileUpdateRequest;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/tenants")
@PreAuthorize("hasRole('OWNER')")
public class TenantProfileController {
	private final TenantProfileService tenantProfileService;

	public TenantProfileController(TenantProfileService tenantProfileService) {
		this.tenantProfileService = tenantProfileService;
	}

	@GetMapping
	public Page<TenantProfileResponse> getTenants(
			@AuthenticationPrincipal User owner,
			@RequestParam(required = false) String keyword,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		return tenantProfileService.getTenants(owner, keyword, pageable);
	}

	@GetMapping("/{id}")
	public TenantProfileResponse getTenant(@AuthenticationPrincipal User owner, @PathVariable Long id) {
		return tenantProfileService.getTenant(owner, id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TenantProfileResponse createTenant(
			@AuthenticationPrincipal User owner,
			@Valid @RequestBody TenantProfileRequest request) {
		return tenantProfileService.createTenant(owner, request);
	}

	@PutMapping("/{id}")
	public TenantProfileResponse updateTenant(
			@AuthenticationPrincipal User owner,
			@PathVariable Long id,
			@Valid @RequestBody TenantProfileUpdateRequest request) {
		return tenantProfileService.updateTenant(owner, id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteTenant(@AuthenticationPrincipal User owner, @PathVariable Long id) {
		tenantProfileService.deleteTenant(owner, id);
	}
}
