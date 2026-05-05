# 🧪 Test Cases Log — Personal Journal (Sanctuary)

**Last Run:** 2026-05-05 | **Status:** ✅ All Passing

---

## 📊 Summary

| Suite | Framework | Test Files | Total Tests | Passed | Failed |
|---|---|---|---|---|---|
| **Backend** | .NET 8 / xUnit + Moq | 5 | 15 | 15 | 0 |
| **Frontend** | Vitest + Testing Library | 3 | 33 | 33 | 0 |
| **TOTAL** | — | 8 | **48** | **48** | **0** |

---

## 🔵 Backend Tests (.NET 8 / xUnit)

> **Location:** `backend/PersonalJournal.Tests/`
> **Run Command:** `dotnet test PersonalJournal.Tests --logger "console;verbosity=normal"`
> **Duration:** 2.69s

---

### 1. `AuthTests.cs` — Authentication Service

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 1 | `Register_WithValidData_ReturnsAuthResponse` | `{ Email: "test@example.com", Password: "Password123!" }` | Returns `AuthResponseDto` with non-empty JWT token and correct email | ✅ Pass |
| 2 | `Register_WithExistingEmail_ThrowsInvalidOperationException` | `{ Email: "existing@example.com" }` (email already in repo) | Throws `InvalidOperationException` | ✅ Pass |
| 3 | `Login_WithValidCredentials_ReturnsAuthResponse` | Correct email + matching BCrypt password | Returns `AuthResponseDto` with valid token | ✅ Pass |
| 4 | `Login_WithInvalidPassword_ThrowsUnauthorizedAccessException` | Correct email + wrong password `"WrongPassword"` | Throws `UnauthorizedAccessException` | ✅ Pass |
| 5 | `Login_WithNonExistentEmail_ThrowsUnauthorizedAccessException` | `{ Email: "notfound@example.com" }` (repo returns null) | Throws `UnauthorizedAccessException` | ✅ Pass |

**Mocks used:** `IUserRepository`, `IConfiguration` (JWT settings)

---

### 2. `EntryTests.cs` — Entry CRUD Service

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 6 | `CreateEntry_WithValidData_ReturnsEntryResponse` | `{ Title: "Test Title", Content: "<p>Hello world!</p>", Tags: ["test","journal"] }` | Response has correct title, `WordCount = 2`, contains tag `"test"`. `AddAsync` called once. | ✅ Pass |
| 7 | `UpdateEntry_WithValidOwner_UpdatesData` | Entry ID + matching userId, `{ Title: "New Title", Visibility: "public" }` | Response title = `"New Title"`, visibility = `"public"`. `UpdateAsync` called once with correct entry. | ✅ Pass |
| 8 | `UpdateEntry_WithInvalidOwner_ThrowsUnauthorizedAccessException` | Entry owned by User A, update attempted by User B (different GUID) | Throws `UnauthorizedAccessException` | ✅ Pass |
| 9 | `DeleteEntry_WithValidOwner_CallsDelete` | Entry ID + matching userId | `DeleteAsync` called exactly once with the correct entry object | ✅ Pass |

**Mocks used:** `IEntryRepository`

---

### 3. `SearchTests.cs` — Search & Calendar

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 10 | `SearchEntries_ReturnsMappedDtos` | `userId`, `query: "Test"`, `sort: "journal"` → repo returns 2 entries | Result list has 2 items, first title = `"Test 1"` | ✅ Pass |
| 11 | `GetCalendar_ReturnsMappedDtos` | `userId`, `year: 2023`, `month: 10` → repo returns 1 entry dated `2023-10-05` | Result has 1 item with `Date = 2023-10-05` | ✅ Pass |

**Mocks used:** `IEntryRepository`

---

### 4. `AnalyticsTests.cs` — Dashboard Stats

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 12 | `GetDashboardStats_ReturnsCorrectStats` | 2 entries on consecutive days (`2023-10-01`, `2023-10-02`), both tagged `"test"` | `TotalEntries = 2`, `TotalWords = 3`, `LongestStreak = 2`, `TopTags[0].Tag = "test"`, `TopTags[0].Count = 2` | ✅ Pass |

