package com.example.rental.bill;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rental.user.User;

public interface BillRepository extends JpaRepository<Bill, Long> {
	long countByOwnerAndStatus(User owner, BillStatus status);

	@Query("""
			select coalesce(sum(b.totalAmount), 0)
			from Bill b
			where b.owner = :owner
			and b.status = :status
			and b.month >= :monthStart
			and b.month < :nextMonthStart
			""")
	BigDecimal sumPaidRevenueByOwnerAndMonth(
			@Param("owner") User owner,
			@Param("status") BillStatus status,
			@Param("monthStart") LocalDate monthStart,
			@Param("nextMonthStart") LocalDate nextMonthStart);

	@Query("""
			select b from Bill b
			join b.tenant t
			join b.contract c
			join c.room r
			where b.owner = :owner
			and (:status is null or b.status = :status)
			and (:month is null or b.month = :month)
			and (
				:keyword is null
				or lower(t.name) like lower(concat('%', :keyword, '%'))
				or lower(t.email) like lower(concat('%', :keyword, '%'))
				or lower(r.name) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<Bill> searchOwnerBills(
			@Param("owner") User owner,
			@Param("keyword") String keyword,
			@Param("status") BillStatus status,
			@Param("month") LocalDate month,
			Pageable pageable);

	@Query("""
			select b from Bill b
			join b.contract c
			join c.room r
			where b.tenant = :tenant
			and (:status is null or b.status = :status)
			and (:month is null or b.month = :month)
			and (
				:keyword is null
				or lower(r.name) like lower(concat('%', :keyword, '%'))
			)
			""")
	Page<Bill> searchTenantBills(
			@Param("tenant") User tenant,
			@Param("keyword") String keyword,
			@Param("status") BillStatus status,
			@Param("month") LocalDate month,
			Pageable pageable);
}
