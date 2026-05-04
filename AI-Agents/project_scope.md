# Project Scope — Personal Journal App

## Objective
Build a secure, full-stack journaling application for capturing, organizing, searching, and analyzing personal entries with strong privacy controls.

---

## In Scope

### Authentication (KPIs 1–6)
- User registration (email + password)
- Login with JWT/session
- Session persistence
- Password hashing
- Logout

### Journal Entries (KPIs 7–13)
- Create, edit, delete entries
- Rich text support (bold, italic, lists)
- Tags/categories
- Visibility (private/public)
- Reverse chronological ordering

### Search & Organization (KPIs 14–18)
- Keyword search (title + content)
- Tag filtering
- Date range filtering
- Calendar view

### Analytics (KPIs 19–22)
- Entry count
- Writing streak (server-side)
- Top tags
- Monthly heatmap

### Privacy & Export (KPIs 23–26)
- Private access control
- Public shareable URL
- Export as PDF/HTML

### UI & Responsiveness (KPIs 27–29)
- Mobile-friendly editor
- Responsive calendar
- Touch-friendly navigation

### DevOps (KPIs 30–33)
- Docker setup
- Persistent database
- Localhost access

### Testing & Documentation (KPIs 34–39)
- Unit tests for validation, search, privacy
- All tests must pass
- API documentation included

---

## Out of Scope
- No real-time collaboration
- No multi-tenant support
- No caching layer
- No mobile app (web only)
- No AI features
- No media uploads

---

## Success Criteria
- All 39 KPIs pass
- All tests pass
- App runs via docker-compose