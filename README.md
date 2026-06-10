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
- [Wing Assignment Logic](#wing-assignment-logic)
- [Deployment](#deployment)
- [Scripts](#scripts)

---

## Overview

This application manages:

- **Members** — personal details, date of birth, guardian info, photo, and location
- **Wing Assignment** — automatically computed from age: `Atfal Sughir` (< 12), `Atfal Kabir` (12–14), `Khuddam` (15+)
- **Location Hierarchy** — Sector → Region → Zone → Circuit → Jama'at
- **Graduation Tracking** — records when members age into the next wing; audit history preserved
- **Analytics** — national dashboard, sector breakdowns, upcoming graduation alerts, birthday tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Radix UI, Wouter, TanStack Query |
| Backend | Node.js 24, Express 5, Pino (structured logging) |
| Database | PostgreSQL 16, Drizzle ORM, drizzle-kit |
| Validation | Zod, drizzle-zod |
| API Contract | OpenAPI 3.1 (source of truth), Orval (code generation) |
| Package Manager | pnpm (workspaces) |
| Language | TypeScript throughout |

---

## Monorepo Structure

```
.
├── artifacts/
│   ├── atfal-ghana/          # React frontend (Vite, port 5000)
│   ├── api-server/           # Express REST API (port 3000)
│   └── mockup-sandbox/       # UI component sandbox (development only)
├── lib/
│   ├── db/                   # Drizzle schema + database client
│   ├── api-spec/             # OpenAPI 3.1 spec (openapi.yaml) + Orval config
│   ├── api-zod/              # Zod schemas generated from OpenAPI spec
│   └── api-client-react/     # TanStack Query hooks generated from OpenAPI spec
├── scripts/
│   └── post-merge.sh         # Runs after branch merges (install + db push)
├── supabase/
│   └── migrations/           # Legacy migration files (historical reference)
├── pnpm-workspace.yaml       # Workspace + catalog dependency versions
└── package.json              # Root scripts (build, typecheck)
```

### Key packages

| Package | Name | Purpose |
|---|---|---|
| `lib/db` | `@workspace/db` | Drizzle schema definitions and database connection |
| `lib/api-spec` | `@workspace/api-spec` | OpenAPI spec and Orval codegen config |
| `lib/api-zod` | `@workspace/api-zod` | Server-side Zod validators (generated) |
| `lib/api-client-react` | `@workspace/api-client-react` | React Query hooks (generated) |
| `artifacts/api-server` | `@workspace/api-server` | Express REST API server |
| `artifacts/atfal-ghana` | `@workspace/atfal-ghana` | React frontend |

---

## Prerequisites

- **Node.js** `>= 24`
- **pnpm** `>= 10` — install via `npm install -g pnpm`
- **PostgreSQL** `>= 16` — local install, Docker, or a hosted instance (e.g. Neon, Supabase, Railway)

---

## Environment Variables

Create a `.env` file in the **root** of the repository (or set these in your environment):

```env
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/atfal_ghana
```

The database connection is consumed by `lib/db` and `drizzle-kit`. No other secrets are required for local development.

> **Note:** Individual `artifacts/` packages read `PORT` and `BASE_PATH` at startup — these are passed by the workflow commands below and do not need to be in `.env`.

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

# 4. Push the schema to your database (creates all tables)
pnpm --filter @workspace/db run push

# 5. Start the API server (port 3000)
PORT=3000 pnpm --filter @workspace/api-server run dev

# 6. In a separate terminal, start the frontend (port 5000)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/atfal-ghana run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Development

### Running both services together

```bash
# Starts both the API server and frontend in parallel
pnpm run dev
```

> This requires a `dev` script at the root, or run each service in separate terminal tabs as shown above.

### Type checking

```bash
# Type-check all packages
pnpm run typecheck

# Type-check only lib packages
pnpm run typecheck:libs
```

### Building for production

```bash
pnpm run build
```

This runs `typecheck` first, then builds all packages that have a `build` script.

### Regenerating API client code

The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth. After editing it, regenerate the Zod schemas and React Query hooks:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This updates:
- `lib/api-zod/src/` — server-side request/response validators
- `lib/api-client-react/src/` — frontend TanStack Query hooks

---

## Database

### Schema overview

| Table | Description |
|---|---|
| `members` | Core member records (name, DOB, wing, location, guardian) |
| `member_history` | Audit log for member changes (wing transitions, edits) |
| `graduations` | Records of wing graduations (previousWing → newWing) |
| `circuits` | Circuit lookup table with usage counts |
| `jamaats` | Jama'at lookup table with usage counts |

### Wing enum

```sql
CREATE TYPE wing AS ENUM ('atfal_sughir', 'atfal_kabir', 'khuddam');
```

### Migrations

```bash
# Push current schema to database (development — applies changes directly)
pnpm --filter @workspace/db run push

# Force push (skips confirmation prompts — use with caution)
pnpm --filter @workspace/db run push-force
```

> For production, generate SQL migration files with `drizzle-kit generate` and apply them with `drizzle-kit migrate` instead of using `push`.

---

## API Reference

Base URL: `/api`

All requests and responses use JSON. The full spec is at `lib/api-spec/openapi.yaml`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Returns server health status |

### Members

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/members` | List members (supports filters: `wing`, `sector`, `region`, `zone`, `circuit`, `jamaat`, `search`) |
| `POST` | `/api/members` | Create a new member |
| `GET` | `/api/members/:id` | Get a single member |
| `PATCH` | `/api/members/:id` | Update a member |
| `DELETE` | `/api/members/:id` | Delete a member |
| `GET` | `/api/members/:id/history` | Get audit history for a member |

### Locations

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/locations/circuits` | List all circuits |
| `GET` | `/api/locations/jamaats` | List all jama'ats |

### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | National totals (members by wing, new this month, graduations this month) |
| `GET` | `/api/analytics/by-sector` | Member counts broken down by sector |

### Graduations

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/graduations/upcoming` | Members approaching their next wing transition |

---

## Wing Assignment Logic

Wing is **computed automatically** from date of birth and is never set manually:

| Age | Wing |
|---|---|
| 0 – 11 | `atfal_sughir` |
| 12 – 14 | `atfal_kabir` |
| 15+ | `khuddam` |

When a member's computed wing differs from the stored wing (detected on read or via a scheduled check), a graduation record is created and the member history is updated.

---

## Deployment

The project is configured for deployment on **Replit Autoscale**.

### Environment

Set the `DATABASE_URL` secret in your deployment environment pointing to a production PostgreSQL instance (e.g. Neon, Railway, Supabase).

### Build

```bash
pnpm run build
```

The frontend builds to `artifacts/atfal-ghana/dist/public/`. The API server bundles to `artifacts/api-server/dist/index.mjs` via esbuild.

### Production start

```bash
# API server
PORT=3000 node --enable-source-maps artifacts/api-server/dist/index.mjs

# Frontend (serve the built static files, or use a CDN)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/atfal-ghana run serve
```

### Post-merge / post-deploy hook

`scripts/post-merge.sh` runs automatically after branch merges and on deployment. It:

1. Installs dependencies (`pnpm install --frozen-lockfile`)
2. Pushes any schema changes (`pnpm --filter db push`)

---

## Scripts

| Command | Description |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm run typecheck` | Type-check all packages |
| `pnpm --filter @workspace/db run push` | Apply schema to database |
| `pnpm --filter @workspace/api-server run dev` | Start API server in dev mode |
| `pnpm --filter @workspace/atfal-ghana run dev` | Start frontend in dev mode |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API client + validators |

---

## Notes for Contributors

- **`pnpm` only** — the workspace is locked to pnpm. Running `npm install` or `yarn` will fail by design (see `preinstall` in `package.json`).
- **OpenAPI first** — all API changes should start in `lib/api-spec/openapi.yaml`, followed by running codegen. Do not hand-edit files in `lib/api-zod/src/` or `lib/api-client-react/src/`.
- **Supply-chain safety** — `pnpm-workspace.yaml` enforces a `minimumReleaseAge` of 1440 minutes (24 hours) for all packages. Do not disable this.
- **esbuild version is pinned** to `0.27.3` — this is intentional. Do not upgrade without verifying the override in `pnpm-workspace.yaml`.
