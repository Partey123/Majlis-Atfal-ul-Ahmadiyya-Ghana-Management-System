# Quick Start: Supabase Setup & Auth

**Everything is configured. Follow these steps to get up and running.**

---

## Prerequisites

1. **Docker Desktop** — https://www.docker.com/products/docker-desktop
   - Download and install
   - Launch Docker Desktop
   - Wait for it to start (green icon in system tray)

2. **Supabase CLI** — Already installed globally (run `supabase --version`)

---

## Step 1: Start Local Supabase (5 minutes)

Open terminal in project root:

```bash
supabase start
```

**First run:** Pulls Docker images (2-3 minutes)  
**Subsequent runs:** Starts instantly

**You'll see output like:**
```
Started Supabase local development setup.

API URL: http://localhost:54321
DB URL:  postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJ...
service_role key: eyJ...
```

**Save these credentials** — you'll need them in Step 3.

---

## Step 2: Apply Database Schema

```bash
supabase db push
```

Creates all tables, indexes, and RLS policies in local PostgreSQL.

---

## Step 3: Update Environment Variables

Replace placeholder values in `.env.local`:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<paste anon key from Step 1>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key from Step 1>
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<paste anon key from Step 1>
```

---

## Step 4: Start Development Servers

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

---

## Step 5: Test the App

1. Open http://localhost:5000
2. Click "Sign in"
3. Create an account:
   - Email: `test@example.com`
   - Password: `password123`
4. Backend creates user in Supabase Auth
5. Frontend signs you in automatically
6. You see the dashboard ✅

---

## Optional: Access Supabase Studio

Open http://localhost:54323 to see:
- Database tables and data
- Auth users
- Storage buckets
- API docs

---

## Common Issues

### Docker not running
```
Error: Docker daemon not running
→ Start Docker Desktop
```

### Port already in use
```
Error: Address already in use :::3000
→ Kill process: lsof -ti:3000 | xargs kill -9
```

### Can't find credentials
```
Error: SUPABASE_ANON_KEY is required
→ Copy exact values from `supabase start` output
→ Paste into .env.local
```

### Migrations failed
```
Error: Migration failed
→ Run: supabase status
→ Run: supabase logs
```

---

## What Works Now

✅ Email/password authentication  
✅ JWT tokens managed by Supabase  
✅ Row Level Security on all tables  
✅ Automatic session management  
✅ API calls with Bearer token  
✅ Secure user isolation  

---

## Next: Production Deployment

When ready:

1. Create Supabase project at https://supabase.com
2. Get production credentials
3. Deploy backend to Railway/Render/Fly.io
4. Deploy frontend to Vercel
5. Update environment variables

See `SUPABASE_MIGRATION.md` for full production steps.

---

## Files Reference

| File | Purpose |
|---|---|
| [SUPABASE_AUTH_CONFIG.md](SUPABASE_AUTH_CONFIG.md) | Complete auth implementation details |
| [SUPABASE_CONFIG_COMPLETE.md](SUPABASE_CONFIG_COMPLETE.md) | Full Supabase configuration reference |
| [supabase/docs/](supabase/docs/) | Detailed technical documentation |
| [.env.local](.env.local) | Your local environment config (git-ignored) |
| [.env.example](.env.example) | Template for environment variables |

---

## Troubleshooting

**Backend won't start:**
```bash
# Check what's on port 3000
lsof -i :3000

# Check TypeScript errors
pnpm -C backend run typecheck
```

**Frontend won't start:**
```bash
# Check logs
pnpm -C frontend run dev

# Check TypeScript errors
pnpm -C frontend run typecheck
```

**Auth not working:**
```bash
# Check Supabase is running
supabase status

# Check logs
supabase logs --tail

# Verify credentials in .env.local match supabase start output
```

---

## Success Checklist

- [ ] Docker Desktop installed and running
- [ ] `supabase start` completed successfully
- [ ] `supabase db push` created tables
- [ ] `.env.local` updated with real credentials
- [ ] Backend running (`pnpm -C backend run dev`)
- [ ] Frontend running (`pnpm -C frontend run dev`)
- [ ] Can login at http://localhost:5000
- [ ] Can see members in dashboard
- [ ] Supabase Studio shows data

---

**That's it! You're ready to develop.** 🚀

For questions, see [SUPABASE_AUTH_CONFIG.md](SUPABASE_AUTH_CONFIG.md) or [supabase/docs/](supabase/docs/).
