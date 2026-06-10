# Authentication Setup with Supabase Auth

The current app has no real authentication. This guide replaces the placeholder "Majlis Admin" user with a proper Supabase Auth integration using email/password login, JWT-based API protection, and Row Level Security.

---

## How it works

```
Browser                  Express API              Supabase Auth
  │                          │                        │
  │── POST /auth/sign-in ───▶│                        │
  │                          │── verifyOtp/signIn ───▶│
  │                          │◀─ JWT access token ────│
  │◀─ Set-Cookie (JWT) ──────│                        │
  │                          │                        │
  │── GET /api/members ─────▶│                        │
  │   (Cookie: JWT)          │── verifyJWT ──────────▶│
  │                          │◀─ user payload ─────────│
  │◀─ 200 JSON ──────────────│                        │
```

---

## Step 1 — Install the Supabase client

```bash
pnpm --filter @workspace/api-server add @supabase/supabase-js
pnpm --filter @workspace/atfal-ghana add @supabase/supabase-js @supabase/ssr
```

---

## Step 2 — Create a Supabase client helper (API server)

```typescript
// artifacts/api-server/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

---

## Step 3 — Create an auth middleware

```typescript
// artifacts/api-server/src/middlewares/requireAuth.ts
import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.["sb-access-token"];

  if (!token) {
    res.status(401).json({ status: "error", message: "Authentication required" });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ status: "error", message: "Invalid or expired token" });
    return;
  }

  (req as any).user = data.user;
  next();
}
```

---

## Step 4 — Protect API routes

```typescript
// In artifacts/api-server/src/app.ts — add after other middleware:
import { requireAuth } from "./middlewares/requireAuth";
import cookieParser from "cookie-parser";

app.use(cookieParser());
app.use("/api", requireAuth); // protect all /api routes
// Exception: allow health check without auth
app.use("/api/healthz", (req, res, next) => next());
```

---

## Step 5 — Frontend login page

```typescript
// artifacts/atfal-ghana/src/lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

```typescript
// artifacts/atfal-ghana/src/pages/Login.tsx (create this)
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else window.location.href = "/";
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
```

---

## Step 6 — Pass the JWT to the API

```typescript
// artifacts/atfal-ghana/src/lib/api.ts
import { supabase } from "./supabase";

// Override the auth token getter used by the generated API client
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});
```

Import this file once at the top of `main.tsx`.

---

## Step 7 — Create the first admin user

In Supabase Studio (local: `http://localhost:54323`, production: your project dashboard):

1. Go to **Authentication → Users**
2. Click **Add user** → **Create new user**
3. Enter the admin email and password
4. Optionally set `email_confirmed = true` to skip email verification

Or via SQL:

```sql
-- Run in Supabase SQL editor
SELECT supabase.create_user(
  '{"email": "admin@atfal.gh", "password": "ChangeMe123!", "email_confirm": true}'::jsonb
);
```

---

## Step 8 — Environment variables needed

```env
# Server
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>

# Frontend (prefix with VITE_ for Vite to expose them)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

---

## Email templates (optional)

Customise the "Confirm signup" and "Reset password" emails in:
**Supabase Dashboard → Authentication → Email Templates**

Update the redirect URL to your production domain.
