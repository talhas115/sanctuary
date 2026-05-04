# Decisions Log

This file records important architectural decisions.

Rules:
- Only log decisions that affect architecture, performance, or constraints
- Do not log general rules (those belong in constraints.md)
- Each decision must include: Reason + Impact
- Keep entries concise

---

## Decision: Use PostgreSQL Full-Text Search

Reason:
- Required for search KPIs (14–18)
- Avoid external dependencies (e.g., Elasticsearch)

Impact:
- Use tsvector index on Entry(title, content)
- Queries must use full-text search (no LIKE fallback)

---

## Decision: No Caching Layer

Reason:
- Not required by KPIs
- Adds unnecessary complexity

Impact:
- All performance must be handled via DB optimization
- No Redis or in-memory caching

---

## Decision: Backend Handles All Business Logic

Reason:
- Prevent duplication and inconsistency
- Required for KPI correctness

Impact:
- Frontend must not compute business logic
- Backend handles validation, analytics, and rules

---

## Decision: No Generic Repository Pattern

Reason:
- Adds abstraction without real benefit
- Reduces clarity and control

Impact:
- Use explicit repositories per entity
- Keep data access simple and direct

---

## Decision: Backend-Driven Analytics

Reason:
- KPIs require accurate aggregation
- Prevent inconsistent frontend calculations

Impact:
- Analytics computed in backend only
- Frontend displays results only

---

## Decision: JWT-Based Authentication

Reason:
- Stateless and sufficient for current scope

Impact:
- All protected endpoints require JWT
- Session handled via token

---

## Decision: DTO-Only API Contracts

Reason:
- Prevents entity exposure
- Maintains clear separation of concerns

Impact:
- No direct entity exposure
- All API responses use DTOs

## Decision: Encrypted Entries Excluded from Full-Text Search

Reason:
- AES-256 encryption stores ciphertext on backend
- PostgreSQL tsvector cannot index encrypted content

Impact:
- Search (KPIs 14, 18) skips encrypted entries
- Calendar and tag filters also exclude encrypted entries
- User must be informed via UI

## Decision: Entry `date` Field is User-Chosen Journal Date

Reason:
- Users may write about past events
- `created_at` reflects system timestamp, not journal intent

Impact:
- Streak logic uses `date` field (not `created_at`)
- Calendar view uses `date` field
- Date range filter uses `date` field

## Decision: Use QuestPDF for Server-Side Export

Reason:
- Native .NET library, no external dependencies
- Supports HTML-to-PDF and structured output

Impact:
- GET /export?format=pdf|html handled entirely by backend
- No frontend PDF generation

## Decision: Word Count Computed Dynamically, Not Stored

Reason:
- Storing word count adds redundant data
- Content is always available for computation

Impact:
- Backend strips HTML tags, counts whitespace-delimited words
- Returned in entry response DTO as computed field
- No migration needed

