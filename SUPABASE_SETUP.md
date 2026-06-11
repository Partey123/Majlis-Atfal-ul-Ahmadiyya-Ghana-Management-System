# Supabase Configuration Setup Guide

This document explains the steps needed to complete the migration from Replit to Supabase for the Majlis Atfal Ghana Management System.

## What Has Been Done ✓

- ✅ Installed Supabase CLI globally
- ✅ Initialized Supabase project (`supabase/config.toml` created)
- ✅ Created initial database schema migration (`supabase/migrations/20250611000000_initial_schema.sql`)
- ✅ Updated backend environment variables in `src/lib/env.ts` to support Supabase
- ✅ Updated `.env.example` with complete Supabase configuration
- ✅ Created `.env.local` with local development values
- ✅ Installed all npm dependencies (514 packages across workspace)

## What You Need to Do Next

### Step 1: Install Docker Desktop

**Why?** Supabase CLI uses Docker to run a local Postgres, Auth, Storage, and API stack.

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop) for Windows
2. Install and start Docker Desktop
3. Ensure Docker is running (you'll see the Docker icon in the system tray)

### Step 2: Start Local Supabase

Once Docker is running, open a terminal in the project root and run:

```bash
supabase start
```

This will:
- Pull Docker containers (first time takes ~2-3 minutes)
- Start PostgreSQL on `localhost:54322`
- Start Supabase Auth server on `localhost:54321`
- Start Supabase Storage on `localhost:54321/storage/v1`
- Start Supabase Studio (dashboard) on `http://localhost:54323`

### Step 3: Apply Database Migrations

Once `supabase start` completes and prints credentials, apply the schema:

```bash
supabase db push
```

This creates all tables (members, graduations, circuits, jamaats, member_history) with indexes and triggers.

### Step 4: Copy Credentials to `.env.local`

After `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJ...
service_role key: eyJ...
```

Replace the placeholder keys in `.env.local`:
- Copy the **anon key** → `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`
- Copy the **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
- Update `DATABASE_URL` if different

### Step 5: Start Development Servers

In separate terminals, run:

**Backend:**
```bash
pnpm -C backend run dev
```
Listens on `http://localhost:3000`

**Frontend:**
```bash
pnpm -C frontend run dev
```
Listens on `http://localhost:5000`

### Step 6: Access Supabase Studio (Optional)

Open [http://localhost:54323](http://localhost:54323) to view:
- Database tables and data
- Authentication users
- Storage buckets
- API documentation

## Production Deployment

For production, see [supabase/docs/hosting.md](./supabase/docs/hosting.md) which covers:
- Creating a Supabase project at [supabase.com](https://supabase.com)
- Deploying frontend to Vercel
- Deploying backend to Railway / Render / Fly.io
- Setting production environment variables

## Key Environment Variables Explained

| Variable | Local Value | Production |
|---|---|---|
| `DATABASE_URL` | PostgreSQL on localhost:54322 | Supabase pooler URL |
| `SUPABASE_URL` | `http://localhost:54321` | `https://[project].supabase.co` |
| `SUPABASE_ANON_KEY` | Local Supabase anon key | Public project key |
| `SUPABASE_SERVICE_ROLE_KEY` | Local service role key | Secret - backend only |
| `ALLOWED_ORIGIN` | `http://localhost:5000` | Your production domain |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Your API domain |

## What Changed from Replit

| Before (Replit) | After (Supabase) |
|---|---|
| Replit-hosted PostgreSQL | Supabase PostgreSQL (local or cloud) |
| No auth system | Supabase Auth (email, magic links, JWT) |
| File uploads to `/uploads` folder | Supabase Storage buckets |
| Express on Replit | Express on Railway/Render/Fly.io |
| Replit secrets manager | `.env` files + hosting provider secrets |

## Backend Changes (Option A: Database URL Only)

The Express API requires **no code changes**. Just point `DATABASE_URL` to Supabase Postgres:

```typescript
// No changes needed in routes
// Drizzle ORM handles PostgreSQL features
```

If you want Supabase Auth with RLS policies later, see [supabase/docs/backend-migration.md](./supabase/docs/backend-migration.md) for Option B (Supabase client integration).

## Frontend Changes Needed

Update the `AuthContext.tsx` and API client to use Supabase Auth once configured:

1. Replace mock login with Supabase Auth
2. Use `@supabase/auth-helpers-react` for hooks
3. Store JWT tokens and pass to API requests

Details are in [supabase/docs/auth-setup.md](./supabase/docs/auth-setup.md).

## Troubleshooting

**Docker not found:**
- Ensure Docker Desktop is installed and running
- On Windows, you may need to restart after installation

**Migrations fail:**
- Check `supabase logs` for errors
- Ensure PostgreSQL container is healthy: `supabase status`

**Can't connect to database:**
- Verify port 54322 is available
- Check `supabase status` output

**Supabase keys not working:**
- Copy exact values from `supabase start` output
- Keys are base64-encoded JWTs; ensure no extra whitespace

## Next Steps

1. ✅ Install Docker Desktop
2. ✅ Run `supabase start`
3. ✅ Run `supabase db push`
4. ✅ Update `.env.local` with real credentials
5. ✅ Run `pnpm -C backend run dev` and `pnpm -C frontend run dev`
6. ✅ Test the application
7. ✅ Read [supabase/docs/auth-setup.md](./supabase/docs/auth-setup.md) for auth implementation
8. ✅ Deploy to production when ready

---

For detailed documentation, see the [supabase/docs/](./supabase/docs/) folder.
