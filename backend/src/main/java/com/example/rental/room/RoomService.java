package com.example.rental.room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.common.exception.NotFoundException;
import com.example.rental.room.dto.RoomRequest;
import com.example.rental.room.dto.RoomResponse;
import com.example.rental.user.User;

@Service
public class RoomService {
	private final RoomRepository roomRepository;

	public RoomService(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}

	@Transactional(readOnly = true)
	public Page<RoomResponse> getRooms(User owner, String keyword, RoomStatus status, Pageable pageable) {
		String normalizedKeyword = normalizeKeyword(keyword);
		return roomRepository.searchOwnerRooms(owner, normalizedKeyword, status, pageable)
				.map(RoomResponse::from);
	}

	@Transactional(readOnly = true)
	public RoomResponse getRoom(User owner, Long id) {
		return RoomResponse.from(findOwnedRoom(owner, id));
	}

	@Transactional
	public RoomResponse createRoom(User owner, RoomRequest request) {
		Room room = Room.builder()
				.owner(owner)
				.name(request.name())
				.address(request.address())
				.area(request.area())
				.price(request.price())
				.status(request.status())
				.description(request.description())
				.build();

		return RoomResponse.from(roomRepository.save(room));
	}

	@Transactional
	public RoomResponse updateRoom(User owner, Long id, RoomRequest request) {
		Room room = findOwnedRoom(owner, id);
		room.setName(request.name());
		room.setAddress(request.address());
		room.setArea(request.area());
		room.setPrice(request.price());
		room.setStatus(request.status());
		room.setDescription(request.description());

		return RoomResponse.from(room);
	}

	@Transactional
	public void deleteRoom(User owner, Long id) {
		Room room = findOwnedRoom(owner, id);
		roomRepository.delete(room);
	}

	private Room findOwnedRoom(User owner, Long id) {
		return roomRepository.findById(id)
				.filter(room -> room.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Room not found"));
	}

	private String normalizeKeyword(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return null;
		}
		return keyword.trim();
	}
}
