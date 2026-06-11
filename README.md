# Majlis Atfal-ul-Ahmadiyya Ghana — Management System

A full-stack member management system for tracking Atfal members, location hierarchies, wing assignments, graduations, and analytics across Ghana.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database](#database)
- [API Reference](#api-reference)
- [Security](#security)
- [Wing Assignment Logic](#wing-assignment-logic)
- [Deployment](#deployment)
- [Supabase Migration](#supabase-migration)
- [Commands](#commands)

---

## Overview

This application manages:

- **Members** — personal details, date of birth, guardian info, photo, and location
- **Wing Assignment** — automatically computed from age: `Atfal Sughir` (< 12), `Atfal Kabir` (12–14), `Khuddam` (15+)
- **Location Hierarchy** — Sector → Region → Zone → Circuit → Jama'at
- **Graduation Tracking** — records when members age into the next wing; audit history preserved
- **Analytics** — national dashboard, sector breakdowns, upcoming graduation alerts, birthday tracking
- **Photo Upload** — member photos uploaded via `POST /api/upload/photo`, stored locally (swap for Supabase Storage in production)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Radix UI, Wouter, TanStack Query |
| Backend | Node.js 24, Express 5, Pino (structured logging) |
| Security | Helmet (security headers), express-rate-limit, CORS origin allowlist, express-async-errors |
| Database | PostgreSQL 16, Drizzle ORM, drizzle-kit |
| Validation | Zod, drizzle-zod (boot-time env validation + runtime request validation) |
| API Contract | OpenAPI 3.1 (source of truth), Orval (code generation) |
| File Uploads | Multer (disk storage locally; swap for Supabase Storage in production) |
| Package Manager | pnpm (workspaces) |
| Language | TypeScript throughout |

---

## Monorepo Structure

```
.
├── backend/                  # Express REST API (port 3000)
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── lib/
│   │   │   ├── env.ts          # Boot-time env validation (Zod)
│   │   │   ├── logger.ts       # Pino logger
│   │   │   └── supabase.ts     # Supabase clients
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts # Global error handler
│   │   │   └── requireAuth.ts  # JWT verification
│   │   └── routes/
│   │       ├── auth.ts         # Authentication endpoints
│   │       ├── members.ts      # Members CRUD
│   │       ├── graduations.ts  # Graduations CRUD
│   │       ├── locations.ts    # Locations endpoints
│   │       ├── analytics.ts    # Analytics endpoints
│   │       ├── uploads.ts      # Photo upload to Supabase Storage
│   │       ├── health.ts       # Health check
│   │       └── index.ts        # Route aggregation
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React frontend (Vite, port 5000)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── context/
│   │   │   ├── AppContext.tsx      # Theme + UI state
│   │   │   └── AuthContext.tsx     # Supabase Auth state
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── layout/AppLayout.tsx
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── forms/
│   │   │   ├── members/
│   │   │   └── filters/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── Graduations.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Locations.tsx
│   │   │   └── Login.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocationCascade.ts
│   │   │   ├── useWingCalc.ts
│   │   │   └── use-mobile.tsx
│   │   └── lib/
│   │       └── utils.ts
│   ├── package.json
│   └── tsconfig.json
├── lib/
│   ├── db/                   # Drizzle schema + database client
│   │   ├── src/
│   │   │   └── schema/
│   │   │       └── members.ts    # Members + related tables (10 performance indexes)
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api-spec/             # OpenAPI 3.1 spec (openapi.yaml) + Orval config
│   ├── api-zod/              # Zod schemas generated from OpenAPI spec
│   └── api-client-react/     # TanStack Query hooks generated from OpenAPI spec
├── supabase/
│   ├── config.toml           # Supabase local config
│   ├── docs/                 # Supabase documentation
│   │   ├── README.md
│   │   ├── local-setup.md
│   │   ├── schema-migration.md
│   │   ├── auth-setup.md
│   │   ├── storage-setup.md
│   │   ├── backend-migration.md
│   │   ├── hosting.md
│   │   └── environment-variables.md
│   └── migrations/           # Database migrations
│       ├── 0001_remove_position.sql
│       ├── 20250611000000_initial_schema.sql
│       └── 20250611000001_storage_setup.sql
├── .env.example              # Environment variable template
├── .env.local                # Local development (git-ignored)
├── pnpm-workspace.yaml       # Workspace + catalog dependency versions
├── pnpm-lock.yaml            # Dependency lock file
├── tsconfig.base.json        # Base TypeScript config
├── tsconfig.json             # Root TypeScript config
├── package.json              # Root scripts (build, typecheck)
└── SUPABASE_CONFIG_COMPLETE.md  # Supabase setup documentation
```

### Key packages

| Package | Name | Purpose |
|---|---|---|
| `lib/db` | `@workspace/db` | Drizzle schema definitions and database connection |
| `lib/api-spec` | `@workspace/api-spec` | OpenAPI spec and Orval codegen config |
| `lib/api-zod` | `@workspace/api-zod` | Server-side Zod validators (generated) |
| `lib/api-client-react` | `@workspace/api-client-react` | React Query hooks (generated) |
| `backend` | `@workspace/backend` | Express REST API server |
| `frontend` | `@workspace/frontend` | React frontend application |

---

## Prerequisites

- **Node.js** `>= 24`
- **pnpm** `>= 10` — install via `npm install -g pnpm`
- **PostgreSQL** `>= 16` — local install, Docker, Supabase local stack, or hosted instance

---

## Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

### Required variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API server port (use `3000`) |

### Optional / production variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` or `production` |
| `ALLOWED_ORIGIN` | `*` | CORS origin(s) — lock this to your domain in production |
| `LOG_LEVEL` | `info` | Pino log level |
| `SUPABASE_URL` | — | Required when using Supabase features |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase admin key — server only, never expose to browser |
| `SUPABASE_ANON_KEY` | — | Supabase public key |
| `STORAGE_BUCKET` | `member-photos` | Supabase Storage bucket name |

See [`supabase/docs/environment-variables.md`](./supabase/docs/environment-variables.md) for the full reference and Supabase-specific variables.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-org/atfal-ghana.git
cd atfal-ghana

# 2. Install all workspace dependencies
pnpm install

# 3. Set your database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/atfal_ghana"

# 4. Push the schema to your database (creates all tables + indexes)
pnpm --filter @workspace/db run push

# 5. Start the API server (port 3000)
PORT=3000 ALLOWED_ORIGIN=http://localhost:5000 pnpm --filter @workspace/api-server run dev

# 6. In a separate terminal, start the frontend (port 5000)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/atfal-ghana run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Development

### Running both services

```bash
# Starts API server (3000) + frontend (5000) in parallel
# (Configured via Replit workflows / your own process manager)
PORT=3000 ALLOWED_ORIGIN=http://localhost:5000 pnpm --filter @workspace/api-server run dev &
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/atfal-ghana run dev
```

### Type checking

```bash
pnpm run typecheck          # all packages
pnpm run typecheck:libs     # lib packages only
```

### Building for production

```bash
pnpm run build
```

Runs `typecheck` first, then builds all packages with a `build` script.

### Regenerating API client code

The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth. After editing it:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This updates:
- `lib/api-zod/src/` — server-side Zod validators
- `lib/api-client-react/src/` — frontend TanStack Query hooks

---

## Database

### Schema overview

| Table | Description |
|---|---|
| `members` | Core member records (name, DOB, wing, location, guardian, photo) |
| `member_history` | Audit log for member changes (wing transitions, edits) |
| `graduations` | Records of wing graduations (previousWing → newWing) |
| `circuits` | Circuit lookup table with usage counts |
| `jamaats` | Jama'at lookup table with usage counts |

### Indexes

The `members` table has 10 indexes on all commonly filtered and searched columns:
`last_name`, `first_name`, `wing`, `sector`, `region`, `zone`, `circuit`, `jamaat`, `date_of_birth`, `created_at`.

### Wing enum

```sql
CREATE TYPE wing AS ENUM ('atfal_sughir', 'atfal_kabir', 'khuddam');
```

### Migration commands

```bash
# Apply current schema (development — direct push)
pnpm --filter @workspace/db run push

# Force push (skips confirmation — use with caution)
pnpm --filter @workspace/db run push-force
```

> For production, generate SQL migrations with `drizzle-kit generate` and apply with `drizzle-kit migrate`.

---

## API Reference

Base URL: `/api`

All endpoints accept and return JSON. Full spec: `lib/api-spec/openapi.yaml`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Server health check |

### Members

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/members` | List members (`wing`, `sector`, `region`, `zone`, `circuit`, `jamaat`, `search`, `page`, `pageSize`) |
| `POST` | `/api/members` | Create a new member |
| `GET` | `/api/members/:id` | Get a single member |
| `PATCH` | `/api/members/:id` | Update a member |
| `DELETE` | `/api/members/:id` | Delete a member |
| `GET` | `/api/members/:id/history` | Audit history for a member |

### Uploads

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/photo` | Upload a member photo (multipart/form-data, field: `photo`, max 5 MB) |
| `GET` | `/api/uploads/:filename` | Serve an uploaded photo |

### Locations

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/locations/circuits` | List all circuits |
| `GET` | `/api/locations/jamaats` | List all jama'ats |

### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | National totals (by wing, new this month, graduations this month) |
| `GET` | `/api/analytics/by-sector` | Member counts by sector |
| `GET` | `/api/analytics/by-region` | Member counts by region |
| `GET` | `/api/analytics/birthdays` | Upcoming birthdays |

### Graduations

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/graduations/upcoming` | Members approaching wing transition |

---

## Security

The API server implements the following security measures:

| Measure | Implementation |
|---|---|
| Security headers | `helmet` — sets HSTS, CSP, X-Content-Type-Options, X-Frame-Options, etc. |
| CORS | Restricted to `ALLOWED_ORIGIN` env var. Defaults to `*` in dev; must be set to your domain in production |
| Rate limiting — general | 300 requests per 15 minutes per IP on all `/api` routes |
| Rate limiting — writes | 60 write requests (POST/PATCH/PUT/DELETE) per 15 minutes per IP |
| Async error handling | `express-async-errors` patches all async route handlers — no unhandled promise rejections crash the server |
| Global error handler | Catches all errors, logs them via Pino, returns structured JSON (never leaks stack traces in production) |
| Env validation | All required env vars validated at boot via Zod — server refuses to start with missing config |
| Input validation | All request bodies, query strings, and path params validated via Zod (generated from OpenAPI spec) |
| Body size limit | JSON and URL-encoded bodies capped at 2 MB |

### What's NOT yet implemented (next steps for production)

- **Authentication** — no login system exists. See [`supabase/docs/auth-setup.md`](./supabase/docs/auth-setup.md) to add Supabase Auth
- **File upload storage** — photos are stored on local disk (ephemeral on most hosts). See [`supabase/docs/storage-setup.md`](./supabase/docs/storage-setup.md) to switch to Supabase Storage
- **React error boundary** — implemented; wraps the entire app and all routes

---

## Wing Assignment Logic

Wing is **computed automatically** from date of birth and is never set manually:

| Age | Wing |
|---|---|
| 0 – 11 | `atfal_sughir` |
| 12 – 14 | `atfal_kabir` |
| 15+ | `khuddam` |

When a member's computed wing differs from the stored wing, a graduation record is created and the member history is updated automatically.

---

## Deployment

The project is configured for **Replit Autoscale** deployment out of the box.

### Environment

Set `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ALLOWED_ORIGIN` (your frontend domain) as secrets in your deployment environment.

### Build

```bash
pnpm run build
```

- Frontend → `frontend/dist/`
- Backend → Built automatically during deployment (depends on your hosting platform)

### Production Start

**Backend (API Server):**
```bash
PORT=3000 node backend/dist/index.mjs
```

**Frontend (Static Files):**
```bash
# Serve from a CDN or static host
PORT=5000 pnpm --filter frontend run serve

# Or with your own web server
npx serve -s frontend/dist -l 5000
```

---

## Supabase Migration

The `supabase/docs/` folder contains a complete guide for migrating from Replit's PostgreSQL to a full Supabase-hosted stack:

| Guide | Description |
|---|---|
| [`supabase/docs/README.md`](./supabase/docs/README.md) | Overview and quick-start checklist |
| [`supabase/docs/local-setup.md`](./supabase/docs/local-setup.md) | Run Supabase locally with Docker |
| [`supabase/docs/schema-migration.md`](./supabase/docs/schema-migration.md) | Complete SQL schema + RLS policies |
| [`supabase/docs/auth-setup.md`](./supabase/docs/auth-setup.md) | Add real authentication |
| [`supabase/docs/storage-setup.md`](./supabase/docs/storage-setup.md) | Member photo uploads via Supabase Storage |
| [`supabase/docs/backend-migration.md`](./supabase/docs/backend-migration.md) | Migrate Express routes to Supabase client |
| [`supabase/docs/hosting.md`](./supabase/docs/hosting.md) | Deploy to Vercel + Railway + Supabase |
| [`supabase/docs/environment-variables.md`](./supabase/docs/environment-variables.md) | Every env var, explained |

---

## Commands

| Command | Description |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm run typecheck` | Type-check frontend and backend |
| `pnpm --filter backend run dev` | Start API server in dev mode (port 3000) |
| `pnpm --filter frontend run dev` | Start frontend in dev mode (port 5000) |
| `pnpm --filter lib/api-spec run codegen` | Regenerate API client + validators from OpenAPI spec |
| `supabase start` | Start local Supabase stack |
| `supabase db push` | Apply migrations to database |
| `supabase logs --tail` | View real-time Supabase logs |

---

## Notes for Contributors

- **`pnpm` only** — the workspace enforces pnpm. Running `npm install` or `yarn` will fail by design.
- **OpenAPI first** — all API changes start in `lib/api-spec/openapi.yaml`, followed by codegen. Do not hand-edit files in `lib/api-zod/src/` or `lib/api-client-react/src/`.
- **Environment validation** — add new env vars to `artifacts/api-server/src/lib/env.ts` (`EnvSchema`) before using them. The server will fail fast if they are missing.
- **Supply-chain safety** — `pnpm-workspace.yaml` enforces a 24-hour `minimumReleaseAge` for all packages. Do not disable this.
- **esbuild version is pinned** to `0.27.3`. Do not upgrade without checking the override in `pnpm-workspace.yaml`.
- **Error handling** — all async Express route handlers are wrapped by `express-async-errors`. You do not need try/catch in route handlers — thrown errors flow to the global error handler automatically.
