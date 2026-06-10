# Hosting & Deployment Guide

This guide covers deploying the full stack to production using:
- **Frontend** → [Vercel](https://vercel.com) (or Netlify)
- **Backend API** → [Railway](https://railway.app) (or Render / Fly.io)
- **Database + Auth + Storage** → [Supabase](https://supabase.com)

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Production                           │
│                                                             │
│  ┌───────────────┐     ┌───────────────┐                   │
│  │   Vercel      │────▶│   Railway     │                   │
│  │  (Frontend)   │     │  (Express API)│                   │
│  │  atfal.gh     │     │  api.atfal.gh │                   │
│  └───────────────┘     └──────┬────────┘                   │
│                               │                             │
│                        ┌──────▼────────────────────────┐   │
│                        │         Supabase               │   │
│                        │  • PostgreSQL (members, etc.)  │   │
│                        │  • Auth (JWT tokens)           │   │
│                        │  • Storage (member photos)     │   │
│                        └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose your organisation, name the project `atfal-ghana`
3. Select a region close to Ghana (e.g., **Europe West** or **US East**)
4. Set a strong database password — save it somewhere secure
5. Wait ~2 minutes for the project to provision

After creation, collect from **Settings → API**:
- `Project URL` → your `SUPABASE_URL`
- `anon` public key → your `SUPABASE_ANON_KEY`
- `service_role` secret key → your `SUPABASE_SERVICE_ROLE_KEY`

And from **Settings → Database → Connection string (URI)**:
- Your `DATABASE_URL` (use Session mode pooler, port 6543)

---

## Step 2 — Apply the database schema

```bash
# Point at production Supabase
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

# Push schema (applies all Drizzle migrations)
pnpm --filter @workspace/db run push

# Or use Supabase CLI migrations
supabase db push --db-url "$DATABASE_URL"
```

---

## Step 3 — Deploy the API server to Railway

### Option A — Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init          # link to a new Railway project
railway up            # deploy from current directory
```

### Option B — GitHub integration

1. Push your code to GitHub
2. In Railway dashboard → **New Project → Deploy from GitHub repo**
3. Select the repo, set **Root directory** to `artifacts/api-server`
4. Railway auto-detects Node.js

### Build and start commands

| Setting | Value |
|---|---|
| Build command | `pnpm install && pnpm run build` |
| Start command | `node --enable-source-maps dist/index.mjs` |
| Root directory | `artifacts/api-server` |

### Environment variables on Railway

Add these in **Railway → Variables**:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
ALLOWED_ORIGIN=https://your-frontend.vercel.app
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
STORAGE_BUCKET=member-photos
LOG_LEVEL=info
```

Railway provides a public URL like `https://atfal-api.up.railway.app`. Set up a custom domain (`api.atfal.gh`) under **Settings → Domains**.

---

## Step 4 — Deploy the frontend to Vercel

### Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --cwd artifacts/atfal-ghana
```

### Via GitHub integration

1. Push to GitHub
2. In Vercel dashboard → **Add New Project → Import Git Repository**
3. Set **Root directory** to `artifacts/atfal-ghana`

### Build settings

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `artifacts/atfal-ghana` |
| Build command | `vite build` |
| Output directory | `dist/public` |
| Install command | `pnpm install` |

### Environment variables on Vercel

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_API_BASE_URL=https://api.atfal.gh
```

### API proxy for production

Update `artifacts/atfal-ghana/vite.config.ts` — the `server.proxy` block only applies in dev. For production, the built frontend needs to know the API URL.

Option: Use a `vercel.json` rewrite rule so `/api/*` still works in production:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.atfal.gh/api/:path*"
    }
  ]
}
```

---

## Step 5 — Custom domain (optional)

### Frontend domain (`atfal.gh` or `www.atfal.gh`)
- In Vercel → **Settings → Domains** → Add `atfal.gh`
- Add the DNS records Vercel provides to your domain registrar

### API domain (`api.atfal.gh`)
- In Railway → **Settings → Domains** → Add `api.atfal.gh`
- Add the CNAME record Railway provides

---

## Step 6 — Post-deploy checklist

- [ ] Health check passes: `curl https://api.atfal.gh/api/healthz`
- [ ] Frontend loads: `https://atfal.gh`
- [ ] Login works (Supabase Auth)
- [ ] Members list loads (DB connection working)
- [ ] Photo upload works (Supabase Storage)
- [ ] Rate limiting active (try 300+ requests in 15 min)
- [ ] CORS: browser can call API from the frontend domain
- [ ] SSL/TLS: both domains show green padlock

---

## Alternative hosting options

| Service | Use for | Notes |
|---|---|---|
| **Netlify** | Frontend | Good alternative to Vercel, similar config |
| **Render** | Backend API | Free tier, auto-deploys from GitHub |
| **Fly.io** | Backend API | Global edge deployment, more config required |
| **Supabase Edge Functions** | Lightweight routes | Deno runtime, replaces Express for simple CRUD |

### Using Supabase Edge Functions instead of Express

For simpler deployments, you can replace the Express API with Supabase Edge Functions (Deno). Each route becomes a function file in `supabase/functions/`. This eliminates the need for a separate API host.

Example:
```
supabase/functions/
  members/index.ts         → GET/POST /functions/v1/members
  members-by-id/index.ts   → GET/PATCH/DELETE /functions/v1/members-by-id
  analytics/index.ts       → GET /functions/v1/analytics
```

Deploy with:
```bash
supabase functions deploy members
supabase functions deploy analytics
```
