# Majlis Atfal-ul-Ahmadiyya Ghana Management System — Full Production Audit Report

**App:** Majlis Atfal-ul-Ahmadiyya Ghana Management System (Atfal-GMS) — a national community management platform for registering and managing Atfal/Khuddam members across Ghana, with analytics, graduation tracking and location hierarchy management.

**Stack:** React 19 + Vite + Tailwind CSS v4 (frontend) · Express.js + Drizzle ORM + PostgreSQL (backend) · Zod v4 (validation) · TanStack Query v5 · Wouter (routing) · shadcn/ui + Radix UI · OpenAPI + Orval (code-gen) · pnpm workspaces (monorepo)

**Audit Date:** June 10, 2026

**Auditor Skills Applied:** app-audit, react-patterns, supabase-projects, ui-design-system, frontend-design, debugging-with-clarity, database-schema-designer, senior-pm, product-strategist, ux-researcher-designer, ci-cd-pipeline-builder

---

## Production Readiness Score

| # | Category | Score | Grade |
|---|---|---|---|
| 1 | Product & Strategy | 15 / 20 | B+ |
| 2 | UI/UX Design | 15 / 20 | B+ |
| 3 | Branding & Visual Identity | 14 / 20 | B |
| 4 | Code Quality & Architecture | 16 / 20 | A- |
| 5 | Database / Backend | 13 / 20 | B- |
| 6 | Security | 4 / 20 | F |
| 7 | Testing & QA | 0 / 20 | F |
| 8 | Performance | 12 / 20 | C+ |
| 9 | DevOps & CI/CD | 3 / 20 | F |
| 10 | Accessibility | 8 / 20 | D |

### **Overall: 100 / 200 — 50% — Not production ready**

> The app has a genuinely solid foundation. The monorepo architecture is well-structured, the API is cleanly designed with OpenAPI + Orval code-gen, the UI is polished and responsive, and the database schema is properly indexed. However it has one absolute showstopper: there is no authentication whatsoever. Every API endpoint is wide open to anyone who knows the URL. Until auth is in, nothing else matters. On top of that there are zero tests and zero CI/CD.

---

## 1. Product & Strategy
**Score: 15/20**

### What is working
The product scope is well defined and appropriately scoped for a national community management system. The five core pages — Dashboard, Members, Graduations, Analytics and Locations — cover the real workflow a national Atfal office needs. The wing auto-calculation from date of birth is a genuinely smart feature that removes manual data entry errors. The multi-step member wizard with location cascade is a strong UX decision for a complex hierarchical data entry. The analytics dashboard gives leadership a real-time picture of member distribution by sector, region and wing. The member history audit trail is a meaningful operational feature. The upcoming graduations widget on the dashboard is directly actionable for coordinators.

### Gaps
There is no role-based access control visible in the product. A national system like this needs at minimum a separation between national admin (full access), regional coordinator (read/write own region), and zone-level officer (read-only or limited write). Currently all users see and can modify everything. There is no bulk import feature — for a system inheriting data from manual registers or spreadsheets, this is a real friction point at launch. There is no export functionality (CSV, PDF report) which reporting officers will immediately ask for. The "Log out" button in the nav is a dead UI element that does nothing.

---

## 2. UI/UX Design
**Score: 15/20**

### What is working
The layout is well thought out. Responsive across three breakpoints: top nav on large screens, sidebar on tablet, bottom nav on mobile — this is correct for a Ghana context where most coordinators will be on mobile. Loading states are handled consistently with Skeleton components across all data-heavy views. Empty states have proper messaging and are context-aware (distinguishes between "no data exists" and "your filter has no results"). The member wizard is animated with Framer Motion and gives clear step progress. Form validation errors are shown inline and immediately. The wing badge and member avatar components are reusable and consistent. Dark mode is fully implemented.

