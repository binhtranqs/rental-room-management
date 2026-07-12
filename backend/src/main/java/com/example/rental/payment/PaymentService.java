package com.example.rental.payment;

import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import com.example.rental.bill.Bill;
import com.example.rental.bill.BillRepository;
import com.example.rental.bill.BillStatus;
import com.example.rental.common.exception.ConflictException;
import com.example.rental.common.exception.ForbiddenException;
import com.example.rental.common.exception.NotFoundException;
import com.example.rental.payment.dto.MomoCreatePaymentResponse;
import com.example.rental.payment.dto.MomoPaymentRequest;
import com.example.rental.payment.dto.MomoPaymentResponse;
import com.example.rental.payment.dto.PaymentRequest;
import com.example.rental.payment.dto.PaymentResponse;
import com.example.rental.user.Role;
import com.example.rental.user.User;

@Service
public class PaymentService {
	private static final String MOMO_REQUEST_TYPE = "captureWallet";
	private static final String MOMO_EXTRA_DATA = "";

	private final PaymentRepository paymentRepository;
	private final BillRepository billRepository;
	private final RestClient restClient;
	private final Clock clock;
	private final String momoEndpoint;
	private final String momoPartnerCode;
	private final String momoAccessKey;
	private final String momoSecretKey;
	private final String momoRedirectUrl;
	private final String momoIpnUrl;

	public PaymentService(
			PaymentRepository paymentRepository,
			BillRepository billRepository,
			@Value("${app.momo.endpoint}") String momoEndpoint,
			@Value("${app.momo.partner-code}") String momoPartnerCode,
			@Value("${app.momo.access-key}") String momoAccessKey,
			@Value("${app.momo.secret-key}") String momoSecretKey,
			@Value("${app.momo.redirect-url}") String momoRedirectUrl,
			@Value("${app.momo.ipn-url}") String momoIpnUrl) {
		this.paymentRepository = paymentRepository;
		this.billRepository = billRepository;
		this.restClient = RestClient.create();
		this.clock = Clock.systemUTC();
		this.momoEndpoint = momoEndpoint;
		this.momoPartnerCode = momoPartnerCode;
		this.momoAccessKey = momoAccessKey;
		this.momoSecretKey = momoSecretKey;
		this.momoRedirectUrl = momoRedirectUrl;
		this.momoIpnUrl = momoIpnUrl;
	}

	@Transactional
	public PaymentResponse createMockPayment(User tenant, PaymentRequest request) {
		validateTenant(tenant);

		Bill bill = getPayableBill(tenant, request.billId());

		Instant paidAt = Instant.now(clock);
		bill.setStatus(BillStatus.PAID);
		bill.setPaidAt(paidAt);

		Payment payment = Payment.builder()
				.bill(bill)
				.owner(bill.getOwner())
				.tenant(tenant)
				.amount(bill.getTotalAmount())
				.method(request.method())
				.status(PaymentStatus.SUCCESS)
				.paidAt(paidAt)
				.build();

		return PaymentResponse.from(paymentRepository.save(payment));
	}

	@Transactional
	public MomoPaymentResponse createMomoPayment(User tenant, MomoPaymentRequest request) {
		validateTenant(tenant);
		Bill bill = getPayableBill(tenant, request.billId());
		validateMomoConfiguration();

		long amount = bill.getTotalAmount().setScale(0, RoundingMode.HALF_UP).longValue();
		String requestId = UUID.randomUUID().toString();
		String orderId = "BILL-" + bill.getId() + "-" + Instant.now(clock).toEpochMilli();
		String orderInfo = "Pay bill #" + bill.getId();
		String signature = signCreatePayment(amount, orderId, orderInfo, requestId);

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("partnerCode", momoPartnerCode);
		body.put("requestType", MOMO_REQUEST_TYPE);
		body.put("ipnUrl", momoIpnUrl);
		body.put("redirectUrl", momoRedirectUrl);
		body.put("orderId", orderId);
		body.put("amount", amount);
		body.put("orderInfo", orderInfo);
		body.put("requestId", requestId);
		body.put("extraData", MOMO_EXTRA_DATA);
		body.put("signature", signature);
		body.put("lang", "en");

		MomoCreatePaymentResponse momoResponse = restClient.post()
				.uri(momoEndpoint)
				.contentType(MediaType.APPLICATION_JSON)
				.body(body)
				.retrieve()
				.body(MomoCreatePaymentResponse.class);

		if (momoResponse == null) {
			throw new ConflictException("MoMo did not return a payment URL");
		}

		Payment payment = Payment.builder()
				.bill(bill)
				.owner(bill.getOwner())
				.tenant(tenant)
				.amount(bill.getTotalAmount())
				.method(PaymentMethod.MOMO)
				.status(PaymentStatus.PENDING)
				.externalOrderId(orderId)
				.externalRequestId(requestId)
				.payUrl(momoResponse.payUrl())
				.deeplink(momoResponse.deeplink())
				.qrCodeUrl(momoResponse.qrCodeUrl())
				.gatewayResultCode(momoResponse.resultCode())
				.gatewayMessage(momoResponse.message())
				.build();

		return MomoPaymentResponse.from(paymentRepository.save(payment), momoPartnerCode);
	}

	private void validateTenant(User user) {
		if (user.getRole() != Role.TENANT) {
			throw new ForbiddenException("Only tenants can pay bills");
		}
	}

	private Bill getPayableBill(User tenant, Long billId) {
		Bill bill = billRepository.findById(billId)
				.filter(existingBill -> existingBill.getTenant().getId().equals(tenant.getId()))
				.orElseThrow(() -> new NotFoundException("Bill not found"));

		if (bill.getStatus() == BillStatus.PAID) {
			throw new ConflictException("Bill is already paid");
		}

		return bill;
	}

	private void validateMomoConfiguration() {
		if (isBlank(momoEndpoint)
				|| isBlank(momoPartnerCode)
				|| isBlank(momoAccessKey)
				|| isBlank(momoSecretKey)
				|| isBlank(momoRedirectUrl)
				|| isBlank(momoIpnUrl)) {
			throw new ConflictException("MoMo payment is not configured. Use mock payment instead.");
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	private String signCreatePayment(long amount, String orderId, String orderInfo, String requestId) {
		String rawSignature = "accessKey=" + momoAccessKey
				+ "&amount=" + amount
				+ "&extraData=" + MOMO_EXTRA_DATA
				+ "&ipnUrl=" + momoIpnUrl
				+ "&orderId=" + orderId
				+ "&orderInfo=" + orderInfo
				+ "&partnerCode=" + momoPartnerCode
				+ "&redirectUrl=" + momoRedirectUrl
				+ "&requestId=" + requestId
				+ "&requestType=" + MOMO_REQUEST_TYPE;

		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			SecretKeySpec secretKeySpec = new SecretKeySpec(
					momoSecretKey.getBytes(StandardCharsets.UTF_8),
					"HmacSHA256");
			mac.init(secretKeySpec);
			return HexFormat.of().formatHex(mac.doFinal(rawSignature.getBytes(StandardCharsets.UTF_8)));
		}
		catch (Exception ex) {
			throw new ConflictException("Cannot sign MoMo payment request");
		}
	}
}
