# CLAUDE.md

Twitter bookmark organizer — a flat-file Express 5 server backed by PostgreSQL,
with Knex used exclusively for schema migrations. First portfolio project, actively
working toward MVP.

## Project structure

- `app.js` — single-file Express server; all routes live here; DB queries use `pg.Pool` directly
- `migrations/` — Knex migration files; schema changes happen here, never in `app.js`
- `knexfile.js` — Knex config for migrations only; not imported by the app at runtime
- `index.html`, `script.js`, `styles.css` — frontend; served as static files via Express
- `supabaseClient.js` — currently unused; do not import into `app.js`

## Commands

- Start server: `node app.js`
- Run migrations: `npx knex migrate:latest`
- Roll back: `npx knex migrate:rollback`
- No test suite configured

## Conventions

- CommonJS throughout (`require`/`module.exports`) — do not use ESM `import`
- `async/await` with try/catch in all route handlers
- DB queries use `pg.Pool` + parameterized SQL (`$1`, `$2`) — Knex query builder is never used at runtime
- `dotenv.config()` must be called before any `process.env` access — already wired in `app.js` and `knexfile.js`

## Behavioral guidelines

**Think before coding.** This codebase has two separate DB abstractions — Knex (migrations only)
and `pg.Pool` (runtime queries) — that look interchangeable but are not. If a request is ambiguous
about which to use, ask rather than guess.

**Simplicity first.** This is a learning project in a single file working toward MVP. Don't split
routes into separate files, add middleware layers, or create a service layer unless explicitly asked.
Get features working first.

**Surgical changes.** Edit only what the request requires. Don't reformat `app.js`, reorganize
imports, or clean up unused code without being asked.

**Goal-driven execution.** No tests exist — verify changes by starting the server (`node app.js`)
and hitting the relevant endpoint. State what request/response you'll use to confirm before implementing.

**Learning context.** When making non-obvious changes, briefly explain *why* — one sentence is enough.
This helps build understanding, not just working code.

## Project-specific rules

- **Never use Knex query builder in `app.js`** — Knex is migrations only; runtime queries use `pool.query()` with parameterized SQL
- **`bookmarks` requires `user_id`** — the migration marks it `notNullable()`; any INSERT into `bookmarks` must supply `user_id` or it will throw a DB constraint error (blocked until auth is implemented)
- **Validate input before querying** — write endpoints should check required fields exist and return 400 before any DB call
- **Every migration needs a working `down()`** — migrations run against a live Supabase instance; rollback must work
- **Don't add `supabaseClient` or `fs`** — both are unused; `fs@0.0.1-security` is a stub package
