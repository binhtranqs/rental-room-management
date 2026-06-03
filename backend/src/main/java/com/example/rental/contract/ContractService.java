package com.example.rental.contract;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.dto.ContractRequest;
import com.example.rental.contract.dto.ContractResponse;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.tenant.TenantProfile;
import com.example.rental.tenant.TenantProfileRepository;
import com.example.rental.user.Role;
import com.example.rental.user.User;

@Service
public class ContractService {
	private final ContractRepository contractRepository;
	private final RoomRepository roomRepository;
	private final TenantProfileRepository tenantProfileRepository;

	public ContractService(
			ContractRepository contractRepository,
			RoomRepository roomRepository,
			TenantProfileRepository tenantProfileRepository) {
		this.contractRepository = contractRepository;
		this.roomRepository = roomRepository;
		this.tenantProfileRepository = tenantProfileRepository;
	}

	@Transactional(readOnly = true)
	public Page<ContractResponse> getContracts(
			User user,
			String keyword,
			ContractStatus status,
			Pageable pageable) {
		String normalizedKeyword = normalizeKeyword(keyword);
		if (user.getRole() == Role.OWNER) {
			return contractRepository.searchOwnerContracts(user, normalizedKeyword, status, pageable)
					.map(ContractResponse::from);
		}
		if (user.getRole() == Role.TENANT) {
			return contractRepository.searchTenantContracts(user, normalizedKeyword, status, pageable)
					.map(ContractResponse::from);
		}
		throw new ForbiddenException("Only owners and tenants can view contracts");
	}

	@Transactional(readOnly = true)
	public ContractResponse getContract(User user, Long id) {
		return ContractResponse.from(findVisibleContract(user, id));
	}

	@Transactional
	public ContractResponse createContract(User owner, ContractRequest request) {
		validateOwner(owner);
		validateDates(request);

		TenantProfile tenantProfile = findOwnedTenantProfile(owner, request.tenantId());
		Room room = findOwnedRoom(owner, request.roomId());

		if (request.status() == ContractStatus.ACTIVE && room.getStatus() != RoomStatus.AVAILABLE) {
			throw new ConflictException("Room is not available");
		}

		Contract contract = Contract.builder()
				.owner(owner)
				.tenant(tenantProfile.getUser())
				.room(room)
				.startDate(request.startDate())
				.endDate(request.endDate())
				.deposit(request.deposit())
				.monthlyRent(request.monthlyRent())
				.status(request.status())
				.build();

		if (contract.getStatus() == ContractStatus.ACTIVE) {
			room.setStatus(RoomStatus.OCCUPIED);
		}

		return ContractResponse.from(contractRepository.save(contract));
	}

	@Transactional
	public ContractResponse updateContract(User owner, Long id, ContractRequest request) {
		validateOwner(owner);
		validateDates(request);

		Contract contract = findOwnedContract(owner, id);
		Room oldRoom = contract.getRoom();
		TenantProfile tenantProfile = findOwnedTenantProfile(owner, request.tenantId());
		Room newRoom = findOwnedRoom(owner, request.roomId());

		if (!oldRoom.getId().equals(newRoom.getId()) && contract.getStatus() == ContractStatus.ACTIVE) {
			oldRoom.setStatus(RoomStatus.AVAILABLE);
		}

		if (request.status() == ContractStatus.ACTIVE
				&& !oldRoom.getId().equals(newRoom.getId())
				&& newRoom.getStatus() != RoomStatus.AVAILABLE) {
			throw new ConflictException("Room is not available");
		}

		contract.setTenant(tenantProfile.getUser());
		contract.setRoom(newRoom);
		contract.setStartDate(request.startDate());
		contract.setEndDate(request.endDate());
		contract.setDeposit(request.deposit());
		contract.setMonthlyRent(request.monthlyRent());
		contract.setStatus(request.status());

		if (request.status() == ContractStatus.ACTIVE) {
			newRoom.setStatus(RoomStatus.OCCUPIED);
		} else {
			newRoom.setStatus(RoomStatus.AVAILABLE);
		}

		return ContractResponse.from(contract);
	}

	@Transactional
	public ContractResponse endContract(User owner, Long id) {
		validateOwner(owner);
		Contract contract = findOwnedContract(owner, id);
		contract.setStatus(ContractStatus.ENDED);
		contract.getRoom().setStatus(RoomStatus.AVAILABLE);
		return ContractResponse.from(contract);
	}

	private Contract findVisibleContract(User user, Long id) {
		return contractRepository.findById(id)
				.filter(contract -> {
					if (user.getRole() == Role.OWNER) {
						return contract.getOwner().getId().equals(user.getId());
					}
					if (user.getRole() == Role.TENANT) {
						return contract.getTenant().getId().equals(user.getId());
					}
					return false;
				})
				.orElseThrow(() -> new NotFoundException("Contract not found"));
	}

	private Contract findOwnedContract(User owner, Long id) {
		return contractRepository.findById(id)
				.filter(contract -> contract.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Contract not found"));
	}

	private TenantProfile findOwnedTenantProfile(User owner, Long id) {
		return tenantProfileRepository.findById(id)
				.filter(profile -> profile.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Tenant not found"));
	}

	private Room findOwnedRoom(User owner, Long id) {
		return roomRepository.findById(id)
				.filter(room -> room.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Room not found"));
	}

	private void validateOwner(User user) {
		if (user.getRole() != Role.OWNER) {
			throw new ForbiddenException("Only owners can manage contracts");
		}
	}

	private void validateDates(ContractRequest request) {
		if (!request.endDate().isAfter(request.startDate())) {
			throw new ConflictException("Contract end date must be after start date");
		}
	}

	private String normalizeKeyword(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return null;
		}
		return keyword.trim();
	}
}
