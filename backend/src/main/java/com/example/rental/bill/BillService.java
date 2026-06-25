package com.example.rental.bill;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.bill.dto.BillRequest;
import com.example.rental.bill.dto.BillResponse;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.user.Role;
import com.example.rental.user.User;

@Service
public class BillService {
	private final BillRepository billRepository;
	private final ContractRepository contractRepository;

	public BillService(BillRepository billRepository, ContractRepository contractRepository) {
		this.billRepository = billRepository;
		this.contractRepository = contractRepository;
	}

	@Transactional(readOnly = true)
	public Page<BillResponse> getBills(
			User user,
			String keyword,
			BillStatus status,
			LocalDate month,
			Pageable pageable) {
		String normalizedKeyword = normalizeKeyword(keyword);
		if (user.getRole() == Role.OWNER) {
			return billRepository.searchOwnerBills(user, normalizedKeyword, status, month, pageable)
					.map(BillResponse::from);
		}
		if (user.getRole() == Role.TENANT) {
			return billRepository.searchTenantBills(user, normalizedKeyword, status, month, pageable)
					.map(BillResponse::from);
		}
		throw new ForbiddenException("Only owners and tenants can view bills");
	}

	@Transactional(readOnly = true)
	public BillResponse getBill(User user, Long id) {
		return BillResponse.from(findVisibleBill(user, id));
	}

	@Transactional
	public BillResponse createBill(User owner, BillRequest request) {
		validateOwner(owner);

		Contract contract = contractRepository.findById(request.contractId())
				.filter(existingContract -> existingContract.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Contract not found"));

		if (contract.getStatus() != ContractStatus.ACTIVE) {
			throw new ConflictException("Cannot create bill for inactive contract");
		}
		if (request.dueDate().isBefore(request.month())) {
			throw new ConflictException("Bill due date must be on or after bill month");
		}

		Bill bill = Bill.builder()
				.owner(owner)
				.tenant(contract.getTenant())
				.contract(contract)
				.month(request.month())
				.roomRent(request.roomRent())
				.electricityFee(request.electricityFee())
				.waterFee(request.waterFee())
				.serviceFee(request.serviceFee())
				.totalAmount(calculateTotal(request))
				.status(request.status() == null ? BillStatus.UNPAID : request.status())
				.dueDate(request.dueDate())
				.build();

		return BillResponse.from(billRepository.save(bill));
	}

	@Transactional
	public BillResponse markPaid(User owner, Long id) {
		validateOwner(owner);
		Bill bill = findOwnedBill(owner, id);

		if (bill.getStatus() == BillStatus.PAID) {
			throw new ConflictException("Bill is already paid");
		}

		bill.setStatus(BillStatus.PAID);
		bill.setPaidAt(Instant.now());
		return BillResponse.from(bill);
	}

	private Bill findVisibleBill(User user, Long id) {
		return billRepository.findById(id)
				.filter(bill -> {
					if (user.getRole() == Role.OWNER) {
						return bill.getOwner().getId().equals(user.getId());
					}
					if (user.getRole() == Role.TENANT) {
						return bill.getTenant().getId().equals(user.getId());
					}
					return false;
				})
				.orElseThrow(() -> new NotFoundException("Bill not found"));
	}

	private Bill findOwnedBill(User owner, Long id) {
		return billRepository.findById(id)
				.filter(bill -> bill.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Bill not found"));
	}

	private BigDecimal calculateTotal(BillRequest request) {
		return request.roomRent()
				.add(request.electricityFee())
				.add(request.waterFee())
				.add(request.serviceFee());
	}

	private void validateOwner(User user) {
		if (user.getRole() != Role.OWNER) {
			throw new ForbiddenException("Only owners can manage bills");
		}
	}

	private String normalizeKeyword(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return null;
		}
		return keyword.trim();
	}
}
