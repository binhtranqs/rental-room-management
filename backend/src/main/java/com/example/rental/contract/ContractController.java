package com.example.rental.contract;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.contract.dto.ContractRequest;
import com.example.rental.contract.dto.ContractResponse;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/contracts")
@PreAuthorize("hasAnyRole('OWNER', 'TENANT')")
public class ContractController {
	private final ContractService contractService;

	public ContractController(ContractService contractService) {
		this.contractService = contractService;
	}

	@GetMapping
	public Page<ContractResponse> getContracts(
			@AuthenticationPrincipal User user,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) ContractStatus status,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		return contractService.getContracts(user, keyword, status, pageable);
	}

	@GetMapping("/{id}")
	public ContractResponse getContract(@AuthenticationPrincipal User user, @PathVariable Long id) {
		return contractService.getContract(user, id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('OWNER')")
	public ContractResponse createContract(
			@AuthenticationPrincipal User owner,
			@Valid @RequestBody ContractRequest request) {
		return contractService.createContract(owner, request);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('OWNER')")
	public ContractResponse updateContract(
			@AuthenticationPrincipal User owner,
			@PathVariable Long id,
			@Valid @RequestBody ContractRequest request) {
		return contractService.updateContract(owner, id, request);
	}

	@PatchMapping("/{id}/end")
	@PreAuthorize("hasRole('OWNER')")
	public ContractResponse endContract(@AuthenticationPrincipal User owner, @PathVariable Long id) {
		return contractService.endContract(owner, id);
	}
}
