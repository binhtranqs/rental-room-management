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
- Swagger/OpenAPI documentation.
- Standard API error responses for validation, malformed JSON, not found, conflict, and forbidden errors.
- Backend service and MockMvc integration tests for auth and role-based access.
- Test profile using H2 so backend tests can run without local Docker.

## Local Backend Setup

Start infrastructure:

```bash
docker compose up -d
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

Open API documentation:

```text
http://localhost:8080/swagger-ui/index.html
```

For protected endpoints, click `Authorize` in Swagger UI and paste a JWT access token from `/auth/login`.

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