**Mocks used:** `IEntryRepository`

---

### 5. `PublicAccessTests.cs` — Public Share Links

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 13 | `GetPublicEntry_WithValidLink_ReturnsPublicEntryDto` | Valid share UUID pointing to a public entry | Returns `PublicEntryDto` with correct title and content | ✅ Pass |
| 14 | `GenerateShareLink_WithPrivateEntry_ThrowsInvalidOperationException` | Entry with `Visibility = "private"` | Throws `InvalidOperationException` | ✅ Pass |

**Mocks used:** `IEntryRepository`

---

### 6. `UnitTest1.cs` — Placeholder

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 15 | `Test1` | _(none)_ | Passes by default | ✅ Pass |

---

## 🟢 Frontend Tests (Vitest + jsdom)

> **Location:** `frontend/src/`
> **Run Command:** `npx vitest run --reporter=verbose`
> **Duration:** 3.45s

---

### 1. `store/authStore.test.js` — Auth State Management

| # | Test Name | Input / Action | Expected Output | Status |
|---|---|---|---|---|
| 1 | `should initialize with default state` | Fresh store | `isAuthenticated = false`, `user = null`, `token = null` | ✅ Pass |
| 2 | `should login correctly` | `login("fake-jwt", { email: "test@example.com", defaultEncryption: true })` | `isAuthenticated = true`, `token = "fake-jwt"`, `user.email = "test@example.com"`, `defaultEncryption = true` | ✅ Pass |
| 3 | `should logout correctly` | Login then `logout()` | `isAuthenticated = false`, `user = null` | ✅ Pass |
| 4 | `should update user info` | `login(...)` then `updateUser({ displayName: "New" })` | `user.displayName = "New"` | ✅ Pass |

---

### 2. `store/entryStore.test.js` — Entry State Management

| # | Test Name | Input / Action | Expected Output | Status |
|---|---|---|---|---|
| 5 | `should add an entry` | `addEntry({ id: "1", title: "Test" })` | `entries.length = 1`, `entries[0].title = "Test"` | ✅ Pass |
| 6 | `should update an entry` | Seed `[{ id: "1", title: "Old" }]`, call `updateEntry({ id: "1", title: "New" })` | `entries[0].title = "New"` | ✅ Pass |
| 7 | `should delete an entry` | Seed `[{ id: "1" }, { id: "2" }]`, call `deleteEntry("1")` | `entries.length = 1`, remaining entry has `id = "2"` | ✅ Pass |

---

### 3. `test/utils.test.js` — Core Business Logic Utilities _(New)_

#### 3a. Crypto Utilities

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 8 | `encryptContent returns a non-empty string` | `"hello world"` | Returns non-empty string | ✅ Pass |
| 9 | `decryptContent returns a string` | `"some-cipher-text"` | Returns a string type | ✅ Pass |

#### 3b. `filterBySearch` — Entry Search Filter

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 10 | `returns all entries when query is empty` | `query = ""`, 3 entries | Length = 3 | ✅ Pass |
| 11 | `filters by title (case-insensitive)` | `query = "morning"` | 1 result: entry id `"1"` | ✅ Pass |
| 12 | `filters by content (strips HTML tags)` | `query = "mountains"` | 1 result: entry id `"3"` | ✅ Pass |
| 13 | `returns empty array for no match` | `query = "nonexistent"` | Length = 0 | ✅ Pass |

#### 3c. `filterByDate` — Date Range Filter

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 14 | `returns all entries when filter is "all"` | `dateFilter = "all"`, 3 entries | Length = 3 | ✅ Pass |
| 15 | `returns only entries within last 7 days` | `dateFilter = "7days"` (entry 1 = 2d ago, entry 2 = 10d, entry 3 = 45d) | Length = 1, id = `"1"` | ✅ Pass |
| 16 | `returns entries within last 30 days` | `dateFilter = "30days"` | Length = 2, ids `"1"` and `"2"` | ✅ Pass |
| 17 | `excludes entries older than 30 days` | `dateFilter = "30days"` | id `"3"` (45 days ago) NOT in result | ✅ Pass |

