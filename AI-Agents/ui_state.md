# UI State — Personal Journal App

This file defines UI states for each screen.

Rules:
- Every interactive screen must define its states
- States must reflect real backend/API behavior
- No unnecessary or duplicate states

---

## 1. Authentication

### Login Screen (KPIs 2, 3)

States:
- idle (initial)
- loading (request in progress)
- success (redirect to dashboard)
- error_invalid_credentials
- error_network

---

### Register Screen (KPIs 1, 4)

States:
- idle
- loading
- success (redirect to login/dashboard)
- error_validation (password mismatch, invalid email)
- error_network

---

## 2. Dashboard (KPIs 19–22)

States:
- loading (fetch analytics)
- populated (data visible)
- empty (no entries yet)
- error

---

## 3. Entry List (KPIs 7, 11, 13)

States:
- loading (fetch entries)
- populated (entries exist)
- empty (no entries)
- error

---

## 4. Entry Editor (KPIs 8, 9, 12)

States:
- new (creating entry)
- editing (existing entry)
- saving (API request)
- success (saved)
- error_validation (missing title/content)
- error_network

---

## 5. Entry Detail (KPIs 7, 10)

States:
- loading
- populated
- not_found (invalid ID)
- error

---

## 6. Search (KPIs 14–18)

States:
- idle (no query yet)
- loading (search request)
- results_found
- no_results
- error

---

## 7. Filters (Tag & Date)

States:
- idle (no filter applied)
- filtering (request in progress)
- filtered_results
- no_results

---

## 8. Calendar (KPIs 16, 29)

States:
- loading
- populated (dates with entries)
- empty (no entries in month)
- error

---

## 9. Public Entry (KPIs 23, 24)

States:
- loading
- populated (read-only view)
- not_found (invalid/expired link)
- error

---

## 10. Export (KPI 26)

States:
- idle
- exporting (file generation)
- success (download started)
- error

---

## Global Rules

- UI must always reflect backend state
- No optimistic updates unless explicitly required
- No derived or duplicated state
- Errors must be visible and actionable