# Rental Room Interview Notes

## Short project pitch

```text
Rental Room is a full-stack rental operations platform for small landlords. It supports owner and tenant roles, room management, tenant profiles, contract lifecycle, bill creation, tenant payment, owner dashboard analytics, AI-assisted follow-up, and deployed cloud infrastructure.
```

## Tech stack

- Backend: Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, H2 for tests.
- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Auth: JWT access token, role-based backend authorization.
- Payments: mock payment flow plus MoMo sandbox request support.
- AI: owner insights, assistant answers, bill reminders, rules fallback without OpenAI key.
- Deployment: Vercel frontend, Render backend, Render PostgreSQL.
- CI: GitHub Actions backend tests and frontend build/lint.

## Architecture explanation

```text
The frontend calls a REST API through an Axios client. Login stores a JWT in localStorage, and protected frontend routes redirect by role. The backend still owns the real authorization with Spring Security and method-level role checks. The database stores users, rooms, tenant profiles, contracts, bills, and payments.
```

## Important business rules

- Owners can manage their own rooms, tenants, contracts, and bills.
- Tenants can only see bills that belong to their tenant user account.
- Creating an active contract marks the room as `OCCUPIED`.
- Ending a contract marks the room as `AVAILABLE`.
- Bill total is calculated from room rent, electricity, water, and service fees.
- Mock payment marks a tenant bill as `PAID`.
- Owner dashboard monthly revenue is based on paid bills.

## Questions and strong answers

### Why Spring Boot?

```text
Spring Boot is a strong fit for business CRUD systems because it gives mature security, validation, dependency injection, JPA integration, testing support, and production deployment patterns. For this project, those features mattered more than using a lighter backend framework.
```

### How does authentication work?

```text
Users login through /auth/login. The backend authenticates the email and password, then returns a JWT. The frontend stores the token and sends it in the Authorization header. Backend filters validate the JWT and attach the authenticated user to protected requests.
```

### How do owner and tenant permissions work?

```text
There are OWNER and TENANT roles. The frontend has protected routes for navigation, but real security is enforced on the backend with Spring Security and service-level ownership checks. Tenants cannot access another tenant's bill even if they know the bill ID.
```

### How does the contract lifecycle affect rooms?

```text
When an owner creates an active contract for a room, the backend updates the room status to OCCUPIED. When the owner ends the contract, the backend updates the room back to AVAILABLE. This keeps room inventory aligned with real business state.
```

### Why include mock payments?

```text
MoMo sandbox credentials are environment-dependent, so mock payment gives a reliable demo path. It still exercises the real business behavior: payment creation, bill status update, and dashboard revenue update.
```

### What does the AI feature do?

```text
The AI feature summarizes owner portfolio signals, answers operational questions, and drafts bill reminders. If an OpenAI key is not configured, the backend returns rules-based fallback insights so the product remains usable in demo and deploy environments.
```

### How is the app deployed?

```text
The frontend is deployed on Vercel, the backend runs as a Dockerized Spring Boot service on Render, and the database is Render PostgreSQL. Vercel has an environment variable for the backend API URL, and Render has CORS configured to allow the Vercel domain.
```

### What tests exist?

```text
The backend has service and MockMvc integration tests for auth, role access, room, tenant, contract, bill, dashboard, and payment behavior. The frontend has build and lint checks. I also added an API smoke test script that verifies the deployed business workflow end to end.
```

## CV bullets

Use one or two, not all at once:

```text
Built and deployed a full-stack rental room management platform with Spring Boot, PostgreSQL, JWT role-based auth, React, TypeScript, owner/tenant dashboards, contract lifecycle automation, billing, mock payments, CI, and AI-assisted owner workflows.
```

```text
Implemented role-based owner and tenant workflows including room inventory, tenant account creation, active contracts, bill visibility isolation, mock payment processing, and dashboard revenue updates.
```

```text
Deployed a production-style MVP using Vercel, Render, and Render PostgreSQL, with GitHub Actions CI and an API smoke test covering the core business workflow.
```

## Known tradeoffs

- Render free tier can cold start.
- MoMo sandbox payment needs real sandbox credentials; mock payment is the reliable demo path.
- AI uses rules fallback when no OpenAI key is configured.
- Local login rate limiting uses Redis; deployed MVP disables it because Render free deployment does not include Redis.

## Demo recovery lines

If backend is waking up:

```text
This is on Render's free tier, so the first request can take under a minute. Once awake, the app behaves normally.
```

If MoMo is not configured:

```text
The MoMo request path is implemented, but this demo uses mock payment because it does not require external sandbox credentials.
```

If asked about security:

```text
The frontend improves UX with protected routes, but the backend is the source of truth for authorization and ownership checks.
```
