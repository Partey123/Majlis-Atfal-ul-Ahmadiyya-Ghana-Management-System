# Backend Migration Guide

The Express API currently uses Drizzle ORM with a raw PostgreSQL connection. When moving to Supabase, you have two options:

| Option | Description | Best for |
|---|---|---|
| **A — Keep Drizzle, change DB URL** | Just point `DATABASE_URL` at Supabase Postgres | Minimal code change, keep existing architecture |
| **B — Replace Drizzle with Supabase client** | Use `@supabase/supabase-js` for all queries | Full Supabase integration (RLS, realtime, etc.) |

**Recommendation:** Start with Option A. It requires zero code changes to routes. Move to Option B later if you need Supabase-specific features like realtime subscriptions or fine-grained RLS.

---

## Option A — Swap the database URL only

This is the easiest path. The entire Express API works without modification.

### 1. Get your Supabase connection string

In Supabase Dashboard:
- Go to **Settings → Database**
- Under **Connection string**, copy the **URI** format
- Replace `[YOUR-PASSWORD]` with your database password

The URL looks like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> Use the **Session mode pooler** URL (port `6543`) for long-lived connections like Express. Use the **Transaction mode pooler** (port `5432`) only for serverless/edge functions.

### 2. Update your environment variable

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 3. Push the schema

```bash
pnpm --filter @workspace/db run push
```

That's it. All routes continue to work exactly as before.

---

## Option B — Migrate routes to Supabase client

Use this if you want RLS enforcement at the database level or Supabase Realtime.

### Install the client

```bash
pnpm --filter @workspace/api-server add @supabase/supabase-js
```

### Create the admin client

```typescript
// artifacts/api-server/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service role client — bypasses RLS (for admin API)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Authenticated client factory — respects RLS (for user-scoped queries)
export function supabaseForUser(accessToken: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

### Example: migrate a members route

**Before (Drizzle):**

```typescript
router.get("/members", async (req, res) => {
  const members = await db.select().from(membersTable).limit(50);
  res.json({ data: members });
});
```

**After (Supabase client):**

```typescript
router.get("/members", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("*")
    .limit(50);

  if (error) {
    res.status(500).json({ status: "error", message: error.message });
    return;
  }

  res.json({ data });
});
```

### Column name difference

Drizzle maps camelCase to snake_case automatically. The Supabase JS client returns raw snake_case column names. You'll need to either:
- Accept snake_case in the frontend and update types, **or**
- Add a mapping layer in each route, **or**
- Use a Postgres view that renames columns to camelCase

```sql
-- Option: create camelCase views
CREATE VIEW members_view AS
SELECT
  id,
  first_name   AS "firstName",
  last_name    AS "lastName",
  date_of_birth AS "dateOfBirth",
  -- ... etc
FROM members;
```

---

## Adding new environment variables to `lib/env.ts`

When switching to Supabase client, add these to the env schema:

```typescript
// lib/env.ts — add to EnvSchema
const EnvSchema = z.object({
  // ... existing fields ...
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().default("member-photos"),
});
```

---

## Keeping Drizzle for migrations only

The cleanest pattern: use Drizzle ORM (with its schema and `drizzle-kit`) only for schema management and migrations, while using the Supabase JS client for runtime queries. This gives you the best of both — type-safe schema definitions and Supabase's client features.

```
lib/db/               ← Drizzle schema (types + migrations only)
artifacts/api-server/ ← Supabase JS client (runtime queries)
```
