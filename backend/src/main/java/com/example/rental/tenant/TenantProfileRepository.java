package com.example.rental.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rental.user.User;

public interface TenantProfileRepository extends JpaRepository<TenantProfile, Long> {
	boolean existsByUserEmail(String email);

	@Query("""
			select t from TenantProfile t
			join t.user u
			where t.owner = :owner
			and (
				:keyword is null
				or lower(u.name) like lower(concat('%', :keyword, '%'))
				or lower(u.email) like lower(concat('%', :keyword, '%'))
				or lower(t.phone) like lower(concat('%', :keyword, '%'))
				or lower(t.identityNumber) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<TenantProfile> searchOwnerTenants(
			@Param("owner") User owner,
			@Param("keyword") String keyword,
			Pageable pageable);
}
