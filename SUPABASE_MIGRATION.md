# Supabase Migration Summary

**Date:** June 11, 2026  
**Migration:** Replit → Supabase + Docker Local Development

---

## Overview

The Majlis Atfal Ghana Management System has been configured to use **Supabase** for database and authentication, replacing the previous Replit-based setup. This document summarizes all changes made.

---

## Changes Made ✅

### 1. Environment Configuration

| File | Change |
|---|---|
| [.env.example](.env.example) | Updated with complete Supabase variables; removed Replit references |
| [.env.local](.env.local) | Created with local development defaults (Supabase on localhost) |
| [backend/src/lib/env.ts](backend/src/lib/env.ts) | Added Supabase env vars (URL, keys, storage bucket) |

**Key Variables Added:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key (safe in frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Secret key (backend only)
- `STORAGE_BUCKET`: Supabase Storage bucket name
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Frontend Supabase config

### 2. Supabase Initialization

| Action | Details |
|---|---|
| **Installed CLI** | `npm install -g supabase` |
| **Created config** | `supabase/config.toml` with local development defaults |
| **Created schema migration** | `supabase/migrations/20250611000000_initial_schema.sql` |

**Schema Includes:**
- `members` table with 10 performance indexes
- `member_history` audit trail
- `graduations` tracking
- `circuits` and `jamaats` lookup tables
- Triggers for `updated_at` timestamps
- ENUM type for wings (atfal_sughir, atfal_kabir, khuddam)

### 3. Frontend Updates

| File | Change |
|---|---|
| [frontend/vite.config.ts](frontend/vite.config.ts) | Removed Replit-specific plugins; made PORT/BASE_PATH optional with defaults |

**Removed:**
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer` (conditionally loaded)
- `@replit/vite-plugin-dev-banner` (conditionally loaded)

**Conditional logic** removed (REPL_ID checks no longer needed)

### 4. Backend Updates

**No code changes required** in route handlers — Drizzle ORM continues to work with Supabase PostgreSQL.

Configuration only:
- Updated `src/lib/env.ts` to accept Supabase credentials
- Ready for optional migration to Supabase client later

### 5. Documentation

| File | Purpose |
|---|---|
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Step-by-step local and production setup guide |
| [supabase/docs/local-setup.md](supabase/docs/local-setup.md) | Docker + CLI instructions |
| [supabase/docs/environment-variables.md](supabase/docs/environment-variables.md) | Complete env var reference |
| [supabase/docs/backend-migration.md](supabase/docs/backend-migration.md) | Backend adapter options (Drizzle vs Supabase client) |
| [supabase/docs/auth-setup.md](supabase/docs/auth-setup.md) | Add Supabase Auth to app |
| [supabase/docs/hosting.md](supabase/docs/hosting.md) | Production deployment (Vercel + Railway) |

---

## What Still Uses Replit Files

**Files kept for reference (can be deleted if not needed):**
- `.replit` — Replit workflow configuration (obsolete for Supabase setup)

These won't interfere with Supabase development.

---

## Next Steps

### Immediate (Required)

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Must be running before `supabase start`

2. **Start Supabase Stack**
   ```bash
   cd Majlis-Atfal-ul-Ahmadiyya-Ghana-Management-System
   supabase start
   ```
   Takes 2-3 minutes on first run (pulls Docker images)

3. **Apply Database Schema**
   ```bash
   supabase db push
   ```

4. **Update `.env.local` with Real Credentials**
   - Copy anon/service role keys from `supabase start` output
   - Update `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   pnpm -C backend run dev
   
   # Terminal 2: Frontend
   pnpm -C frontend run dev
   ```

### Later (For Supabase Features)

- [ ] Implement Supabase Auth (email/magic link) — see [auth-setup.md](supabase/docs/auth-setup.md)
- [ ] Configure Supabase Storage for member photos — see [storage-setup.md](supabase/docs/storage-setup.md)
- [ ] Add Row Level Security (RLS) policies for data access control
- [ ] Set up Supabase Realtime for live updates (optional)

### For Production Deployment

- [ ] Create Supabase project at https://supabase.com
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway / Render / Fly.io
- [ ] Configure production environment variables
- See [hosting.md](supabase/docs/hosting.md) for full details

---

## Local Development Ports

After `supabase start`, services run on:

| Service | Port | URL |
|---|---|---|
| PostgreSQL | 54322 | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Supabase API | 54321 | `http://localhost:54321` |
| Supabase Studio (Dashboard) | 54323 | `http://localhost:54323` |
| Express Backend | 3000 | `http://localhost:3000` |
| React Frontend (Vite) | 5000 | `http://localhost:5000` |

---

## Environment Variable Mapping

### Replit → Supabase (Local)

| Purpose | Old (Replit) | New (Supabase Local) |
|---|---|---|
| Database | Replit-hosted URL | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Auth | Mock/placeholder | Supabase Auth on port 54321 |
| Storage | `/uploads` folder | Supabase Storage bucket |
| API | Replit Express | Express on localhost:3000 |
| Frontend | Replit Vite | Vite on localhost:5000 |

### Replit → Supabase (Production)

| Purpose | Old (Replit) | New (Production) |
|---|---|---|
| Database | Replit PostgreSQL | Supabase pooler (AWS, port 6543) |
| Auth | Placeholder | Supabase Auth (cloud) |
| Storage | File system | Supabase Storage (S3-compatible) |
| API | Replit | Railway / Render / Fly.io |
| Frontend | Replit | Vercel / Netlify |

---

## Verification Checklist

- ✅ Supabase CLI installed (`supabase --version`)
- ✅ Project initialized (`supabase/config.toml` exists)
- ✅ Schema migration created (`supabase/migrations/20250611000000_initial_schema.sql`)
- ✅ Backend env vars updated (`backend/src/lib/env.ts`)
- ✅ Frontend vite config cleaned up (Replit plugins removed)
- ✅ `.env.example` updated with Supabase defaults
- ✅ `.env.local` created with local development values
- ⏳ Docker Desktop installed (user action required)
- ⏳ `supabase start` executed (user action required)
- ⏳ `supabase db push` applied (user action required)
- ⏳ `.env.local` updated with real credentials (user action required)

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Local Development:** https://supabase.com/docs/guides/local-development
- **CLI Reference:** https://supabase.com/docs/reference/cli/introduction
- **Docker Setup:** https://docs.docker.com/desktop
- **Project Docs:** [supabase/docs/](supabase/docs/)

---

## Questions?

Refer to:
1. [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — Quick start guide
2. [supabase/docs/](supabase/docs/) — Detailed technical docs
3. Supabase CLI help: `supabase --help`
