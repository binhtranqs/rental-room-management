# Rental Room Management

Full-stack rental room management project for internship CV.

## Current Scope

Day 1-2 foundation is in place:

- Spring Boot backend scaffold.
- PostgreSQL and Redis local services through Docker Compose.
- User entity with `ADMIN`, `OWNER`, `TENANT` roles.
- JWT register/login flow.
- Basic stateless Spring Security configuration.
- Owner room CRUD with pagination, search, sorting, and status filter.
- Owner tenant profile CRUD with tenant account creation.
- Contract create/list/detail/update/end with room status updates.
- Bill create/list/detail with automatic total calculation.
- Mock tenant payment flow for bills.
- Owner dashboard summary API.
- Redis-backed login rate limiting.
- Swagger/OpenAPI documentation.
- Standard API error responses for validation, malformed JSON, not found, conflict, and forbidden errors.
- Backend service and MockMvc integration tests for auth and role-based access.
- Test profile using H2 so backend tests can run without local Docker.
- React + Vite + TypeScript frontend foundation with Tailwind, shadcn/ui conventions, routing, and API client.

## Local Backend Setup

Required local services:

```text
PostgreSQL: localhost:5433
Redis:      localhost:6379
Backend:    localhost:8080
```

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Check Docker services:

```bash
docker compose ps
docker compose exec postgres pg_isready -U postgres -d rental_room_db
docker compose exec redis redis-cli ping
```

Run backend tests:

```bash
cd backend
./mvnw test
```

Run backend:

```bash
cd backend
./mvnw spring-boot:run
```

Stop backend with `Ctrl+C`.

Stop Docker services when you are done:

```bash
docker compose down
```

Open API documentation:

```text
http://localhost:8080/swagger-ui/index.html
```

For protected endpoints, click `Authorize` in Swagger UI and paste a JWT access token from `/auth/login`.

## Backend Environment Variables

The backend has local defaults for development, so you can run it without exporting variables after Docker is up.

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/rental_room_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
APP_JWT_SECRET=change-this-secret-key-change-this-secret-key
APP_JWT_EXPIRATION_MS=86400000
APP_RATE_LIMIT_ENABLED=true
```

Tests use the `test` profile with H2 and `APP_RATE_LIMIT_ENABLED=false`, so tests do not need Docker.

## Local Frontend Setup

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

The frontend calls the backend at `http://localhost:8080` by default. Override it with:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Login Rate Limit

Failed `/auth/login` attempts are tracked in Redis with keys like `login:rate:{email}`.
After 5 failed attempts within 15 minutes, the API returns `429 Too Many Requests`.
A successful login clears that email's failed-attempt counter.

Rate limiting is enabled by default. Disable it locally with:

```bash
APP_RATE_LIMIT_ENABLED=false ./mvnw spring-boot:run
```

## Auth Endpoints

Register:

```http
POST /auth/register
```

Login:

```http
POST /auth/login
```

Current user:

```http
GET /auth/me
Authorization: Bearer <token>
```

## Room Endpoints

All room endpoints require an `OWNER` token.

```http
GET /rooms?page=0&size=10&sort=createdAt,desc&keyword=school&status=AVAILABLE
GET /rooms/{id}
POST /rooms
PUT /rooms/{id}
DELETE /rooms/{id}
```

Create/update body:

```json
{
  "name": "Room A1",
  "address": "District 1",
  "area": 25.0,
  "price": 3500000,
  "status": "AVAILABLE",
  "description": "Near school"
}
```

## Contract Endpoints

Owners can create, update, and end contracts. Owners and tenants can list/detail visible contracts.

```http
GET /contracts?page=0&size=10&sort=createdAt,desc&keyword=demo&status=ACTIVE
GET /contracts/{id}
POST /contracts
PUT /contracts/{id}
PATCH /contracts/{id}/end
```

Create/update body:

```json
{
  "tenantId": 1,
  "roomId": 1,
  "startDate": "2026-06-03",
  "endDate": "2027-06-03",
  "deposit": 1000000,
  "monthlyRent": 3500000,
  "status": "ACTIVE"
}
```

Creating an `ACTIVE` contract marks the room as `OCCUPIED`. Ending a contract marks the room as `AVAILABLE`.

## Bill Endpoints

Owners can create bills for active contracts they own. Owners and tenants can list/detail visible bills.

```http
GET /bills?page=0&size=10&sort=createdAt,desc&keyword=demo&status=UNPAID&month=2026-06-01
GET /bills/{id}
POST /bills
PATCH /bills/{id}/mark-paid
```

Create body:

```json
{
  "contractId": 1,
  "month": "2026-06-01",
  "roomRent": 3500000,
  "electricityFee": 150000,
  "waterFee": 100000,
  "serviceFee": 100000,
  "dueDate": "2026-06-10"
}
```

`totalAmount` is calculated by the backend from rent and fee fields. If `status` is omitted, the bill starts as `UNPAID`.
Marking a bill as paid sets `status` to `PAID` and records `paidAt`.

## Payment Endpoints

Tenants can pay their own unpaid or overdue bills through a mock payment flow.

```http
POST /payments/mock
```

Create body:

```json
{
  "billId": 1,
  "method": "MOCK_BANK_TRANSFER"
}
```

Supported mock methods:

```text
MOCK_BANK_TRANSFER
MOCK_CASH
MOCK_E_WALLET
```

The backend creates a payment record, marks the bill as `PAID`, and records `paidAt`.

## Dashboard Endpoints

Owners can view their dashboard summary.

```http
GET /dashboard/owner
```

Response:

```json
{
  "totalRooms": 10,
  "occupiedRooms": 7,
  "availableRooms": 3,
  "activeContracts": 7,
  "unpaidBills": 4,
  "monthlyRevenue": 12000000
}
```

## Tenant Endpoints

All tenant endpoints require an `OWNER` token.

```http
GET /tenants?page=0&size=10&sort=createdAt,desc&keyword=demo
GET /tenants/{id}
POST /tenants
PUT /tenants/{id}
DELETE /tenants/{id}
```

Create body:

```json
{
  "name": "Tenant Demo",
  "email": "tenant@example.com",
  "password": "123456",
  "phone": "0909000001",
  "identityNumber": "ID123456",
  "emergencyContact": "Mom 0909000002"
}
```

Update body:

```json
{
  "name": "Tenant Demo",
  "email": "tenant@example.com",
  "phone": "0909000001",
  "identityNumber": "ID123456",
  "emergencyContact": "Mom 0909000002"
}
```
