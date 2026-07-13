# Rental Room Demo Script

Use this as a 3-5 minute walkthrough during interviews or portfolio reviews.

## Setup

Open the deployed app:

```text
https://rental-room-management-henna.vercel.app
```

Demo accounts:

```text
Owner:  owner.demo.20260713151259@example.com
Tenant: linh.tran.20260713151259.1@example.com
Password: Demo123456
```

If the backend is slow on the first request, mention that Render's free instance can sleep and needs a short cold start.

## 1. Landing page

What to say:

```text
This is a full-stack rental room management platform for small landlords. The landing page introduces the product, while the actual app is role-based for owners and tenants.
```

Show:

- Hero video landing page.
- Login and create owner account actions.
- Product preview section if time allows.

## 2. Owner login and dashboard

Login with the owner account.

What to say:

```text
Owners get a dashboard that summarizes room occupancy, active contracts, unpaid bills, and monthly revenue. The AI assistant has a rules fallback, so the feature still works even if no OpenAI key is configured.
```

Show:

- Owner dashboard metrics.
- AI operations assistant insights.
- Top navigation: Rooms, Tenants, Contracts, Bills.

## 3. Owner workflow

Show these screens in order:

1. Rooms
2. Tenants
3. Contracts
4. Bills

What to say:

```text
The main business flow is: create a room, create a tenant account, create an active contract, then issue bills. When a contract becomes active, the room is occupied. When a contract ends, the room becomes available again.
```

Fast demo path:

- Open Rooms and show room status.
- Open Tenants and show tenant profiles.
- Open Contracts and show active contracts.
- Open Bills and show unpaid/overdue/paid status.

If creating fresh records live, use unique names such as:

```text
Room: Interview Room 01
Tenant: Interview Tenant
Email: interview.tenant.<timestamp>@example.com
Password: Demo123456
```

## 4. Tenant workflow

Logout, then login with the tenant account.

What to say:

```text
Tenants only see their own dashboard and their own bills. The backend enforces role-based access, not just the frontend routes.
```

Show:

- Tenant dashboard.
- Bills page.
- Bill detail page.
- Mock payment action.

## 5. Payment and dashboard update

What to say:

```text
For demo reliability I use a mock payment method. The project also has MoMo sandbox request support, but mock payment is the reliable path without real sandbox credentials.
```

Show:

- Tenant pays a bill through mock payment.
- Bill status changes to `PAID`.
- Owner dashboard revenue updates after payment.

## 6. Closing

What to say:

```text
The project is deployed with Vercel for the React frontend, Render for the Spring Boot backend, and Render PostgreSQL for cloud data. CI runs backend tests plus frontend build and lint on GitHub Actions.
```

Mention:

- Spring Boot backend.
- PostgreSQL persistence.
- JWT auth and role access.
- React, TypeScript, Tailwind frontend.
- API-level smoke test script.
- GitHub Actions CI.

## Backup smoke test

If UI demo time is short, run the API smoke test:

```bash
API_BASE_URL=https://rental-room-backend-642g.onrender.com node scripts/smoke-business-workflow.mjs
```

It verifies owner register/login, room/tenant/contract/bill creation, tenant bill visibility, mock payment, dashboard revenue, and ending a contract.
