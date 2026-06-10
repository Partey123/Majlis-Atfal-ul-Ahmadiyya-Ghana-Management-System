# Majlis Atfal-ul-Ahmadiyya Ghana Management System — Audit v2
### Marked Against Audit v1 · Production Readiness Assessment

**Re-Audit Date:** June 10, 2026  
**Compared Against:** Audit v1 (June 10, 2026 — score 100/200, 50%)  
**Codebase Snapshot:** `Majlis-Atfal-ul-Ahmadiyya-Ghana-Management-System-main.zip`  
**Notable structural change:** App has been refactored from `artifacts/atfal-ghana` + `artifacts/api-server` into a flat `frontend/` + `backend/` layout. The `lib/*` packages, OpenAPI spec, and Orval code-gen remain.

---

## Score Delta at a Glance

| # | Category | v1 Score | v2 Score | Change | Grade |
|---|---|---|---|---|---|
| 1 | Product & Strategy | 15 / 20 | 16 / 20 | +1 | B+ |
| 2 | UI/UX Design | 15 / 20 | 17 / 20 | +2 | A- |
| 3 | Branding & Visual Identity | 14 / 20 | 16 / 20 | +2 | B+ |
| 4 | Code Quality & Architecture | 16 / 20 | 15 / 20 | **-1** | B+ |
| 5 | Database / Backend | 13 / 20 | 15 / 20 | +2 | B+ |
| 6 | Security | 4 / 20 | 14 / 20 | **+10** | B |
| 7 | Testing & QA | 0 / 20 | 0 / 20 | 0 | F |
| 8 | Performance | 12 / 20 | 15 / 20 | +3 | B+ |
| 9 | DevOps & CI/CD | 3 / 20 | 5 / 20 | +2 | F+ |
| 10 | Accessibility | 8 / 20 | 11 / 20 | +3 | C+ |

### **v2 Overall: 124 / 200 — 62% — Not yet production ready (+12% from v1)**

> The codebase has made genuinely significant progress. The single biggest blocker from v1 — no authentication whatsoever — is now resolved end-to-end: JWT middleware, login/logout endpoints, an `AuthContext`, a login page, and proper route guarding are all in place and correctly wired. Eight of the ten v1 "Must-Add" items have been addressed in some form. However the app cannot go to production yet because testing is still zero, the root typecheck script is broken after the folder refactor, and the auth credential defaults are insecure enough to constitute a live data breach risk if deployed without changing them.

---

## What Changed: v1 Blocker & Must-Add Status

| v1 Item | Status | Notes |
|---|---|---|
| Implement authentication | ✅ **Done** | JWT middleware, login/logout/me routes, `AuthContext`, `Login.tsx`, full route guard |
| Fix wing boundary mismatch | ✅ **Done** | Both `MemberWizard.tsx` and `members.ts` now use `age >= 15` / `age >= 12` |
| Wrap member insert in transaction | ✅ **Done** | `POST /members` uses `db.transaction()` for insert + history + usage counts |
| Add database migrate script | ✅ **Done** | `lib/db/package.json` now has `"migrate": "drizzle-kit migrate"` |
| Fix `ArchiveBanner` false-positive | ✅ **Done** | `ArchiveBanner` removed from `MemberProfile.tsx`; component now has correct semantics |
| Set `ALLOWED_ORIGIN` in production | ⚠️ **Partial** | Default is still `*`; a comment notes it but there is no `.env.example` entry forcing explicit set |
| Wire logout button | ✅ **Done** | `AppLayout.tsx` calls `logout()` from `useAuth`; dead "Profile"/"Settings" links also removed |
| OG meta tags & favicon | ✅ **Done** | `index.html` now has `lang="en"`, `og:image`, `twitter:card`, `rel="icon"` |

---

## 1. Product & Strategy
**v1: 15/20 → v2: 16/20 (+1)**

### What improved
The logout button is now functional and the dead "Profile" / "Settings" links have been removed from the account dropdown entirely rather than left as UI lies. The wing auto-calculation is now consistent between client and server (wing boundary fix). The `ArchiveBanner` no longer mislabels active Khuddam members as archived.

### Remaining gaps
There is still no role-based access control. The entire app is accessible to anyone with the one admin credential — national office, regional coordinator, and zone officer all see and can modify everything. There is still no bulk CSV import and no export functionality. Both of these will be the first thing real users ask for at onboarding. The dropdown menu's Profile and Settings items were deleted rather than implemented, which is a reasonable short-term choice but leaves account management entirely absent.

---

## 2. UI/UX Design
**v1: 15/20 → v2: 17/20 (+2)**

