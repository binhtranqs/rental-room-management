package com.example.rental.bill;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.bill.dto.BillRequest;
import com.example.rental.bill.dto.BillResponse;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/bills")
@PreAuthorize("hasAnyRole('OWNER', 'TENANT')")
public class BillController {
	private final BillService billService;

	public BillController(BillService billService) {
		this.billService = billService;
	}

	@GetMapping
	public Page<BillResponse> getBills(
			@AuthenticationPrincipal User user,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) BillStatus status,
			@RequestParam(required = false) LocalDate month,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		return billService.getBills(user, keyword, status, month, pageable);
	}

	@GetMapping("/{id}")
	public BillResponse getBill(@AuthenticationPrincipal User user, @PathVariable Long id) {
		return billService.getBill(user, id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('OWNER')")
	public BillResponse createBill(
			@AuthenticationPrincipal User owner,
			@Valid @RequestBody BillRequest request) {
		return billService.createBill(owner, request);
	}
}
