# 📓 Sanctuary — Personal Journal App

> A premium, full-stack personal journaling application built with React + .NET 8. Write, encrypt, tag, and reflect — all in a beautiful, responsive interface.

---

## ✨ Features

| Category | Features |
|---|---|
| **Authentication** | JWT-based register & login, BCrypt password hashing, auto-logout on 401 |
| **Journal Entries** | Rich-text editor (TipTap), create/edit/delete, word count, read time |
| **Privacy** | Per-entry visibility (public/private), optional client-side AES encryption |
| **Search & Filters** | Full-text search, date range filter, tag filter, sort order |
| **Tags** | Tag management, frequency analytics, tag universe dashboard |
| **Calendar** | Monthly view with entry heatmap, split-panel layout |
| **Analytics Dashboard** | Writing streak, total entries, word count, top tags |
| **Data Export** | Export journal as PDF or HTML |
| **Public Sharing** | Generate shareable public links for individual entries |
| **Responsive UI** | Fully mobile-friendly — all pages optimised for phone/tablet/desktop |

---

## 🏗 Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| TailwindCSS | 4 | Utility-first styling |
| TipTap | 3 | Rich-text editor |
| Zustand | 5 | State management |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| CryptoJS | 4 | Client-side AES encryption |
| Lucide React | 1.x | Icon library |
| Vitest | 4 | Unit testing |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| .NET | 8.0 | Runtime |
| ASP.NET Core Web API | 8.0 | REST API framework |
| Entity Framework Core | 8.0 | ORM |
| PostgreSQL | 15 | Primary database (via Npgsql) |
| JWT Bearer | — | Authentication tokens |
| BCrypt.Net-Next | — | Password hashing |
| Swagger / OpenAPI | — | API documentation |
| xUnit | 2.5 | Unit testing |
| Moq | 4.20 | Mocking framework |

---

## 📂 Project Structure

```
Personal_Journal/
├── backend/
│   ├── PersonalJournal.API/          # ASP.NET Core Web API
│   │   ├── Controllers/              # Auth, Entries, Analytics, Export, Public
│   │   ├── Data/                     # ApplicationDbContext + EF migrations
│   │   ├── DTOs/                     # Request/Response data transfer objects
│   │   ├── Models/                   # Domain entities (User, Entry, Tag, etc.)
│   │   ├── Repositories/             # Data access interfaces + implementations
│   │   ├── Services/                 # Business logic layer
│   │   ├── appsettings.json          # App configuration
│   │   └── Program.cs                # App entry point + DI registration
│   └── PersonalJournal.Tests/        # xUnit test project (15 tests)
│       ├── AuthTests.cs
│       ├── EntryTests.cs
│       ├── SearchTests.cs
│       ├── AnalyticsTests.cs
│       └── PublicAccessTests.cs
├── frontend/
│   ├── src/
│   │   ├── components/               # AppLayout, navigation
│   │   ├── pages/                    # Dashboard, EntryList, EntryEditor, Calendar, Tags, Settings, Auth
│   │   ├── store/                    # Zustand stores (auth, entry)
│   │   ├── services/                 # Axios API client
│   │   ├── utils/                    # Crypto helpers
│   │   └── test/                     # Vitest test files (33 tests)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── AI-Agents/                        # Project documentation & audits
│   ├── kpi_audit.md
│   └── test_cases_log.md
└── docker-compose.yml                # Full stack containerised setup
```

---

## 🚀 Installation & Setup

### Prerequisites

Make sure the following are installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download |
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Git | any | https://git-scm.com |