### What improved
All three dead UI elements called out in v1 are resolved: logout is wired, Profile/Settings are no longer shown as options that go nowhere, and `ArchiveBanner` no longer fires for active Khuddam members. Analytics queries have been substantially improved (see Database section) which removes a latency problem on the Analytics page.

### Remaining gaps
Member deletion is still permanent with no soft-delete or undo. The AlertDialog confirmation before delete is good, but there is no recovery path after confirmation. Once auth is in, consider that only an admin should be able to delete — currently any logged-in user (all users are the same admin) can destroy records.

---

## 3. Branding & Visual Identity
**v1: 14/20 → v2: 16/20 (+2)**

### What improved
`index.html` now correctly references the favicon (`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`), includes the full OpenGraph + Twitter card meta block, and has `lang="en"` on the `<html>` element. These were all gaps called out in v1.

### Remaining gaps
The `Add Member` button and `AvatarButton` in `AppLayout.tsx` still use hardcoded HSL values (`bg-[hsl(43,90%,50%)]`) rather than the design token (`bg-primary` or a named semantic token). If the brand color ever changes, these will be missed. The font has changed from `Plus Jakarta Sans` to `Inter` — this is a minor regression in visual distinctiveness but not a blocker.

---

## 4. Code Quality & Architecture
**v1: 16/20 → v2: 15/20 (-1)**

### What improved
The wing boundary mismatch between client and server is fixed. `App.tsx` now uses `React.lazy()` + `<Suspense>` for all route components, which was a nice-to-have in v1. The `ArchiveBanner` semantic mismatch is resolved. The `AuthContext` is properly typed with a real `AuthUser` interface.

### New regression — typecheck script gap
The codebase was refactored from `artifacts/atfal-ghana` + `artifacts/api-server` into `frontend/` + `backend/`. However, the root `package.json` `typecheck` script was **not updated**:

```json
// Root package.json — CURRENT (broken)
"typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
```

This filters `./artifacts/**` — the old path. The actual app in `frontend/` and `backend/` is **not typechecked** by `pnpm run typecheck`. Both packages have a `typecheck` script individually, but the monorepo root command silently skips them. Running `pnpm -r run typecheck` would catch them, but the documented build path `pnpm run build` calls `pnpm run typecheck` (the broken one) first.

**Fix:** Update root `package.json`:
```json
"typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./frontend\" --filter \"./backend\" --filter \"./scripts\" --if-present run typecheck"
```

### Remaining gaps
`MemberWizard.tsx` still has eight instances of `: any` / `as any` for all step function props (`onNext: any`, `data: any`, `Step1PersonalInfo({ defaultValues, onNext }: any)`, etc.). This is the one place in the codebase where strict TypeScript is abandoned. The `PATCH /members/:id` route runs `db.update` and then separately `db.insert(memberHistoryTable)` with no wrapping transaction — if the history insert fails, the audit trail for that update is silently lost.

---

## 5. Database / Backend
**v1: 13/20 → v2: 15/20 (+2)**

### What improved
`POST /members` is now fully wrapped in a `db.transaction()` that atomically inserts the member, creates the initial history record, and increments the circuit and jamaat usage counts. The `migrate` script is present in `lib/db/package.json`. The path traversal check in `uploads.ts` was upgraded from `startsWith` to `path.resolve` comparison, which is the correct fix.

### Remaining gaps
`PATCH /members/:id` still runs `db.update(membersTable)` and then a separate `db.insert(memberHistoryTable)` without a transaction. If the history insert throws after the update commits, that update leaves no audit trail. Birthday analytics still issues `db.select()` (all 20+ columns) for the `thisWeek` and `thisMonth` buckets when the response only uses 5 fields. The location FK gap remains: a member can be saved with a `circuit` value that does not exist in the `circuitsTable`. No `deletedAt` soft-delete column has been added to `membersTable`.

---

## 6. Security
**v1: 4/20 → v2: 14/20 (+10)**

### What improved — the blocker is resolved
Authentication is now fully implemented and correctly wired. `requireAuth` sits in `app.ts` between `authRouter` (the public login/logout/me endpoints) and all protected routes. The JWT is issued as an `httpOnly` cookie with `sameSite: 'lax'` and `secure: true` in production. The `AuthContext` checks `/api/auth/me` on load and gates the entire app behind the `Login` page. Photo uploads are now behind `requireAuth` (uploadsRouter is mounted after the middleware). This closes the complete-API-exposure issue that was the absolute blocker in v1.

### Remaining gaps

**Insecure credential defaults (high priority):**

`env.ts` defines:
```typescript
JWT_SECRET: z.string().default("dev-only-secret-change-for-production"),
ADMIN_USERNAME: z.string().default("admin"),
ADMIN_PASSWORD: z.string().default("admin123"),
```

