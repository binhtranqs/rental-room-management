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
