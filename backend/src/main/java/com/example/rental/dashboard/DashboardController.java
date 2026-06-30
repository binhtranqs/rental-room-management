package com.example.rental.dashboard;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rental.dashboard.dto.OwnerDashboardResponse;
import com.example.rental.user.User;

@RestController
@RequestMapping("/dashboard")
@PreAuthorize("hasRole('OWNER')")
public class DashboardController {
	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping("/owner")
	public OwnerDashboardResponse getOwnerDashboard(@AuthenticationPrincipal User owner) {
		return dashboardService.getOwnerDashboard(owner);
	}
}
