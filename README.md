# Twitter Bookmark Organizer

**A REST API for saving, tagging, and filtering Twitter bookmarks — with JWT authentication and PostgreSQL persistence.**

## The Problem

I needed a way to organize my Twitter bookmarks into specific folders. Twitter's native bookmarking system makes it difficult to categorize links efficiently, causing me to lose track of important resources, tutorials, and threads.

## The Solution

A custom Express backend with user accounts and JWT auth. Each user registers, logs in, and gets their own isolated bookmark collection. Bookmarks are stored with a custom tag and can be filtered by tag. Every endpoint is scoped to the authenticated user — no user can access another's bookmarks.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL (Supabase), accessed via `pg.Pool`
- **Auth:** JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing
- **Validation:** `express-validator`
- **Rate limiting:** `express-rate-limit`
- **Testing:** Jest, Supertest

---

## API Reference

All error responses share a consistent shape:

```json
{ "success": false, "error": "<message>" }
```

Protected routes require an `Authorization` header:

```
Authorization: Bearer <token>
```

---

### POST /register

Create a new user account.

**Auth required:** No  
**Rate limit:** 10 requests / 15 minutes

**Request body:**

| Field | Type | Constraints |
|---|---|---|
| `username` | string | Min 4 characters |
| `password` | string | 8–64 characters |

```json
{ "username": "alice", "password": "securepass123" }
```

**Responses:**

| Status | Body |
|---|---|
| `201 Created` | `{ "message": "User registered successfully" }` |
| `400 Bad Request` | `{ "success": false, "error": "Username is required" }` |
| `400 Bad Request` | `{ "success": false, "error": "Password is required" }` |
| `409 Conflict` | `{ "success": false, "error": "Username already taken" }` |
| `422 Unprocessable Entity` | `{ "success": false, "error": "Username must be at least 4 characters long" }` |
| `422 Unprocessable Entity` | `{ "success": false, "error": "Password must be between 8 and 64 characters long" }` |
| `429 Too Many Requests` | `{ "success": false, "error": "Too many login/register attempts from this IP, please try again after 15 minutes" }` |

---

### POST /login

Authenticate and receive a JWT.

**Auth required:** No  
**Rate limit:** 10 requests / 15 minutes

**Request body:**

| Field | Type | Constraints |
|---|---|---|
| `username` | string | Min 4 characters |
| `password` | string | 8–64 characters |

```json
{ "username": "alice", "password": "securepass123" }
```

**Responses:**

| Status | Body |
|---|---|
| `200 OK` | `{ "message": "Login successful", "token": "<jwt>" }` |
| `400 Bad Request` | `{ "success": false, "error": "Username is required" }` |
| `400 Bad Request` | `{ "success": false, "error": "Password is required" }` |
| `401 Unauthorized` | `{ "success": false, "error": "Invalid credentials" }` |
| `429 Too Many Requests` | `{ "success": false, "error": "Too many login/register attempts from this IP, please try again after 15 minutes" }` |

The JWT expires in **15 minutes**. Include it in subsequent requests as `Authorization: Bearer <token>`.

---

### POST /storeBookmark

Save a new bookmark for the authenticated user.

**Auth required:** Yes (Bearer JWT)  
**Rate limit:** 100 requests / 15 minutes

**Request body:**

| Field | Type | Constraints |
|---|---|---|
| `url` | string | Must be a valid URL |
| `tag` | string | Required, non-empty |

```json
{ "url": "https://twitter.com/user/status/12345", "tag": "algorithms" }
```

**Responses:**

| Status | Body |
|---|---|
| `201 Created` | `{ "message": "Bookmark stored successfully" }` |
| `400 Bad Request` | `{ "success": false, "error": "URL is required" }` |
| `400 Bad Request` | `{ "success": false, "error": "Tag is required" }` |
| `401 Unauthorized` | `{ "success": false, "error": "Access token missing" }` |
| `403 Forbidden` | `{ "success": false, "error": "Invalid access token" }` |
| `403 Forbidden` | `{ "success": false, "error": "Token expired" }` |
| `429 Too Many Requests` | `{ "success": false, "error": "Too many requests from this IP, please try again after 15 minutes" }` |

---

### GET /filterBookmarks

Return the authenticated user's bookmarks matching a tag (case-insensitive).

**Auth required:** Yes (Bearer JWT)  
**Rate limit:** 100 requests / 15 minutes

**Query parameters:**

| Param | Type | Constraints |
|---|---|---|
| `tag` | string | Required |

```
GET /filterBookmarks?tag=algorithms
```

**Responses:**

| Status | Body |
|---|---|
| `200 OK` | `{ "bookmarks": [ { "id": 1, "url": "...", "tag": "algorithms", "user_id": 5 } ] }` |
| `400 Bad Request` | `{ "success": false, "error": "Tag is required" }` |
| `401 Unauthorized` | `{ "success": false, "error": "Access token missing" }` |
| `403 Forbidden` | `{ "success": false, "error": "Invalid access token" }` |
| `403 Forbidden` | `{ "success": false, "error": "Token expired" }` |
| `429 Too Many Requests` | `{ "success": false, "error": "Too many requests from this IP, please try again after 15 minutes" }` |

Returns an empty array if no bookmarks match the tag.

---

### GET /bookmarks

Return all bookmarks for the authenticated user.

**Auth required:** Yes (Bearer JWT)  
**Rate limit:** 100 requests / 15 minutes

```
GET /bookmarks
```

**Responses:**

| Status | Body |
|---|---|
| `200 OK` | `{ "bookmarks": [ { "id": 1, "url": "...", "tag": "...", "user_id": 5 } ] }` |
| `401 Unauthorized` | `{ "success": false, "error": "Access token missing" }` |
| `403 Forbidden` | `{ "success": false, "error": "Invalid access token" }` |
| `403 Forbidden` | `{ "success": false, "error": "Token expired" }` |
| `429 Too Many Requests` | `{ "success": false, "error": "Too many requests from this IP, please try again after 15 minutes" }` |

Returns an empty array if the user has no bookmarks.

---

## Setup

**Prerequisites:** Node.js, a PostgreSQL database (Supabase recommended)

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd Twitter-Bookmark-Organizer
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   PG_CONNECTION_STRING=<your-postgres-connection-string>
   SECRET_ACCESS_TOKEN=<a-long-random-secret>
   ```

3. Run database migrations to create the `users` and `bookmarks` tables:
   ```bash
   npx knex migrate:latest
   ```

4. Start the server:
   ```bash
   node server.js
   ```

The server runs on `http://localhost:3000`.

---

## Running Tests

```bash
npm test
```

Uses Jest + Supertest against a real database. The test suite registers a test user in `beforeAll` and deletes all test data in `afterAll` — no manual DB setup required.
