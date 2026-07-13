# Release Notes

## Final MVP

Rental Room is ready as a portfolio and internship CV project.

### Highlights

- Full-stack room rental management platform.
- Deployed React/Vite frontend on Vercel.
- Deployed Spring Boot backend on Render.
- Cloud PostgreSQL database on Render.
- JWT authentication with owner and tenant role flows.
- Owner dashboard with occupancy, contracts, unpaid bills, revenue, and AI-assisted insights.
- Owner room, tenant, contract, and bill management.
- Tenant dashboard, bill visibility isolation, bill detail, and mock payment flow.
- Contract lifecycle automation that updates room availability.
- AI owner assistant with rules fallback when no OpenAI key is configured.
- Polished landing page, login/register pages, dashboards, and management screens.
- API smoke test script for deployed business workflow verification.
- GitHub Actions CI for backend tests and frontend build/lint.

### Current Demo Credentials

```text
Owner:  owner.demo.20260713151259@example.com
Tenant: linh.tran.20260713151259.1@example.com
Password: Demo123456
```

### Verification

Latest manual checks completed:

- Vercel frontend returns `200`.
- Render backend `/health` returns `200`.
- GitHub Actions CI is green.
- Deployed API smoke workflow passes.

Smoke command:

```bash
API_BASE_URL=https://rental-room-backend-642g.onrender.com node scripts/smoke-business-workflow.mjs
```

### Known Tradeoffs

- Render free tier may cold start on the first request.
- Mock payment is the reliable demo path.
- MoMo sandbox requires real sandbox credentials.
- AI uses a deterministic rules fallback unless `APP_AI_OPENAI_API_KEY` is configured.
- Login rate limiting uses Redis locally, but is disabled on the deployed free MVP.

### Suggested CV Description

```text
Built and deployed Rental Room, a full-stack rental management platform with Spring Boot, PostgreSQL, JWT role-based auth, React, TypeScript, owner/tenant dashboards, contract lifecycle automation, billing, mock payments, CI, and AI-assisted owner workflows.
```
