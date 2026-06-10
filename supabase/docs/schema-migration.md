# Database Schema Migration

This document shows the complete SQL schema that replicates the Drizzle ORM schema in native Supabase PostgreSQL migrations, including indexes, foreign keys, and Row Level Security policies.

---

## Migration file location

All SQL migrations go in `supabase/migrations/`. Filenames must follow the pattern `YYYYMMDDHHMMSS_description.sql`. Supabase applies them in order.

The main schema migration is at:
```
supabase/migrations/0000_initial_schema.sql
```

---

## Complete schema SQL

```sql
-- =============================================================================
-- 0000_initial_schema.sql
-- Complete schema for Majlis Atfal-ul-Ahmadiyya Ghana Management System
-- =============================================================================

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE wing AS ENUM ('atfal_sughir', 'atfal_kabir', 'khuddam');

-- ─── Members ─────────────────────────────────────────────────────────────────

CREATE TABLE members (
  id            SERIAL PRIMARY KEY,
  first_name    TEXT NOT NULL,
  middle_name   TEXT,
  last_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  wing          wing NOT NULL,
  sector        TEXT NOT NULL,
  region        TEXT NOT NULL,
  zone          TEXT NOT NULL,
  circuit       TEXT NOT NULL,
  jamaat        TEXT NOT NULL,
  photo_url     TEXT,
  guardian_name    TEXT,
  guardian_type    TEXT,
  guardian_phone   TEXT,
  guardian_email   TEXT,
  guardian_address TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for filter and search columns
CREATE INDEX members_last_name_idx  ON members (last_name);
CREATE INDEX members_first_name_idx ON members (first_name);
CREATE INDEX members_wing_idx       ON members (wing);
CREATE INDEX members_sector_idx     ON members (sector);
CREATE INDEX members_region_idx     ON members (region);
CREATE INDEX members_zone_idx       ON members (zone);
CREATE INDEX members_circuit_idx    ON members (circuit);
CREATE INDEX members_jamaat_idx     ON members (jamaat);
CREATE INDEX members_dob_idx        ON members (date_of_birth);
CREATE INDEX members_created_at_idx ON members (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Member History ───────────────────────────────────────────────────────────

CREATE TABLE member_history (
  id             SERIAL PRIMARY KEY,
  member_id      INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL,
  description    TEXT NOT NULL,
  previous_value TEXT,
  new_value      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX member_history_member_id_idx ON member_history (member_id);

-- ─── Graduations ─────────────────────────────────────────────────────────────

CREATE TABLE graduations (
  id            SERIAL PRIMARY KEY,
  member_id     INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  previous_wing TEXT NOT NULL,
  new_wing      TEXT NOT NULL,
  graduated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX graduations_member_id_idx   ON graduations (member_id);
CREATE INDEX graduations_graduated_at_idx ON graduations (graduated_at DESC);

-- ─── Circuits ────────────────────────────────────────────────────────────────

CREATE TABLE circuits (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  zone        TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Jama'ats ────────────────────────────────────────────────────────────────

CREATE TABLE jamaats (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  circuit     TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Row Level Security (RLS)

Once you add Supabase Auth (see [auth-setup.md](./auth-setup.md)), enable RLS on all tables so only authenticated users can access data:

```sql
-- Enable RLS on all tables
ALTER TABLE members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE jamaats        ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read all data
CREATE POLICY "authenticated_read_members"
  ON members FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_history"
  ON member_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_graduations"
  ON graduations FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_circuits"
  ON circuits FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_jamaats"
  ON jamaats FOR SELECT TO authenticated USING (true);

-- Allow any authenticated user to write (tighten with roles as needed)
CREATE POLICY "authenticated_write_members"
  ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_write_history"
  ON member_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_write_graduations"
  ON graduations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_write_circuits"
  ON circuits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_write_jamaats"
  ON jamaats FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## Applying migrations

```bash
# Local — apply all pending migrations
supabase db push

# Production — apply via Supabase dashboard or:
supabase db push --db-url "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

---

## Migrating existing data from Replit

If you have data in the Replit PostgreSQL that you want to bring over:

```bash
# 1. Dump from Replit Postgres
pg_dump "$DATABASE_URL" \
  --data-only \
  --no-owner \
  --no-acl \
  -t members \
  -t member_history \
  -t graduations \
  -t circuits \
  -t jamaats \
  > replit_data.sql

# 2. Load into Supabase Postgres
psql "postgresql://postgres:postgres@localhost:54322/postgres" < replit_data.sql
```

For production, use the Supabase project's direct DB connection string instead of the local one.
