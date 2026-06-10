# Supabase Migration Guide

This folder contains everything you need to move the Majlis Atfal Ghana Management System from its current Replit/PostgreSQL stack to a fully Supabase-hosted setup — covering local development, database migration, auth, file storage, and production deployment.

## What Supabase replaces

| Current (Replit) | Supabase equivalent |
|---|---|
| Replit-provisioned PostgreSQL | Supabase Postgres |
| No auth (placeholder) | Supabase Auth (email/password + magic link) |
| Local file uploads (`/uploads`) | Supabase Storage |
| Express API on Replit | Express on Railway / Render / Fly.io (or Supabase Edge Functions) |
| Replit env secrets | Supabase project secrets + hosting env vars |

## Documentation index

| File | What it covers |
|---|---|
| [local-setup.md](./local-setup.md) | Install Supabase CLI, run the stack locally |
| [schema-migration.md](./schema-migration.md) | Port the Drizzle schema into Supabase SQL migrations |
| [auth-setup.md](./auth-setup.md) | Replace mock auth with Supabase Auth (RLS + JWT) |
| [storage-setup.md](./storage-setup.md) | Set up Supabase Storage for member photos |
| [backend-migration.md](./backend-migration.md) | Adapt the Express API to use the Supabase client |
| [hosting.md](./hosting.md) | Deploy frontend (Vercel) + backend (Railway) to production |
| [environment-variables.md](./environment-variables.md) | Full list of every env var needed |

## Quick-start checklist

- [ ] Install Supabase CLI (`npm i -g supabase`)
- [ ] `supabase init` in the project root
- [ ] `supabase start` to spin up local Supabase stack
- [ ] Apply schema migrations (`supabase db push`)
- [ ] Copy `.env.example` → `.env.local` and fill values
- [ ] Verify the API connects to the local Supabase Postgres
- [ ] Set up Supabase Auth policies
- [ ] Set up Supabase Storage bucket
- [ ] Deploy to production (see [hosting.md](./hosting.md))