### Gaps
The "Profile" and "Settings" options in the dropdown menu open nothing — they are dead links. The "Log out" button does nothing because there is no auth session to destroy. The `ArchiveBanner` component appears on member profiles for any Khuddam-wing member, labeling them as archived, but there is no actual archive/soft-delete concept in the schema — this will confuse users. The analytics page needs an investigation; it imports region analytics but the sector breakdown queries make three separate DB calls in a loop rather than one grouped query (check `analytics.ts` — `Promise.all` over sectors). There is no confirmation before a destructive delete action other than the AlertDialog, which is good, but the delete is permanent with no soft-delete or undo.

---

## 3. Branding & Visual Identity
**Score: 14/20**

### What is working
The Majlis Atfal logo is loaded and used correctly in the sidebar brand. The gold accent color `hsl(43, 90%, 50%)` is consistently used for the primary CTA button ("Add Member") and active nav indicators, which creates a recognizable visual identity tied to the Ahmadiyya gold standard. The CSS design token system is comprehensive — all colors are defined as CSS custom properties with dark mode variants. Typography is set to Plus Jakarta Sans, a clean and modern choice. The sidebar uses a distinct dark green `--sidebar` color that differentiates the navigation shell from content.

### Gaps
The color tokens are defined correctly but some are hardcoded inline rather than using the token (for example `bg-[hsl(43,90%,50%)]` appears directly in `AppLayout.tsx` and should be `bg-primary` if that token maps to gold, or a named semantic token like `bg-brand-gold`). There is no favicon set for the deployed app — `public/favicon.svg` exists but `index.html` does not reference it. The OpenGraph image (`public/opengraph.jpg`) exists but the OG meta tags are not in `index.html`, so social sharing will not work. The button for "Add Member" uses hardcoded hex-equivalent values instead of design tokens, making it brittle if the brand color changes.

---

## 4. Code Quality & Architecture
**Score: 16/20**

### What is working
This is the strongest dimension of the app. The monorepo is organized logically into `lib/db`, `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` and `artifacts/atfal-ghana` + `artifacts/api-server`. The OpenAPI spec drives Zod schema generation and React Query hook generation via Orval — this is a genuinely advanced and correct pattern that eliminates an entire class of frontend/backend type mismatch bugs. The Drizzle schema is typed, uses proper enums, and has foreign key constraints with cascade deletes. Custom hooks (`useWingCalc`, `useLocationCascade`, `useDebounce`) are extracted cleanly. Components are reasonably sized and single-purpose. The `ErrorBoundary` wraps both the app root and the router. Environment variables are validated at startup with Zod — the server will crash loudly on missing config rather than silently failing.

### Gaps
Step function props in `MemberWizard.tsx` are typed as `any` throughout (`onNext: any`, `data: any`, etc.). This defeats the TypeScript strict typing that the rest of the codebase gets from Orval. The `onSubmitFinal` function in `MemberWizard.tsx` recalculates the wing locally using a boundary of age >= 13 for `atfal_kabir`, but the server-side `computeWing` function uses age >= 12. These two implementations are out of sync — the server is the source of truth and the client calculation will occasionally assign the wrong wing label in the review step. The `WingBadge` prop for "khuddam" triggers the `ArchiveBanner` component on the profile page, which is a semantic mismatch — Khuddam is not an archive state. The `AppContext` only manages view mode and theme — it is not being used for auth state or user session, which will be needed when auth is added.

---

## 5. Database / Backend
**Score: 13/20**

### What is working
The schema is properly normalized for the data it holds. The `membersTable` has indexes on all commonly filtered columns (wing, sector, region, zone, circuit, jamaat, dateOfBirth, lastName, firstName). Foreign key constraints with cascade deletes are correctly set on `memberHistoryTable` and `graduationsTable`. The API server validates all request inputs with Zod before touching the database. The location hierarchy is stored as denormalized text fields on the member record — this is a pragmatic choice that simplifies queries and is acceptable for this data volume. The graduation tracking records the wing transition with `previousWing` and `newWing`, which is the correct audit pattern.

