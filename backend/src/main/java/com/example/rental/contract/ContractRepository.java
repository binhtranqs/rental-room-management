package com.example.rental.contract;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rental.user.User;

public interface ContractRepository extends JpaRepository<Contract, Long> {
	@Query("""
			select c from Contract c
			join c.tenant t
			join c.room r
			where c.owner = :owner
			and (:status is null or c.status = :status)
			and (
				:keyword is null
				or lower(t.name) like lower(concat('%', :keyword, '%'))
				or lower(t.email) like lower(concat('%', :keyword, '%'))
				or lower(r.name) like lower(concat('%', :keyword, '%'))
				or lower(r.address) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<Contract> searchOwnerContracts(
			@Param("owner") User owner,
			@Param("keyword") String keyword,
			@Param("status") ContractStatus status,
			Pageable pageable);

	@Query("""
			select c from Contract c
			join c.room r
			where c.tenant = :tenant
			and (:status is null or c.status = :status)
			and (
				:keyword is null
				or lower(r.name) like lower(concat('%', :keyword, '%'))
				or lower(r.address) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<Contract> searchTenantContracts(
			@Param("tenant") User tenant,
			@Param("keyword") String keyword,
			@Param("status") ContractStatus status,
			Pageable pageable);
}
