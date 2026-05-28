package com.example.rental.room;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.example.rental.common.exception.NotFoundException;
import com.example.rental.room.dto.RoomRequest;
import com.example.rental.user.Role;
import com.example.rental.user.User;
import com.example.rental.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class RoomServiceTest {
	@Autowired
	private RoomService roomService;

	@Autowired
	private UserRepository userRepository;

	@Test
	void ownerCanSearchAndFilterOwnRooms() {
		User owner = saveOwner("owner-rooms@example.com");
		roomService.createRoom(owner, new RoomRequest(
				"Room A1",
				"District 1",
				25.0,
				BigDecimal.valueOf(3500000),
				RoomStatus.AVAILABLE,
				"Near school"));
		roomService.createRoom(owner, new RoomRequest(
				"Room B1",
				"District 2",
				20.0,
				BigDecimal.valueOf(3000000),
				RoomStatus.MAINTENANCE,
				"Needs repair"));

		var rooms = roomService.getRooms(owner, "school", RoomStatus.AVAILABLE, PageRequest.of(0, 10));

		assertThat(rooms.getTotalElements()).isEqualTo(1);
		assertThat(rooms.getContent().getFirst().name()).isEqualTo("Room A1");
	}

	@Test
	void ownerCannotReadAnotherOwnersRoom() {
		User owner = saveOwner("owner-a@example.com");
		User anotherOwner = saveOwner("owner-b@example.com");
		var room = roomService.createRoom(owner, new RoomRequest(
				"Private Room",
				"District 3",
				22.0,
				BigDecimal.valueOf(3200000),
				RoomStatus.AVAILABLE,
				null));

		assertThatThrownBy(() -> roomService.getRoom(anotherOwner, room.id()))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("Room not found");
	}

	private User saveOwner(String email) {
		return userRepository.save(User.builder()
				.name("Owner")
				.email(email)
				.password("encoded-password")
				.role(Role.OWNER)
				.build());
	}
}