#### 3d. `filterByTag` — Tag Filter

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 18 | `returns all entries when filter is "all"` | `tagFilter = "all"` | Length = 3 | ✅ Pass |
| 19 | `filters by string tag` | `tagFilter = "Reflection"` | 1 result: id `"1"` | ✅ Pass |
| 20 | `filters by object tag (name property)` | `tagFilter = "Work"` (entry has `[{ name: "Work" }]`) | 1 result: id `"2"` | ✅ Pass |
| 21 | `returns empty when tag does not match` | `tagFilter = "Growth"` | Length = 0 | ✅ Pass |

#### 3e. `sortEntries` — Sort Order

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 22 | `sorts descending (newest first)` | `sortBy = "desc"` | `result[0].id = "1"` (2d ago), `result[2].id = "3"` (45d ago) | ✅ Pass |
| 23 | `sorts ascending (oldest first)` | `sortBy = "asc"` | `result[0].id = "3"` (45d ago), `result[2].id = "1"` (2d ago) | ✅ Pass |
| 24 | `does not mutate the original array` | Sort with `"asc"` | `MOCK_ENTRIES[0].id` unchanged | ✅ Pass |

#### 3f. `computeQuickTags` — Tag Frequency

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 25 | `returns top tags sorted by frequency` | `Work×3, Health×2, Reflection×1` | `result[0] = "Work"`, `result[1] = "Health"`, `result[2] = "Reflection"` | ✅ Pass |
| 26 | `handles object tags correctly` | `[{ name: "Travel" }, { name: "Travel" }]` | `result[0] = "Travel"` | ✅ Pass |
| 27 | `respects the limit` | 6 unique tags, `limit = 3` | Length = 3 | ✅ Pass |
| 28 | `returns empty array for entries with no tags` | `[{ tags: [] }, {}]` | Length = 0 | ✅ Pass |

#### 3g. `computeStreak` — Writing Streak Calculation

| # | Test Name | Input | Expected Output | Status |
|---|---|---|---|---|
| 29 | `returns 0 for empty dates` | `[]` | `0` | ✅ Pass |
| 30 | `returns 1 for single entry today` | `[today]` | `1` | ✅ Pass |
| 31 | `returns correct streak for consecutive days ending today` | `[2d ago, yesterday, today]` | `3` | ✅ Pass |
| 32 | `returns 0 when last entry was 2+ days ago` | `[5d ago, 4d ago]` | `0` (streak expired) | ✅ Pass |
| 33 | `deduplicates multiple entries on same day` | `[today, today, yesterday]` | `2` (not 3) | ✅ Pass |

---

## 📁 Test File Index

```
backend/
└── PersonalJournal.Tests/
    ├── AuthTests.cs          — 5 tests (Auth Service)
    ├── EntryTests.cs         — 4 tests (Entry CRUD)
    ├── SearchTests.cs        — 2 tests (Search + Calendar)
    ├── AnalyticsTests.cs     — 1 test  (Dashboard Stats)
    ├── PublicAccessTests.cs  — 2 tests (Share Links)
    └── UnitTest1.cs          — 1 test  (Placeholder)

frontend/
└── src/
    ├── store/
    │   ├── authStore.test.js  — 4 tests (Auth State)
    │   └── entryStore.test.js — 3 tests (Entry State)
    └── test/
        ├── setup.js           — Vitest setup (jest-dom)
        └── utils.test.js      — 26 tests (Filter, Crypto, Tags, Streak)
```

---

## 🔧 How to Run

### Backend
```bash
cd backend
dotnet test PersonalJournal.Tests --logger "console;verbosity=normal"
```

### Frontend
```bash
cd frontend
npx vitest run --reporter=verbose
```

### Both (from root)
```bash
# Terminal 1
cd backend && dotnet test PersonalJournal.Tests

# Terminal 2
cd frontend && npx vitest run
```