> **Alternative:** Use Docker Desktop to skip manual PostgreSQL setup — see [Docker Setup](#-docker-setup-recommended).

---

### Option A — Manual Setup (Local Development)

#### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd Personal_Journal
```

---

#### Step 2 — Database Setup (PostgreSQL)

Create the database and user:

```sql
-- Run in psql or pgAdmin
CREATE USER journal_user WITH PASSWORD 'journal_password';
CREATE DATABASE journal_db OWNER journal_user;
GRANT ALL PRIVILEGES ON DATABASE journal_db TO journal_user;
```

---

#### Step 3 — Backend Setup

```bash
cd backend/PersonalJournal.API
```

**Configure the connection string** in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=journal_db;Username=journal_user;Password=journal_password"
  },
  "JwtSettings": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast32CharactersLong",
    "Issuer": "PersonalJournalApp",
    "Audience": "PersonalJournalUsers",
    "ExpirationInMinutes": 1440
  }
}
```

> ⚠️ **Change the JWT Secret** in production — it must be at least 32 characters.

**Run the API** (EF migrations run automatically on startup):

```bash
dotnet run
```

The API will start at: **`http://localhost:5028`**
Swagger UI available at: **`http://localhost:5028/swagger`**

---

#### Step 4 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will start at: **`http://localhost:5173`**

> The frontend is pre-configured to call `http://localhost:5028/api`. No `.env` file needed for local dev.

---

### Option B — Docker Setup (Recommended)

Runs the entire stack (PostgreSQL + API + Frontend) with a single command.

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

#### Run everything

```bash
# From the project root
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |
| PostgreSQL | localhost:5432 |

To stop:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

---

## 🔑 Environment Configuration

### Backend (`appsettings.json`)

| Key | Description | Default |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string | `localhost:5432/journal_db` |
| `JwtSettings:Secret` | JWT signing secret (min 32 chars) | See file |
| `JwtSettings:Issuer` | Token issuer name | `PersonalJournalApp` |
| `JwtSettings:Audience` | Token audience name | `PersonalJournalUsers` |
| `JwtSettings:ExpirationInMinutes` | Token lifetime | `1440` (24 hours) |

### Frontend (`src/services/api.js`)

| Variable | Description | Default |
|---|---|---|
| `API_BASE_URL` | Backend API base URL | `http://localhost:5028/api` |

> To change the backend URL, edit line 5 of `frontend/src/services/api.js`.

---

## 🗺 API Endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account | No |
| `POST` | `/api/auth/login` | Login, returns JWT | No |
| `PUT` | `/api/auth/profile` | Update display name / email | ✅ |
| `POST` | `/api/auth/change-password` | Change password | ✅ |
| `GET` | `/api/entries` | List all entries | ✅ |
| `POST` | `/api/entries` | Create new entry | ✅ |
| `GET` | `/api/entries/{id}` | Get entry by ID | ✅ |
| `PUT` | `/api/entries/{id}` | Update entry | ✅ |
| `DELETE` | `/api/entries/{id}` | Delete entry | ✅ |
| `GET` | `/api/entries/search` | Search entries | ✅ |
| `GET` | `/api/entries/calendar` | Calendar month data | ✅ |
| `GET` | `/api/analytics/stats` | Dashboard statistics | ✅ |
| `GET` | `/api/analytics/streak` | Writing streak | ✅ |
| `GET` | `/api/analytics/heatmap` | Activity heatmap | ✅ |
| `GET` | `/api/export` | Export journal (PDF/HTML) | ✅ |
| `POST` | `/api/public/generate/{id}` | Generate share link | ✅ |
| `GET` | `/api/public/{uuid}` | View shared entry | No |

> Full interactive docs available at `/swagger` when running in Development mode.

---

## 🧪 Running Tests

### Backend Tests (xUnit — 15 tests)

```bash
cd backend
dotnet test PersonalJournal.Tests --logger "console;verbosity=normal"
```

Expected output:
```
Total tests: 15  |  Passed: 15  |  Failed: 0
```

### Frontend Tests (Vitest — 33 tests)

```bash
cd frontend
npx vitest run --reporter=verbose
```

Expected output:
```
Test Files: 3 passed  |  Tests: 33 passed
```

> See [`AI-Agents/test_cases_log.md`](AI-Agents/test_cases_log.md) for full test case documentation.

---

## 📱 Application Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Stats overview — streak, entries, words, top tags |
| `/entries` | Journal Entries | Feed with search, date/tag filters, pagination |
| `/entries/new` | Entry Editor | Create new journal entry with rich-text editor |
| `/entries/:id/edit` | Entry Editor | Edit existing entry |
| `/calendar` | Calendar View | Monthly calendar + entry list split view |
| `/tags` | Tags | Tag universe — frequency analytics and tag cards |
| `/settings` | Settings | Profile, security, encryption, data export |
| `/share/:uuid` | Public Entry | Publicly shared entry view (no auth required) |
| `/login` | Login | Sign in to your account |
| `/register` | Register | Create a new account |

---

## 🔒 Security Notes

- Passwords are hashed with **BCrypt** (never stored in plain text)
- JWT tokens expire after **24 hours** by default
- Optional **AES client-side encryption** for sensitive entries (encrypted before reaching the server)
- Private entries are inaccessible via the public share endpoint
- CORS is restricted to `localhost:5173` in development

> For production deployment, change the JWT secret, restrict CORS origins, and use HTTPS.

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|---|---|
| `Connection refused` on startup | Ensure PostgreSQL is running on port 5432 |
| `Invalid JWT` errors | Check that `JwtSettings:Secret` matches in `appsettings.json` |
| CORS errors in browser | Ensure backend is running on `localhost:5028` and frontend on `localhost:5173` |
| Migrations fail | Run `dotnet ef database update` manually from `backend/PersonalJournal.API/` |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then retry |
| Port 5028 in use | Change launch port in `Properties/launchSettings.json`, update `api.js` to match |

---

## 📄 License

This project is for educational/assessment purposes.

---

*Built with ❤️ using React, .NET 8, and PostgreSQL.*
