# CLAUDE.md

Twitter Bookmark Organizer — Express 5 server backed by PostgreSQL, with JWT-based
user auth. Users register, log in, then store/filter bookmarks. Knex is used
exclusively for schema migrations; `pg.Pool` handles all runtime queries.

## MVP target

Three authenticated bookmark endpoints, all scoped to `req.user.userId`:
- `POST /storeBookmark` — store a bookmark (url + tag) for the logged-in user
- `GET /filterBookmarks?tag=<tag>` — return the logged-in user's bookmarks matching a tag
- `GET /bookmarks` — return all bookmarks for the logged-in user

Remaining work before MVP is complete:
- Add `user_id` to the `/storeBookmark` INSERT (currently missing — will fail with constraint error)
- Input validation on all write endpoints (return 400 before any DB call)
- Centralized error handling middleware (separate file, not inline per-route)
- Rate limiting on auth endpoints (`/register`, `/login`)
- Test suite (none exists yet)

Frontend is intentionally minimal — this is a backend portfolio project.

## Project structure

- `app.js` — all routes and DB queries; single file, no splitting
- `middleware/auth.js` — `generateToken` (JWT sign) and `authenticateUser` (JWT verify middleware)
- `utils/passwordHashing.js` — bcrypt `hashPassword` / `verifyPassword` helpers
- `migrations/` — Knex migration files; schema changes happen here, never in `app.js`
- `knexfile.js` — Knex config for migrations only; not imported by the app at runtime
- `views/` — HTML pages served by Express (`index.html`, `login.html`, `register.html`)
- `script.js` — frontend fetch handlers; attaches to form submit events
- `supabaseClient.js` — unused; do not import

## Commands

- Start server: `node app.js`
- Run migrations: `npx knex migrate:latest`
- Roll back: `npx knex migrate:rollback`
- No test suite — verify by starting the server and hitting endpoints manually

## Conventions

- CommonJS throughout (`require`/`module.exports`) — do not use ESM `import`
- `async/await` with try/catch in all route handlers
- DB queries use `pool.query()` with parameterized SQL (`$1`, `$2`) — Knex query builder is never used at runtime
- `dotenv.config()` must be the first call in any file that reads `process.env`
- JWT tokens expire in 15 min; stored in `localStorage` on the frontend as `authToken`; sent as `Authorization: Bearer <token>`; `authenticateUser` middleware populates `req.user` with the decoded payload

## Behavioral guidelines

**Think before coding.** This codebase has two separate DB abstractions — Knex (migrations only)
and `pg.Pool` (runtime queries) — that look interchangeable but are not. If a request is ambiguous
about which to use, ask rather than guess.

**Simplicity first.** Single-file server, no test suite, working toward MVP. Don't split
routes, add middleware layers, or create service abstractions unless explicitly asked.

**Surgical changes.** Edit only what the request requires. Don't reformat `app.js`, reorganize
imports, or clean up adjacent code without being asked.

**Goal-driven execution.** No tests exist — verify by starting the server (`node app.js`)
and hitting the relevant endpoint. State what request/response you'll use to confirm before implementing.

**Learning context.** When making non-obvious changes, explain *why* in one sentence.

## Project-specific rules

- **Never use Knex query builder in `app.js`** — Knex is migrations only; runtime queries use `pool.query()` with parameterized SQL
- **`bookmarks` requires `user_id`** — the migration marks it `notNullable()`; any INSERT must supply `req.user.userId` or it will throw a DB constraint error
- **Validate input before `.trim()` or any DB call** — `undefined.trim()` throws a TypeError that escapes the try/catch; check fields exist first and return 400
- **Protected routes need `Authorization: Bearer <token>`** — `script.js` must read `localStorage.getItem('authToken')` and attach it; `authenticateUser` returns 401 if the header is missing
- **Every migration needs a working `down()`** — migrations run against a live Supabase instance; rollback must work
- **Don't use `supabaseClient.js`** — it's unused; don't import it into `app.js`
