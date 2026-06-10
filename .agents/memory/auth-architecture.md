---
name: Auth architecture
description: How authentication is wired end-to-end in this app.
---

**Backend:**
- Cookie name: `atfal_session` (HTTP-only, SameSite=lax, 24h)
- Routes: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Middleware: `requireAuth` in `backend/src/middlewares/requireAuth.ts` — exempts `/healthz` by path check
- Credentials read from env: `ADMIN_USERNAME` (default: "admin"), `ADMIN_PASSWORD` (default: "admin123"), `JWT_SECRET` (default insecure dev value)

**Frontend:**
- `AuthContext` (`frontend/src/context/AuthContext.tsx`) — fetches `/api/auth/me` on mount to rehydrate session
- `useAuth()` exposes `{ user, isLoading, logout, setUser }`
- Auth guard is a **render-guard** in `AppContent` component in `App.tsx`: shows `<Login />` if `!user` after loading, shows full app if authenticated. No redirect routing.
- Login page: `frontend/src/pages/Login.tsx`
- Logout wired in `AppLayout.tsx` via `useAuth().logout()`

**Why render-guard (not redirect):**
Simple, avoids flash of wrong content, works with wouter's base-path setup, and the app is single-tenant so there's no need for per-route authorization.

**How to apply:** Any new route or page is automatically protected because the entire `<Router />` tree only mounts when `user` is truthy.
