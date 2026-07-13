# Final Release Checklist

Use this checklist before sharing the project on a CV, portfolio, or interview call.

## Repository

- [x] Main branch pushed to GitHub.
- [x] README includes deployed URLs.
- [x] README includes demo credentials.
- [x] README includes screenshots.
- [x] README includes local setup instructions.
- [x] README includes deployed smoke test instructions.
- [x] CI badge is visible.
- [x] Demo script is documented.
- [x] Interview notes are documented.
- [x] No GitHub token is committed.
- [x] `NEXT_SESSION_CONTEXT.md` is kept local and not committed.

## CI

- [x] GitHub Actions workflow exists.
- [x] Backend test job runs `./mvnw test`.
- [x] Frontend job runs `npm ci`, `npm run build`, and `npm run lint`.
- [x] Latest CI run is green.

## Deployed App

- [x] Frontend loads on Vercel.
- [x] Backend `/health` returns `{"status":"ok"}`.
- [x] Vercel frontend is configured with the Render backend URL.
- [x] Render CORS allows the Vercel frontend origin.
- [x] Protected frontend routes refresh without a 404.

## Business Workflow

- [x] Owner can register and login.
- [x] Owner can create rooms.
- [x] Owner can create tenant accounts.
- [x] Owner can create active contracts.
- [x] Active contracts mark rooms as `OCCUPIED`.
- [x] Owner can create bills.
- [x] Tenant can login.
- [x] Tenant can only see their own bills.
- [x] Tenant can pay a bill through mock payment.
- [x] Paid bills update owner dashboard revenue.
- [x] Owner can end contracts.
- [x] Ended contracts release rooms back to `AVAILABLE`.

## Demo Notes

- [x] Render free tier cold start is noted in README.
- [x] Mock payment is documented as the reliable demo path.
- [x] MoMo sandbox support is documented as credential-dependent.
- [x] AI rules fallback is documented for environments without an OpenAI key.

## Final Share Links

```text
Repository: https://github.com/binhtranqs/rental-room-management
Frontend:   https://rental-room-management-henna.vercel.app
Backend:    https://rental-room-backend-642g.onrender.com
Swagger:    https://rental-room-backend-642g.onrender.com/swagger-ui/index.html
```
