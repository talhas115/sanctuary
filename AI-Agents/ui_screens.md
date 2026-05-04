# UI Screens — Personal Journal App

This file defines all UI screens strictly based on KPIs.

Rule:
- Every screen must map to one or more KPIs
- No additional screens beyond defined scope

---

## 1. Authentication

### Login Screen (KPIs 2, 3)
Components:
- Email input
- Password input
- Login button
- Link to Register

Actions:
- Submit credentials
- Navigate to dashboard on success

---

### Register Screen (KPIs 1, 4)
Components:
- Email input
- Password input
- Confirm password input
- Register button

Actions:
- Create new user
- Redirect to login/dashboard

---

## 2. Dashboard

### Dashboard Screen (KPIs 19–22)
Components:
- Entry count display
- Writing streak display
- Top tags list
- Heatmap (monthly activity)
- Navigation menu

Actions:
- Navigate to Entries, Search, Calendar

---

## 3. Journal (Core Feature)

### Entry List Screen (KPIs 7, 11, 13)
Components:
- List of entries (latest first)
- Entry card:
  - title
  - date
  - tags
- Create new entry button

Actions:
- Open entry detail
- Navigate to editor
- Delete entry (optional inline or detail)

---

### Entry Editor Screen (KPIs 8, 9, 12)
Components:
- Title input
- Rich text editor
- Tag selector
- Visibility toggle (private/public)
- Save button
- Word count display
- Encryption toggle
- Encryption warning banner (visible when toggle is ON):
  "Encrypted entries are excluded from search and calendar."

Actions:
- Create entry
- Update entry
- Save changes

---

### Entry Detail Screen (KPIs 7, 10)
Components:
- Title
- Content
- Tags
- Edit button
- Delete button
- Word count display

Actions:
- Edit entry
- Delete entry

---

## 4. Search & Filters

### Search Screen (KPIs 14–18)
Components:
- Search input (keyword)
- Tag filter dropdown
- Date range filter
- Results list (entry cards)

Actions:
- Search by keyword
- Filter by tag
- Filter by date range
- Open entry from results

---

## 5. Calendar

### Calendar Screen (KPIs 16, 29)
Components:
- Monthly calendar view
- Highlighted dates with entries
- Entry preview on date selection

Actions:
- Navigate between months
- View entries for selected date

---

## 6. Public Sharing

### Public Entry Screen (KPIs 23, 24)
Components:
- Title
- Content
- Tags

Rules:
- Read-only view
- No edit/delete actions

---

## 7. Export

### Export Action (KPIs 26)
Location:
- Entry Detail Screen

Components:
- Export button (PDF/HTML)

Actions:
- Download file

---

## Navigation (Global)

Components:
- Dashboard
- Entries
- Search
- Calendar

Rules:
- Always accessible after login