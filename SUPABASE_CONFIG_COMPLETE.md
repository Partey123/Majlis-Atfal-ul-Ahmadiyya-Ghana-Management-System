# Supabase Configuration - Complete

**Status:** ✅ Configured and Ready for Local Development

This document provides a complete overview of the Supabase configuration for the Majlis Atfal Ghana Management System.

---

## What Has Been Completed

### 1. ✅ Supabase CLI Installation & Initialization
- Installed Supabase CLI globally
- Initialized project with `supabase init`
- Created `supabase/config.toml` with local development settings

### 2. ✅ Database Schema & Migrations
- Created initial schema migration: `supabase/migrations/20250611000000_initial_schema.sql`
- Includes all tables: members, graduations, circuits, jamaats, member_history
- Includes performance indexes and auto-update triggers
- Ready to apply with `supabase db push`

### 3. ✅ Environment Configuration
- Updated `backend/src/lib/env.ts` with Supabase support
- Created `.env.local` for local development
- Updated `.env.example` with Supabase defaults
- Added frontend Supabase configuration variables

### 4. ✅ Frontend Updates
- Simplified `frontend/vite.config.ts`
- Removed Replit-specific plugin logic
- Made PORT and BASE_PATH configurable with sensible defaults
- Ready for Supabase Auth integration

### 5. ✅ Backend Ready
- No route code changes needed
- Drizzle ORM works with Supabase PostgreSQL
- Optional migration to Supabase client later for RLS/realtime

### 6. ✅ Dependencies
- All 514 npm packages installed
- TypeScript compiles without errors
- Both backend and frontend pass typecheck

---

## Quick Start Guide

### Prerequisites
1. **Docker Desktop** — https://www.docker.com/products/docker-desktop
   - Must be installed and running on your machine
   - Required for local Supabase stack

### Step-by-Step Setup

#### 1. Start Supabase
```bash
cd Majlis-Atfal-ul-Ahmadiyya-Ghana-Management-System
supabase start
```

**First run takes 2-3 minutes** (pulls Docker images). You'll see:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJ...
service_role key: eyJ...
```

#### 2. Apply Database Migrations
```bash
supabase db push
```

Creates all tables and indexes in the local PostgreSQL.

#### 3. Update Credentials in `.env.local`
Copy the keys from step 1 into `.env.local`:
```env
SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key>
VITE_SUPABASE_ANON_KEY=<paste anon key>
```

#### 4. Start Development Servers
**Terminal 1 — Backend:**
```bash
pnpm -C backend run dev
```
Runs on `http://localhost:3000`

**Terminal 2 — Frontend:**
```bash
pnpm -C frontend run dev
```
Runs on `http://localhost:5000`

#### 5. Visit Application
- Open http://localhost:5000
- Login with admin credentials (see `.env.local`)
  - Username: `admin`
  - Password: `admin123`

---

## Local Supabase Services

Once `supabase start` is running:

| Service | URL | Purpose |
|---|---|---|
| **PostgreSQL** | localhost:54322 | Main database |
| **Supabase API** | http://localhost:54321 | Auth, Storage, REST API |
| **Supabase Studio** | http://localhost:54323 | Web dashboard |
| **Express Backend** | http://localhost:3000 | API server |
| **React Frontend** | http://localhost:5000 | Web application |

### Access Supabase Studio
Open http://localhost:54323 to:
- View database tables and data
- Manage authentication users
- Manage storage buckets
- View API documentation

---

## Environment Variables

### Required for Development
```env
# Database (auto-filled by supabase start)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# API Server
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5000

# Supabase (from supabase start output)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from output>
SUPABASE_SERVICE_ROLE_KEY=<from output>

# Frontend
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<from output>
VITE_API_BASE_URL=http://localhost:3000
```

### Optional
```env
STORAGE_BUCKET=member-photos        # Default: member-photos
LOG_LEVEL=info                      # Default: info
JWT_SECRET=dev-only-secret          # Will be replaced by Supabase Auth
```

---

## Current Authentication (Temporary)

The app currently uses **mock JWT authentication** that will be replaced with **Supabase Auth**.

**Current login:**
- Username: `admin`
- Password: `admin123`

**How it works:**
1. Backend (`auth.ts`) validates credentials against env vars
2. Issues JWT token (24-hour expiry)
3. Frontend stores in localStorage
4. All requests include JWT in Authorization header

**Transition to Supabase Auth:**
- See [supabase/docs/auth-setup.md](supabase/docs/auth-setup.md)
- No database changes needed
- Routes will use Supabase Auth tokens instead

---

## Database Schema

Created tables:

