package com.example.rental.ai;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rental.ai.dto.AiAssistantResponse;
import com.example.rental.ai.dto.AiInsightResponse;
import com.example.rental.ai.dto.AiInsightResponse.InsightItem;
import com.example.rental.ai.dto.AiReminderResponse;
import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.contract.Contract;
import com.example.rental.contract.ContractRepository;
import com.example.rental.contract.ContractStatus;
import com.example.rental.dashboard.DashboardService;
import com.example.rental.dashboard.dto.OwnerDashboardResponse;
import com.example.rental.room.Room;
import com.example.rental.room.RoomRepository;
import com.example.rental.room.RoomStatus;
import com.example.rental.user.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiOperationsService {
	private static final NumberFormat VND_FORMATTER =
			NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

	private final OpenAiTextClient openAiTextClient;
	private final ObjectMapper objectMapper;
	private final DashboardService dashboardService;
	private final RoomRepository roomRepository;
	private final ContractRepository contractRepository;
	private final BillRepository billRepository;

	public AiOperationsService(
			OpenAiTextClient openAiTextClient,
			ObjectMapper objectMapper,
			DashboardService dashboardService,
			RoomRepository roomRepository,
			ContractRepository contractRepository,
			BillRepository billRepository) {
		this.openAiTextClient = openAiTextClient;
		this.objectMapper = objectMapper;
		this.dashboardService = dashboardService;
		this.roomRepository = roomRepository;
		this.contractRepository = contractRepository;
		this.billRepository = billRepository;
	}

	@Transactional(readOnly = true)
	public AiInsightResponse getOwnerInsights(User owner) {
		OwnerAiContext context = loadOwnerContext(owner);
		if (openAiTextClient.isEnabled()) {
			try {
				return parseInsightResponse(openAiTextClient.complete(buildInsightPrompt(context), 900));
			} catch (RuntimeException exception) {
				return fallbackInsights(context, "rules-fallback");
			}
		}

		return fallbackInsights(context, "rules");
	}

	@Transactional(readOnly = true)
	public AiAssistantResponse answerOwnerQuestion(User owner, String question) {
		OwnerAiContext context = loadOwnerContext(owner);
		String answer;
		String source;

		if (openAiTextClient.isEnabled()) {
			try {
				answer = openAiTextClient.complete(buildAssistantPrompt(context, question), 700);
				source = "openai";
			} catch (RuntimeException exception) {
				answer = fallbackAnswer(context, question);
				source = "rules-fallback";
			}
		} else {
			answer = fallbackAnswer(context, question);
			source = "rules";
		}

		return new AiAssistantResponse(openAiTextClient.isEnabled(), source, Instant.now(), answer);
	}

	@Transactional(readOnly = true)
	public AiReminderResponse generateReminder(User owner, Long billId, String tone) {
		Bill bill = billRepository.findById(billId)
				.filter(existingBill -> existingBill.getOwner().getId().equals(owner.getId()))
				.orElseThrow(() -> new NotFoundException("Bill not found"));

		if (openAiTextClient.isEnabled()) {
			try {
				return parseReminderResponse(
						bill,
						openAiTextClient.complete(buildReminderPrompt(owner, bill, tone), 700));
			} catch (RuntimeException exception) {
				return fallbackReminder(bill, tone, "rules-fallback");
			}
		}

		return fallbackReminder(bill, tone, "rules");
	}

	private OwnerAiContext loadOwnerContext(User owner) {
		OwnerDashboardResponse dashboard = dashboardService.getOwnerDashboard(owner);
		PageRequest latest = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"));
		List<Room> rooms = roomRepository.searchOwnerRooms(owner, "", null, latest).getContent();
		List<Contract> contracts = contractRepository.searchOwnerContracts(owner, "", ContractStatus.ACTIVE, latest).getContent();
		List<Bill> unpaidBills = billRepository.searchOwnerBills(owner, "", BillStatus.UNPAID, null, latest).getContent();
		List<Bill> overdueBills = billRepository.searchOwnerBills(owner, "", BillStatus.OVERDUE, null, latest).getContent();
		long maintenanceRooms = roomRepository.countByOwnerAndStatus(owner, RoomStatus.MAINTENANCE);

		return new OwnerAiContext(owner, dashboard, rooms, contracts, unpaidBills, overdueBills, maintenanceRooms);
	}

	private AiInsightResponse fallbackInsights(OwnerAiContext context, String source) {
		List<InsightItem> insights = new ArrayList<>();
		long totalRooms = Math.max(context.dashboard.totalRooms(), 1);
		long occupancyRate = Math.round((context.dashboard.occupiedRooms() * 100.0) / totalRooms);

		if (!context.overdueBills.isEmpty()) {
			insights.add(new InsightItem(
					"HIGH",
					"Overdue bills need attention",
					context.overdueBills.size() + " overdue bills are visible in the latest records, led by "
							+ context.overdueBills.getFirst().getTenant().getName() + ".",
					"Open Bills, filter OVERDUE, and send payment reminders before creating new monthly bills."));
		}
		if (context.dashboard.unpaidBills() > 0) {
			insights.add(new InsightItem(
					"MEDIUM",
					"Unpaid balance is building up",
					context.dashboard.unpaidBills() + " bills are still unpaid across active tenants.",
					"Prioritize bills closest to due date and follow up with tenants before they become overdue."));
		}
		if (context.maintenanceRooms > 0) {
			insights.add(new InsightItem(
					"MEDIUM",
					"Maintenance rooms reduce available inventory",
					context.maintenanceRooms + " room is marked as maintenance and cannot be rented.",
					"Review repair progress and move the room back to AVAILABLE when inspection is done."));
		}
		if (occupancyRate < 80) {
			insights.add(new InsightItem(
					"LOW",
					"Occupancy can improve",
					"Current occupancy is " + occupancyRate + "% with " + context.dashboard.availableRooms() + " available rooms.",
					"Refresh room descriptions and prices for available rooms before the next tenant search cycle."));
		}

		if (insights.isEmpty()) {
			insights.add(new InsightItem(
					"LOW",
					"Portfolio is stable",
					"Rooms, contracts, and payment status look healthy in the current snapshot.",
					"Keep monitoring unpaid bills and upcoming contract end dates weekly."));
		}

		String summary = "Occupancy is " + occupancyRate + "%, with "
				+ context.dashboard.activeContracts() + " active contracts and "
				+ context.dashboard.unpaidBills() + " unpaid bills.";

		return new AiInsightResponse(openAiTextClient.isEnabled(), source, Instant.now(), summary, insights);
	}

	private AiAssistantResponse fallbackAssistantResponse(OwnerAiContext context, String question, String source) {
		return new AiAssistantResponse(openAiTextClient.isEnabled(), source, Instant.now(), fallbackAnswer(context, question));
	}

	private String fallbackAnswer(OwnerAiContext context, String question) {
		String normalized = question.toLowerCase(Locale.ROOT);
		if (normalized.contains("overdue") || normalized.contains("quá hạn")) {
			return context.overdueBills.isEmpty()
					? "No overdue bills are visible in the latest records."
					: "There are " + context.overdueBills.size() + " overdue bills in the latest records. Start with "
							+ context.overdueBills.getFirst().getTenant().getName() + " for "
							+ context.overdueBills.getFirst().getContract().getRoom().getName() + ".";
		}
		if (normalized.contains("available") || normalized.contains("trống")) {
			return "You currently have " + context.dashboard.availableRooms()
					+ " available rooms out of " + context.dashboard.totalRooms() + " total rooms.";
		}
		if (normalized.contains("revenue") || normalized.contains("doanh thu")) {
			return "Monthly paid revenue is " + formatMoney(context.dashboard.monthlyRevenue())
					+ ". This only counts bills marked PAID in the current month.";
		}
		if (normalized.contains("unpaid") || normalized.contains("chưa")) {
			return "There are " + context.dashboard.unpaidBills()
					+ " unpaid bills. Filter Bills by UNPAID to review and send reminders.";
		}

		return "Current snapshot: " + context.dashboard.totalRooms() + " rooms, "
				+ context.dashboard.occupiedRooms() + " occupied, "
				+ context.dashboard.availableRooms() + " available, "
				+ context.dashboard.activeContracts() + " active contracts, and "
				+ context.dashboard.unpaidBills() + " unpaid bills.";
	}

	private AiReminderResponse fallbackReminder(Bill bill, String tone, String source) {
		String subject = "Payment reminder for " + bill.getContract().getRoom().getName()
				+ " - " + bill.getMonth();
		String greeting = "Chào " + bill.getTenant().getName() + ",";
		String dueLine = bill.getStatus() == BillStatus.OVERDUE || "OVERDUE".equals(tone)
				? "Hóa đơn này đã quá hạn thanh toán từ ngày " + bill.getDueDate() + "."
				: "Hạn thanh toán là ngày " + bill.getDueDate() + ".";
		String closing = "FIRM".equals(tone) || "OVERDUE".equals(tone)
				? "Anh/chị vui lòng thanh toán sớm và phản hồi lại sau khi hoàn tất. Cảm ơn anh/chị."
				: "Anh/chị kiểm tra và thanh toán giúp em trước hạn nhé. Nếu đã thanh toán rồi thì bỏ qua tin nhắn này giúp em.";
		String body = greeting + "\n\n"
				+ "Em gửi anh/chị thông tin hóa đơn phòng " + bill.getContract().getRoom().getName()
				+ " tháng " + bill.getMonth() + ":\n"
				+ "- Tiền phòng: " + formatMoney(bill.getRoomRent()) + "\n"
				+ "- Điện: " + formatMoney(bill.getElectricityFee()) + "\n"
				+ "- Nước: " + formatMoney(bill.getWaterFee()) + "\n"
				+ "- Dịch vụ: " + formatMoney(bill.getServiceFee()) + "\n"
				+ "- Tổng cộng: " + formatMoney(bill.getTotalAmount()) + "\n\n"
				+ dueLine + "\n\n"
				+ closing;

		return new AiReminderResponse(
				openAiTextClient.isEnabled(),
				source,
				Instant.now(),
				bill.getTenant().getEmail(),
				subject,
				body);
	}

	private AiInsightResponse parseInsightResponse(String rawText) {
		try {
			JsonNode root = objectMapper.readTree(stripCodeFence(rawText));
			List<InsightItem> insights = new ArrayList<>();
			for (JsonNode insight : root.path("insights")) {
				insights.add(new InsightItem(
						insight.path("severity").asText("LOW"),
						insight.path("title").asText("AI insight"),
						insight.path("detail").asText("Review this operating signal."),
						insight.path("action").asText("Open the relevant page and verify the records.")));
			}
			if (insights.isEmpty()) {
				throw new IllegalArgumentException("AI returned no insights");
			}
			return new AiInsightResponse(true, "openai", Instant.now(), root.path("summary").asText(), insights);
		} catch (Exception exception) {
			throw new IllegalStateException("Cannot parse AI insight response", exception);
		}
	}

	private AiReminderResponse parseReminderResponse(Bill bill, String rawText) {
		try {
			JsonNode root = objectMapper.readTree(stripCodeFence(rawText));
			return new AiReminderResponse(
					true,
					"openai",
					Instant.now(),
					bill.getTenant().getEmail(),
					root.path("subject").asText("Payment reminder"),
					root.path("body").asText());
		} catch (Exception exception) {
			throw new IllegalStateException("Cannot parse AI reminder response", exception);
		}
	}

	private String buildInsightPrompt(OwnerAiContext context) {
		return """
				You are an operations analyst for a Vietnamese rental room management app.
				Use only the data below. Return JSON only, no markdown.
				Shape:
				{"summary":"one sentence","insights":[{"severity":"HIGH|MEDIUM|LOW","title":"short","detail":"specific","action":"specific next step"}]}

				Data:
				%s
				""".formatted(context.toPromptContext());
	}

	private String buildAssistantPrompt(OwnerAiContext context, String question) {
		return """
				You are an AI assistant inside a rental room management dashboard.
				Answer the owner's question using only the data below.
				Be concise, operational, and mention when data is unavailable.

				Question: %s

				Data:
				%s
				""".formatted(question, context.toPromptContext());
	}

	private String buildReminderPrompt(User owner, Bill bill, String tone) {
		return """
				Write a Vietnamese payment reminder email from owner %s to tenant %s.
				Tone: %s. Return JSON only: {"subject":"...","body":"..."}.
				Be polite, practical, and include bill month, room, due date, total, and fee breakdown.

				Tenant email: %s
				Room: %s
				Month: %s
				Status: %s
				Due date: %s
				Room rent: %s
				Electricity: %s
				Water: %s
				Service: %s
				Total: %s
				""".formatted(
				owner.getName(),
				bill.getTenant().getName(),
				tone,
				bill.getTenant().getEmail(),
				bill.getContract().getRoom().getName(),
				bill.getMonth(),
				bill.getStatus(),
				bill.getDueDate(),
				formatMoney(bill.getRoomRent()),
				formatMoney(bill.getElectricityFee()),
				formatMoney(bill.getWaterFee()),
				formatMoney(bill.getServiceFee()),
				formatMoney(bill.getTotalAmount()));
	}

	private String stripCodeFence(String value) {
		return value.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
	}

	private String formatMoney(BigDecimal amount) {
		return VND_FORMATTER.format(amount);
	}

	private record OwnerAiContext(
			User owner,
			OwnerDashboardResponse dashboard,
			List<Room> rooms,
			List<Contract> contracts,
			List<Bill> unpaidBills,
			List<Bill> overdueBills,
			long maintenanceRooms) {
		String toPromptContext() {
			return """
					Owner: %s
					Rooms: total=%d, occupied=%d, available=%d, maintenance=%d
					Active contracts=%d
					Unpaid bills=%d
					Monthly paid revenue=%s
					Latest rooms=%s
					Latest active contracts=%s
					Latest unpaid bills=%s
					Latest overdue bills=%s
					""".formatted(
					owner.getName(),
					dashboard.totalRooms(),
					dashboard.occupiedRooms(),
					dashboard.availableRooms(),
					maintenanceRooms,
					dashboard.activeContracts(),
					dashboard.unpaidBills(),
					dashboard.monthlyRevenue(),
					rooms.stream().map(room -> room.getName() + " " + room.getStatus()).toList(),
					contracts.stream().map(contract -> contract.getTenant().getName() + " / "
							+ contract.getRoom().getName() + " until " + contract.getEndDate()).toList(),
					unpaidBills.stream().map(bill -> bill.getTenant().getName() + " / "
							+ bill.getContract().getRoom().getName() + " / "
							+ bill.getTotalAmount() + " due " + bill.getDueDate()).toList(),
					overdueBills.stream().map(bill -> bill.getTenant().getName() + " / "
							+ bill.getContract().getRoom().getName() + " / "
							+ bill.getTotalAmount() + " due " + bill.getDueDate()).toList());
		}
	}
}
