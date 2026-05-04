# Architecture — Personal Journal App

## Overview
Full-stack journaling system using .NET backend, React frontend, PostgreSQL database, deployed via Docker.

---

## Principles
- Clean Architecture: Controllers → Services → Repositories
- Backend is source of truth
- DTO-only communication
- KPI-driven development
- Minimalist implementation (no overengineering)

---

## Layered Architecture
Controllers:
- Handle request/response only
- No business logic

Services:
- Contain all business logic
- Enforce rules and validations

Repositories:
- Handle data access only
- No business logic

---


## API Design

Base path: `/api`

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/logout

### Entries
- GET /entries
- POST /entries
- GET /entries/{id}
- PUT /entries/{id}
- DELETE /entries/{id}

### Search
- GET /entries/search?q=

### Calendar
- GET /entries/calendar?month=

### Public Access
- GET /entries/public/{uuid}

### Analytics
- GET /analytics/dashboard

### Export
- GET /export?format=pdf|html        → all entries
- GET /export/{id}?format=pdf|html   → single entry

---

## Security
- JWT authentication
- BCrypt password hashing
- Authorization: user-only access for private entries

---

## Business Logic

### Entry Rules
- Title required
- Content required
- Default visibility = private
- Created_by = logged-in user

### Streak Logic
- ≥1 entry/day = 1 count
- Consecutive days = increment
- Missed day = reset
- Longest streak persists
- Computed server-side

### Search
- PostgreSQL full-text search (tsvector)
- No LIKE-based fallback

### Encryption
- AES-256 client-side encryption
- Backend stores ciphertext only

---

## KPI Enforcement
- No feature without KPI mapping
- No feature complete without test
- Backend handles all business logic

---

## AI Execution Model

Personas:
- /personas/backend_persona.md
- /personas/frontend_persona.md
- /personas/tester_persona.md

Rules:
- One persona per task
- Constraints always apply
- Architecture cannot be overridden

---

## Deployment

Docker Services:
- api
- web
- db

Requirements:
- docker-compose up works
- Persistent DB volume
- Accessible at localhost:3000