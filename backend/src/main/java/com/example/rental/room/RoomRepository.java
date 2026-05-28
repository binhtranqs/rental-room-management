package com.example.rental.room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rental.user.User;

public interface RoomRepository extends JpaRepository<Room, Long> {
	@Query("""
			select r from Room r
			where r.owner = :owner
			and (:status is null or r.status = :status)
			and (
				:keyword is null
				or lower(r.name) like lower(concat('%', :keyword, '%'))
				or lower(r.address) like lower(concat('%', :keyword, '%'))
				or lower(coalesce(r.description, '')) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<Room> searchOwnerRooms(
			@Param("owner") User owner,
			@Param("keyword") String keyword,
			@Param("status") RoomStatus status,
			Pageable pageable);
}