### Gaps
The location tables (`circuitsTable`, `jamaatsTable`) have no foreign key relationships to member records. They are used only for autocomplete suggestions, but there is nothing preventing a member from being saved with a circuit name that does not exist in the circuits table. The `usageCount` column is being incremented with raw SQL `UPDATE circuits SET usage_count = usage_count + 1 WHERE name = ...` but this is not done in a transaction with the member insert — if the member insert succeeds but the usage count update fails, the count silently drifts. There is no migration tooling setup beyond a single `0001_remove_position.sql` file — no Drizzle migrate script is configured in the package.json scripts, so running migrations in production requires manual intervention. The `sector`, `region` and `zone` fields on members are free-text strings rather than foreign keys to a proper hierarchy table, which means typos or inconsistent data entry can create phantom groupings in analytics. There is no `deletedAt` soft-delete column anywhere.

---

## 6. Security
**Score: 4/20**

### What is working
The server uses `helmet` for HTTP security headers. Rate limiting is applied globally (300 req/15min) and separately for write operations (60 req/15min). CORS is configurable via environment variable. The file upload endpoint validates MIME type and limits file size to 5MB. The `env.ts` validates required environment variables at startup and exits if they are missing.

### Gaps — ALL CRITICAL

**There is no authentication on any API endpoint.** Every `GET`, `POST`, `PATCH` and `DELETE` route under `/api` is fully public. Anyone with the server URL can list all members, create records, modify records or delete them without logging in. The `supabase/docs/auth-setup.md` file describes exactly how to add auth but it has not been implemented. This is a production blocker.

The `ALLOWED_ORIGIN` defaults to `"*"` in `.env.example`. In production this must be set to the actual frontend domain or CORS offers no protection.

The file upload path traversal check in `uploads.ts` does `filePath.startsWith(UPLOAD_DIR)` but this can be bypassed on case-insensitive file systems. A safer check is `path.resolve(filePath) === path.resolve(UPLOAD_DIR, filename)`.

There is no authentication middleware (`requireAuth`) in `app.ts` — the auth-setup doc is documentation only, not implemented code.

There is no RBAC — once auth is added, all users will have the same access level unless roles are built in parallel.

Photo URLs stored as `/api/uploads/filename` are served publicly — any uploaded photo is accessible without authentication.

---

## 7. Testing & QA
**Score: 0/20**

### What is working
Nothing — there are zero test files anywhere in the repository.

### Gaps
No unit tests for the business logic functions (`computeWing`, `computeAge`). These functions exist in duplicate across the codebase (client and server) with slightly different boundary values — a test would have caught this immediately. No integration tests for API routes. No E2E tests. No test runner configured (no Vitest, Jest or Playwright config). No test script in any `package.json`. This is the dimension that will cause regressions at every subsequent update.

---

## 8. Performance
**Score: 12/20**

### What is working
TanStack Query handles deduplication of API calls and provides `keepPreviousData` during pagination — users do not see flash-of-empty-content when changing pages. Search is debounced at 300ms, preventing a request per keystroke. The member list uses server-side pagination with configurable page sizes (12 for cards, 20 for list). The `MemberList` skeleton loaders match the actual content layout, reducing layout shift. The `vite.config.ts` uses Vite's built-in code splitting.

### Gaps
The `analytics.ts` route makes 3 separate sequential database queries per sector in `by-sector` using `Promise.all` — this fires 3 queries for Northern, Middle and Southern sector simultaneously, but each query scans the entire `membersTable` with a `WHERE sector = ?` filter. This should be a single `GROUP BY sector` query. The birthday analytics endpoint fetches the full member record for `thisWeek` and `thisMonth` buckets with `db.select()` (all columns) when it only needs name, DOB, wing and ID for the response. No response caching or stale-while-revalidate headers on the API. No image optimization for uploaded member photos — full-size images are served directly. No lazy loading on route components in `App.tsx` — all pages are eagerly bundled.