### members
```sql
id, first_name, middle_name, last_name, date_of_birth, wing,
sector, region, zone, circuit, jamaat,
photo_url, guardian_name, guardian_type, guardian_phone, guardian_email, guardian_address,
created_at, updated_at
```
**Indexes:** name, wing, location hierarchy, date_of_birth, created_at

### graduations
Tracks when members age into the next wing
```sql
id, member_id, previous_wing, new_wing, graduated_at
```

### member_history
Audit trail of all member changes
```sql
id, member_id, event_type, description, previous_value, new_value, created_at
```

### circuits & jamaats
Lookup tables for location hierarchy
```sql
id, name, zone, circuit, usage_count, created_at
```

---

## File Structure

```
project-root/
├── .env.example                 # Template (committed to git)
├── .env.local                   # Local secrets (git-ignored) ← EDIT THIS
├── SUPABASE_SETUP.md           # Setup instructions
├── SUPABASE_MIGRATION.md       # What changed from Replit
├── supabase/
│   ├── config.toml             # Supabase CLI configuration
│   ├── migrations/
│   │   ├── 0001_remove_position.sql     # Legacy
│   │   └── 20250611000000_initial_schema.sql  # Current schema
│   └── docs/
│       ├── README.md           # Migration guide index
│       ├── local-setup.md      # Docker + CLI
│       ├── environment-variables.md
│       ├── backend-migration.md
│       ├── auth-setup.md       # Supabase Auth
│       ├── storage-setup.md    # Photo uploads
│       └── hosting.md          # Production deploy
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── lib/env.ts          # ← UPDATED: Now supports Supabase
│   │   ├── routes/auth.ts      # JWT auth (temporary)
│   │   ├── routes/members.ts
│   │   ├── routes/analytics.ts
│   │   └── ...
│   └── tsconfig.json
├── frontend/
│   ├── package.json
│   ├── vite.config.ts          # ← UPDATED: Replit plugins removed
│   ├── src/
│   │   ├── App.tsx
│   │   ├── context/AuthContext.tsx
│   │   ├── pages/
│   │   └── ...
│   └── tsconfig.json
└── lib/
    ├── db/                     # Drizzle ORM
    ├── api-spec/               # OpenAPI schema
    └── ...
```

---

## Troubleshooting

### Docker Desktop Not Running
```
Error: Docker daemon not running
Solution: Start Docker Desktop application
```

### Port Already in Use
```
Error: Address already in use :::3000
Solution: Kill process on port 3000 or use different PORT
  lsof -ti:3000 | xargs kill -9  (Mac/Linux)
  netstat -ano | findstr :3000   (Windows)
```

### Database Connection Failed
```
Error: Can't connect to localhost:54322
Solution: Run `supabase status` to check if services are healthy
```

### Can't Find Credentials
```
Error: SUPABASE_ANON_KEY not set
Solution: Run `supabase start` again and copy the output keys into .env.local
```

### TypeScript Compilation Error
```
Error: Property 'X' does not exist on type '{ ... }'
Solution: Ensure .env.local exists and run `pnpm install` again
```

---

## Next: Supabase Auth Integration

Once local development works, implement Supabase Auth:

1. Read [supabase/docs/auth-setup.md](supabase/docs/auth-setup.md)
2. Enable Auth in Supabase Studio
3. Update frontend `AuthContext.tsx`
4. Replace JWT login with Supabase Auth (email/magic link)
5. Add RLS policies for data access control

---

## Production Deployment

When ready for production:

1. Create Supabase project at https://supabase.com
2. Get production credentials from dashboard
3. Deploy frontend to Vercel: `vercel deploy`
4. Deploy backend to Railway/Render/Fly.io
5. Update environment variables with production values
6. See [supabase/docs/hosting.md](supabase/docs/hosting.md) for details

---

## Useful Commands

```bash
# View Supabase status
supabase status

# View logs
supabase logs

# Reset local database (WARNING: deletes all data)
supabase db reset

# Stop services
supabase stop

# Remove local Docker containers
supabase stop --remove-docker

# Generate types from schema
supabase gen types typescript --local > src/types/database.ts

# Apply migrations
supabase db push
supabase db pull
```

---

## Documentation Reference

- **Supabase Docs:** https://supabase.com/docs
- **CLI Reference:** https://supabase.com/docs/reference/cli
- **Docker Desktop:** https://docs.docker.com/desktop
- **Project Docs:** [supabase/docs/](supabase/docs/)

---

## Support

For issues or questions:

1. Check [supabase/docs/](supabase/docs/) for detailed guides
2. Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for step-by-step instructions
3. Check Supabase documentation: https://supabase.com/docs
4. Run `supabase --help` for CLI reference

---

**Last Updated:** June 11, 2026  
**Status:** ✅ Ready for Local Development
