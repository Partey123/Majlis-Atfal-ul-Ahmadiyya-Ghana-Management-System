# Local Development Setup with Supabase

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 24 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 10 | `npm i -g pnpm` |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop) — required for local Supabase |
| Supabase CLI | Latest | `npm i -g supabase` |

> Supabase CLI uses Docker to run a local Postgres, Auth, Storage, and API stack. Docker must be running before you start.

---

## Step 1 — Clone and install

```bash
git clone https://github.com/your-org/atfal-ghana.git
cd atfal-ghana
pnpm install
```

---

## Step 2 — Initialise Supabase (first time only)

```bash
supabase init
```

This creates a `supabase/` directory with `config.toml`. If the directory already exists (it does in this repo), skip this step.

---

## Step 3 — Start the local Supabase stack

```bash
supabase start
```

This pulls and starts Docker containers for:
- **Postgres** on `localhost:54322`
- **Supabase Studio** (local dashboard) at `http://localhost:54323`
- **Auth server** on `localhost:54321`
- **Storage** on `localhost:54321/storage/v1`
- **REST API** (PostgREST) on `localhost:54321/rest/v1`

After startup, the CLI prints your local credentials:

```
API URL: http://localhost:54321
DB URL:  postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJ...
service_role key: eyJ...
```

Save these — you'll need them in Step 5.

---

## Step 4 — Apply the database schema

```bash
supabase db push
```

Or if you want to apply each migration file individually:

```bash
supabase migration up
```

Migration files live in `supabase/migrations/`. See [schema-migration.md](./schema-migration.md) for the complete schema.

---

## Step 5 — Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in the values from the `supabase start` output:

```env
# Database (Supabase local Postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>

# Server
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5000

# Storage
STORAGE_BUCKET=member-photos
```

See [environment-variables.md](./environment-variables.md) for the full reference.

---

## Step 6 — Start the application

In two separate terminals:

```bash
# Terminal 1 — API server
PORT=3000 ALLOWED_ORIGIN=http://localhost:5000 pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/atfal-ghana run dev
```

Open [http://localhost:5000](http://localhost:5000).

---

## Step 7 — Open Supabase Studio

Visit [http://localhost:54323](http://localhost:54323) to use the local Supabase dashboard — inspect tables, run SQL, manage auth users, view storage buckets.

---

## Stopping the local stack

```bash
supabase stop
```

Data is preserved between stops. To reset all data:

```bash
supabase db reset
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot connect to Docker` | Make sure Docker Desktop is running |
| Port conflicts | Change ports in `supabase/config.toml` |
| `supabase start` hangs | Run `docker system prune` then retry |
| DB schema out of sync | Run `supabase db reset` to reapply all migrations |