---

## 9. DevOps & CI/CD
**Score: 3/20**

### What is working
The `.replit` configuration handles the Replit dev environment setup. The `pnpm-workspace.yaml` monorepo config is in place. TypeScript build is checked with `pnpm run typecheck` in the root `package.json`. The `scripts/post-merge.sh` suggests some awareness of deployment steps.

### Gaps
There is no `.github/workflows/` folder — no CI pipeline at all. No automated typecheck on PR. No lint job. No test job (nothing to run, but the scaffold is missing). No deployment pipeline to a production host. The app is built on Replit, which is a dev environment — there is no documented production deployment target (Render, Railway, Fly.io, etc.). There is no `Dockerfile`. There is no health check endpoint documented for uptime monitoring (the `health.ts` route exists in the API but is not wired into any monitoring). There are no environment-specific configs (`staging`, `production`). The database migration story is incomplete — `drizzle.config.ts` exists in `lib/db` but there is no `migrate` script in `package.json`.

---

## 10. Accessibility
**Score: 8/20**

### What is working
shadcn/ui components built on Radix UI primitives provide correct ARIA roles for dialogs, dropdown menus, select boxes and tooltips out of the box. The `ToggleGroup` for card/list view uses `aria-label`. Form inputs use `<Label>` components with `htmlFor` correctly. The `AlertDialog` for member deletion is keyboard navigable.

### Gaps
The bottom mobile nav items are `<div>` elements wrapped in `<Link>` — they should be `<button>` or `<a>` elements with proper roles so screen readers identify them as interactive. The `AvatarButton` in the header is a raw `<button>` with no accessible name — "MA" initials are not descriptive for screen readers; it needs `aria-label="Account menu"`. The `MemberAvatar` component generates initials for display but does not have alt text on the underlying `<img>` elements. Color contrast on the sidebar nav text `text-white/65` may fall below WCAG AA at smaller sizes. No `skip to main content` link. No `lang` attribute on the `<html>` element in `index.html`.

---

## Must-Add Features (Blockers for Production)

1. **Implement authentication** — The `supabase/docs/auth-setup.md` is a complete guide. Add the `requireAuth` middleware to `app.ts`, create the Login page, and hook up the Supabase JWT flow. Without this the entire app is a public data breach. (`artifacts/api-server/src/app.ts`, `artifacts/api-server/src/middlewares/`)

2. **Fix the wing boundary mismatch** — `MemberWizard.tsx` line `else if (age >= 13) wing = "atfal_kabir"` but `members.ts` route uses `if (age >= 12) return "atfal_kabir"`. Decide on one boundary and sync both files. (`artifacts/atfal-ghana/src/pages/members/MemberWizard.tsx` and `artifacts/api-server/src/routes/members.ts`)

3. **Wrap member insert and usage count update in a transaction** — The `POST /members` route in `members.ts` runs the insert and the `UPDATE circuits SET usage_count` as separate queries. If the second fails, counts drift permanently. Use `db.transaction()` from Drizzle. (`artifacts/api-server/src/routes/members.ts`)

4. **Add a database migration script** — Add `"migrate": "drizzle-kit migrate"` to `lib/db/package.json` scripts and document the production run procedure. Without this there is no safe way to deploy schema changes. (`lib/db/package.json`)

5. **Fix `ArchiveBanner` logic** — The banner fires for any member with `wing === "khuddam"` but Khuddam is a valid active wing, not an archived state. This will confuse every user viewing a Khuddam member profile. Either remove the banner or add a real `isArchived` boolean field and tie the banner to that. (`artifacts/atfal-ghana/src/pages/members/MemberProfile.tsx`)

