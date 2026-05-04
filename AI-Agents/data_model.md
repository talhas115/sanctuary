# Data Model

## User
- id (UUID, PK)
- email (unique, indexed)
- display_name (varchar 255)
- password_hash
- created_at

---

## Entry
- id (UUID, PK)
- user_id (FK → User)
- title (varchar 255, required)
- content (text, required)
- visibility (private/public, default: private)
- date (date)
- created_at (timestamp)
- word_count (computed, not stored — returned in DTO only)
- is_encrypted (boolean, default: false)

Indexes:
- index(user_id)
- index(date)
- tsvector index(title, content)

---

## Tag
- id (UUID, PK)
- name (unique)

---

## EntryTag
- entry_id (FK)
- tag_id (FK)

---

## ShareLink
- id (UUID)
- entry_id (FK)
- public_uuid (unique)

---

## Notes
- Full-text search uses PostgreSQL tsvector
- No redundant data storage
- Analytics computed dynamically (no stored aggregates)
- Relationships must remain consistent