`JWT_SECRET` logs a `warn` if left at the default value in production — good. But `ADMIN_USERNAME` and `ADMIN_PASSWORD` have **no production warning at all**. A deployer who does not know to set them will run production with `admin` / `admin123` as the login. These should either crash the server if unchanged in production (like the original pattern for `DATABASE_URL`), or at minimum log an `error`-level warning. Neither credential is documented in `.env.example`.

**`ALLOWED_ORIGIN` still defaults to `*`:** The `.env.example` documents it with a comment but does not force explicit configuration. In production this must be the frontend domain.

**Single admin, no RBAC:** Once multiple people use this system — a national office admin, regional coordinators, zone officers — they all share the one credential. Roles need to be modelled.

---

## 7. Testing & QA
**v1: 0/20 → v2: 0/20 (no change)**

### Status
Zero test files exist anywhere in the repository. No test framework (Vitest, Jest, Playwright) has been configured. No `test` script exists in any `package.json`. This is unchanged from v1.

The wing boundary mismatch identified in v1 (and now fixed) is exactly the class of bug that a test for `computeWing` would have caught and prevented from drifting. The duplicate `computeWing` implementation still exists in both `backend/src/routes/analytics.ts` and `backend/src/routes/members.ts` — the server now has two copies of the same function, and there is still no test ensuring they agree.

---

## 8. Performance
**v1: 12/20 → v2: 15/20 (+3)**

### What improved
Route components are now lazy-loaded (`React.lazy` + `<Suspense>`) with a skeleton fallback — initial JS bundle size is reduced. The analytics `by-sector` and `by-region` routes now use single `GROUP BY` queries rather than per-sector looping, which was the main server-side performance issue flagged in v1.

### Remaining gaps
Birthday analytics still fetches full member rows (`db.select()` with all columns) for the `thisWeek` and `thisMonth` buckets. Only id, name, DOB, and wing are needed for the response. No server-side response caching. No image optimization for uploaded member photos — full-size files are served directly.

---

## 9. DevOps & CI/CD
**v1: 3/20 → v2: 5/20 (+2)**

### What improved
The `migrate` script exists in `lib/db/package.json`. The `supabase/docs/` directory has grown to include `hosting.md`, `schema-migration.md`, `local-setup.md`, `environment-variables.md`, and `storage-setup.md` — this is now a fairly complete runbook for going from Replit dev to production Supabase. The AGENTS memory files (`.agents/memory/`) document architectural decisions for future agents/developers.

### Remaining gaps
No `.github/workflows/` directory exists — there is no CI pipeline. The **root `typecheck` script does not cover `frontend/` or `backend/`** (see Code Quality section), meaning CI could not even run a meaningful typecheck if it were configured. No `Dockerfile`. No production deployment target is configured. The `scripts/post-merge.sh` is a 4-line placeholder (`#!/bin/bash` only). The `pnpm run build` command at root invokes the broken `typecheck` before building, meaning the build check is silently incomplete.

---

## 10. Accessibility
**v1: 8/20 → v2: 11/20 (+3)**

### What improved
`lang="en"` is now on the `<html>` element in `index.html`. The `AvatarButton` in `AppLayout.tsx` now has `aria-label="Account menu"`. `MemberAvatar` now sets `alt={\`${member.firstName} ${member.lastName}\`}` on the avatar image, which was a gap in v1.

### Remaining gaps
The mobile bottom nav still wraps `<div>` elements in `<Link>` — Wouter's `Link` renders as an `<a>`, so the DOM is `<a href="..."><div>...</div></a>`. This is better than a bare `<div>`, but the inner `<div>` carries the visual content without a role. Use `<a>` or `<button>` directly, or render the link contents as a `<span>`. The sidebar nav text `text-white/65` is ~4.0:1 contrast ratio at 14px, which passes WCAG AA only at ≥18px — at the current 14px `text-sm` size it falls below the 4.5:1 threshold. No skip-to-main-content link.

---

## Production Readiness: What's Left

### Hard Blockers (must fix before any real user touches this)

**B1 — Insecure auth defaults will cause a live breach**  
`ADMIN_USERNAME` defaults to `admin` and `ADMIN_PASSWORD` to `admin123`. These need a production guard that either crashes the server or logs an error-level message — not just silence. Both must be documented in `.env.example`.

```typescript
// env.ts — add production check
if (
  result.data.NODE_ENV === "production" &&
  (result.data.ADMIN_PASSWORD === "admin123" || result.data.ADMIN_USERNAME === "admin")
) {
  logger.error("ADMIN_USERNAME and ADMIN_PASSWORD are using insecure defaults. Set strong values before deploying.");
  process.exit(1);
}
```

