# Environment Variables Reference

Complete list of all environment variables used across the application, for both the API server and the React frontend.

---

## API Server (`artifacts/api-server`)

These are read at startup and validated by `src/lib/env.ts`. The server will refuse to start if required variables are missing.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string. Format: `postgresql://user:password@host:port/dbname` |
| `PORT` | ✅ | — | Port the Express server listens on. Use `3000` locally |
| `NODE_ENV` | ✅ | `development` | `development`, `production`, or `test`. Controls logging format and behaviour |
| `ALLOWED_ORIGIN` | ⚠️ | `*` | CORS allowed origin(s). Set to your frontend URL in production (e.g. `https://atfal.gh`). Comma-separated for multiple origins |
| `LOG_LEVEL` | ❌ | `info` | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `SUPABASE_URL` | ⚠️ | — | Required when using Supabase client. Format: `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | — | Supabase service role secret. **Never expose this to the browser.** Required when using Supabase Auth or Storage |
| `SUPABASE_ANON_KEY` | ⚠️ | — | Supabase public anon key. Required when creating user-scoped Supabase clients |
| `STORAGE_BUCKET` | ❌ | `member-photos` | Supabase Storage bucket name for member photos |

> ✅ Always required | ⚠️ Required for Supabase features | ❌ Optional

---

## Frontend (`artifacts/atfal-ghana`)

Vite exposes only variables prefixed with `VITE_` to the browser bundle. **Never put secrets in `VITE_` variables.**

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port Vite dev server listens on. Use `5000` |
| `BASE_PATH` | ✅ | URL base path. Use `/` for root deployment |
| `VITE_SUPABASE_URL` | ⚠️ | Supabase project URL. Safe to expose (public) |
| `VITE_SUPABASE_ANON_KEY` | ⚠️ | Supabase anon key. Safe to expose (public, RLS-protected) |
| `VITE_API_BASE_URL` | ❌ | Override API base URL. Defaults to relative `/api` (works with Vite proxy in dev). Set to `https://api.atfal.gh` in production if not using a proxy/rewrite |

---

## `.env.example` template

Create this file in the project root and copy it to `.env.local` (which is git-ignored):

```env
# ─── Database ─────────────────────────────────────────────────────────────────
# Local Replit Postgres:
DATABASE_URL=postgresql://postgres:password@localhost:5432/atfal_ghana

# Local Supabase (after `supabase start`):
# DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Production Supabase:
# DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# ─── API Server ───────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5000
LOG_LEVEL=info

# ─── Supabase (uncomment when using Supabase features) ────────────────────────
# SUPABASE_URL=https://<project-ref>.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# STORAGE_BUCKET=member-photos

# ─── Frontend (Vite) ──────────────────────────────────────────────────────────
PORT=5000
BASE_PATH=/

# VITE_SUPABASE_URL=https://<project-ref>.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_API_BASE_URL=https://api.atfal.gh
```

---

## Security rules

1. **Never commit** `.env`, `.env.local`, or any file containing real secrets to git. The `.gitignore` already excludes `.env*` — do not change this.
2. **Service role key** — treat this like a database password. Only the API server should ever see it.
3. **Anon key** — safe to expose in the browser. Supabase RLS policies control what unauthenticated/anonymous users can access.
4. **`DATABASE_URL`** — keep secret. If exposed, anyone can directly read/write your database.
5. **`ALLOWED_ORIGIN`** — set this to exactly your frontend domain in production. `*` is only acceptable in development.

---

## Local vs Production values

| Variable | Local (Replit) | Local (Supabase) | Production |
|---|---|---|---|
| `DATABASE_URL` | Replit-provisioned URL | `postgresql://postgres:postgres@localhost:54322/postgres` | Supabase pooler URL |
| `SUPABASE_URL` | N/A | `http://localhost:54321` | `https://<ref>.supabase.co` |
| `ALLOWED_ORIGIN` | `*` | `http://localhost:5000` | `https://atfal.gh` |
| `NODE_ENV` | `development` | `development` | `production` |
