package com.example.rental.room;

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

import com.example.rental.room.dto.RoomRequest;
import com.example.rental.room.dto.RoomResponse;
import com.example.rental.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rooms")
@PreAuthorize("hasRole('OWNER')")
public class RoomController {
	private final RoomService roomService;

	public RoomController(RoomService roomService) {
		this.roomService = roomService;
	}

	@GetMapping
	public Page<RoomResponse> getRooms(
			@AuthenticationPrincipal User owner,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) RoomStatus status,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		return roomService.getRooms(owner, keyword, status, pageable);
	}

	@GetMapping("/{id}")
	public RoomResponse getRoom(@AuthenticationPrincipal User owner, @PathVariable Long id) {
		return roomService.getRoom(owner, id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RoomResponse createRoom(
			@AuthenticationPrincipal User owner,
			@Valid @RequestBody RoomRequest request) {
		return roomService.createRoom(owner, request);
	}

	@PutMapping("/{id}")
	public RoomResponse updateRoom(
			@AuthenticationPrincipal User owner,
			@PathVariable Long id,
			@Valid @RequestBody RoomRequest request) {
		return roomService.updateRoom(owner, id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteRoom(@AuthenticationPrincipal User owner, @PathVariable Long id) {
		roomService.deleteRoom(owner, id);
	}
}