**B2 — Root typecheck silently skips the entire app**  
`pnpm run typecheck` currently only checks `./artifacts/**` (the old paths). The `frontend/` and `backend/` packages are not typechecked by this command. Update root `package.json`:

```json
"typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./frontend\" --filter \"./backend\" --filter \"./scripts\" --if-present run typecheck"
```

**B3 — Zero tests means every future change is a regression risk**  
At minimum, add Vitest and cover `computeWing` and `computeAge` in both their server instances (`analytics.ts` has its own copy, `members.ts` has another). These two functions exist in 3 places with no test — the boundary mismatch in v1 would have been caught immediately.

---

### High Priority (should be done before public launch)

**H1 — `ALLOWED_ORIGIN` must be forced to a real value in production**  
Add an explicit entry to `.env.example`:
```
ALLOWED_ORIGIN=https://your-frontend-domain.com
```
And add a production warning to `env.ts` if it is still `*`.

**H2 — Wrap `PATCH /members/:id` in a transaction**  
The update and history insert run as separate queries. Use `db.transaction()` as done in `POST /members`.

**H3 — Document `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` in `.env.example`**  
They are currently configured only in the Zod schema defaults. A deployer following `.env.example` will not know they need to be set.

**H4 — Add basic RBAC**  
After a second admin is created, role needs to gate what is visible. At minimum: `national_admin` (full access) vs `readonly` (view only) is achievable with a `role` field in the JWT.

---

### Nice-to-Have (post-launch sprint)

**N1 — Bulk CSV import** — highest user request at launch.  
**N2 — Export to CSV on Members and Analytics pages.**  
**N3 — Soft delete:** Add `deletedAt` to `membersTable`, filter `IS NULL` everywhere.  
**N4 — Wrap `PATCH` history in transaction** (see H2).  
**N5 — Optimise birthday analytics:** `db.select({ id, firstName, lastName, dateOfBirth, wing })` instead of full row select for week/month queries.  
**N6 — Fix root `typecheck` script** (see B2 — this should actually be B priority).  
**N7 — Remove duplicate `computeWing` from `analytics.ts`** — extract to a shared utility in `lib/db` or a new `lib/utils` package.  
**N8 — Add Vitest CI job** in `.github/workflows/ci.yml` once tests exist.  
**N9 — Image optimization** — resize photos server-side before saving; add `Cache-Control` headers on `/api/uploads/*`.  
**N10 — Fix mobile nav DOM** — replace `<div>` inside `<Link>` with semantic elements.

---

## Full Scorecard

```
                          v1     v2    delta
Product & Strategy      ████████████████░░░░  15/20 → 16/20  +1
UI/UX Design            ████████████████░░░░  15/20 → 17/20  +2
Branding & Identity     ██████████████░░░░░░  14/20 → 16/20  +2
Code Quality            █████████████████░░░  16/20 → 15/20  -1  ← typecheck regression
Database / Backend      ██████████████░░░░░░  13/20 → 15/20  +2
Security                ████░░░░░░░░░░░░░░░░   4/20 → 14/20 +10  ← auth implemented
Testing & QA            ░░░░░░░░░░░░░░░░░░░░   0/20 →  0/20   0  ← still zero tests
Performance             █████████████░░░░░░░  12/20 → 15/20  +3
DevOps & CI/CD          ███░░░░░░░░░░░░░░░░░   3/20 →  5/20  +2  ← no CI, broken typecheck
Accessibility           █████████░░░░░░░░░░░   8/20 → 11/20  +3

v1 TOTAL: 100/200 — 50%
v2 TOTAL: 124/200 — 62%  (+24 points, +12%)
```

**Recommended next 2 sprints:**

**Sprint 1 — Close the blockers (Week 1)**  
Fix the root `typecheck` script to cover `frontend/` and `backend/`. Add production crash-guard for `ADMIN_USERNAME`/`ADMIN_PASSWORD` defaults. Document all three auth env vars in `.env.example`. Set `ALLOWED_ORIGIN` to the real domain. Wrap `PATCH /members` in a transaction. Install Vitest and write tests for `computeWing`/`computeAge`. Add a `.github/workflows/ci.yml` that runs `pnpm run typecheck` and the new test suite on every PR.

**Sprint 2 — Fill remaining gaps (Week 2)**  
Add `deletedAt` soft-delete to `membersTable`. Implement CSV export on the Members page. Build a CSV bulk import wizard for onboarding. Optimise birthday analytics selects. Add basic role distinction (`national_admin` vs `readonly`) to the JWT payload. Fix mobile nav DOM and sidebar contrast ratio. Remove the duplicate `computeWing` from `analytics.ts` into a shared utility.