6. **Set ALLOWED_ORIGIN to actual domain in production** — The `.env.example` defaults to `*`. This must be documented as a required change before going live, or defaulted to `""` to force explicit configuration.

---

## Nice-to-Have Features (Post-Launch Improvements)

1. **Bulk CSV import** — Most regions will have existing registers in Excel or Google Sheets. A CSV upload wizard that maps columns to fields would dramatically reduce the onboarding friction.

2. **Export to PDF/CSV** — Officers need to produce reports for national meetings. A simple export button on the Members page and Analytics page would cover 80% of this need.

3. **Role-based access control** — After auth is in, add roles: `national_admin` (full access), `regional_coordinator` (scoped to own region), `zone_officer` (read-only). Store role in Supabase user metadata.

4. **Lazy load route components** — Wrap each page import in `React.lazy()` in `App.tsx` and add a `<Suspense>` fallback. This reduces initial bundle size.

5. **Replace sector `Promise.all` with single GROUP BY query** — In `analytics.ts`, replace the three per-sector queries with one `GROUP BY sector` query. Faster and fewer round trips. (`artifacts/api-server/src/routes/analytics.ts`)

6. **Add soft delete to members** — Add `deletedAt: timestamp("deleted_at")` to `membersTable` and filter on `IS NULL` in all queries. This protects against accidental deletions and enables a recoverable archive workflow.

7. **Add Vitest unit tests for business logic** — At minimum test `computeWing` and `computeAge` in both their server and client implementations. This would have caught the boundary mismatch.

8. **Add a CI workflow** — A basic `.github/workflows/ci.yml` with `pnpm run typecheck` on PR would catch type regressions before merge.

9. **Image optimization** — Resize uploaded photos to a max of 800x800px on the server before saving, and serve with appropriate `Cache-Control` headers.

10. **Fix accessibility gaps** — Add `lang="en"` to `index.html`, add `aria-label="Account menu"` to the avatar button, change mobile nav items from `div` to `button`/`a` elements.

---

## Summary Scorecard

```
Product & Strategy      ████████████████░░░░  15/20
UI/UX Design            ████████████████░░░░  15/20
Branding & Identity     ██████████████░░░░░░  14/20
Code Quality            █████████████████░░░  16/20
Database / Backend      ██████████████░░░░░░  13/20  ← migration story incomplete
Security                ████░░░░░░░░░░░░░░░░   4/20  ← NO AUTH = BLOCKER
Testing & QA            ░░░░░░░░░░░░░░░░░░░░   0/20  ← zero tests
Performance             █████████████░░░░░░░  12/20
DevOps & CI/CD          ███░░░░░░░░░░░░░░░░░   3/20  ← no pipeline
Accessibility           █████████░░░░░░░░░░░   8/20

TOTAL: 100/200 — 50% — Not production ready
```

**Recommended next 3 sprints:**

**Sprint 1 — Security & Stability (Week 1–2)**
Implement Supabase auth end-to-end using the existing `auth-setup.md` guide. Add `requireAuth` middleware. Create the Login page. Fix the wing boundary mismatch. Wrap member insert in a transaction. Fix the `ArchiveBanner` false-positive. These are all blockers that must be done before showing this to any real user.

**Sprint 2 — Quality & Data Integrity (Week 3–4)**
Set up Vitest and write unit tests for `computeWing`/`computeAge`. Add the Drizzle migrate script and document deployment steps. Add a `deletedAt` column for soft deletes. Replace the per-sector analytics loop with a single GROUP BY query. Add a `.github/workflows/ci.yml` with typecheck on PR. Fix the lazy loading and image optimization gaps.

**Sprint 3 — Feature Completeness (Week 5–6)**
Build CSV bulk import for the onboarding use case. Add export to CSV on the Members page. Add basic RBAC (national admin vs regional coordinator). Add `lang` attribute and fix remaining accessibility gaps. Write a deployment runbook documenting how to go from Replit dev to a production server.
