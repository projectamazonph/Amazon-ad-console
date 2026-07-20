# Amazon Ad Console — Implementation Audit

**Scope**: full repo (`src/`, `prisma/`, `e2e/`, `tests/`, config, CI, Docker)
**Stack declared**: Next.js 16, React 19, Prisma 7, NextAuth 5 (beta), Zustand 5, Vitest 4
**Repo state**: `dev.db` committed, 25 unit test files, 1 component test file, 7 e2e specs

> Note: several versions in `package.json` (Next 16, React 19, Prisma 7, Vitest 4, jsdom 29) are beyond current stable releases. Treat as a forward-dated snapshot — bumps may break.

---

## TL;DR

| Area | Grade | One-liner |
|------|-------|-----------|
| Engine (pure TS) | **A** | SOLID, TDD-disciplined, fail-fast, strategy-pattern search term generator — best part of the codebase |
| State (Zustand slices) | **B** | Clean slice composition, but components reach into the store directly instead of through hooks |
| React components | **C** | Big views, low test coverage (1 component test), some SRP drift |
| API routes | **C-** | Auth in place, but no input validation, no CSRF, no rate limits, weak data shape checks |
| Auth (NextAuth 5) | **C** | Works, but bcrypt cost 10, no rate limiting, no lockout, no email verification |
| Database (Prisma) | **B-** | Schema sane, but JSON-as-string columns + hand-rolled `JSON.parse` everywhere + sync wipes data outside a transaction |
| Tests | **C+** | 25 engine test files, 1 component test, 0 e2e in CI |
| CI / CD | **C** | Type-check + unit + build only; no lint, no e2e, no dep audit, no secret scan |
| Docker | **D** | Dockerfile references `.next/standalone` but `next.config.ts` doesn't enable it; assumes a `public/` dir that doesn't exist |
| Security | **D+** | Committed `dev.db`, no rate limits, no CSP, no HSTS, no input validation, weak password policy |
| **Overall** | **C+** | Strong engine, weak around the edges. Ship-able as a single-user sandbox; not production-grade for multi-tenant use. |

---

## 🔴 Critical (block / fix before any public deploy)

### 1. `dev.db` is committed to git and not in `.gitignore`
- **Evidence**: `dev.db` is present in the working tree (45,056 bytes) and `git check-ignore dev.db` returns non-zero (not ignored).
- **Risk**: SQLite DBs committed to a public/private repo leak any test user data, password hashes (bcrypt), and full campaign data baked into the snapshot.
- **Fix**:
  1. Add `*.db`, `*.db-journal`, `prisma/dev.db*` to `.gitignore`.
  2. `git rm --cached dev.db` and commit.
  3. Rotate any credentials that were ever stored in it.

### 2. `prisma.config.ts` uses `process.env["DATABASE_URL"]` but it's loaded via `import "dotenv/config"` — no validation, no schema check at build time
- **Evidence**: `prisma.config.ts` reads `process.env["DATABASE_URL"]` with no fallback. If missing, prisma fails later with an opaque error.
- **Risk**: Production builds silently pick up the wrong DB; `prisma generate` during `postinstall` can fail or generate the wrong client.
- **Fix**: fail fast with a clear error if `DATABASE_URL` is missing at config-load time.

### 3. Sync endpoint is a delete-all-then-insert, outside a transaction
- **Evidence**: `src/app/api/sync/route.ts` does `prisma.campaign.deleteMany({ where: { userId } })` then `prisma.campaign.createMany(...)`.
- **Risk**: A network blip / size limit / partial failure = **total data loss** for that user. Also a `createMany` will throw on the `@@unique([userId, campaignId])` constraint if the client supplies duplicates, leaving a half-synced state.
- **Fix**: Wrap in `prisma.$transaction([...])` or use an upsert loop with a stable temp `campaignId`. Add a request-size limit (e.g. 1 MB) and validate payload shape before touching the DB.

### 4. No input validation on any API route
- **Evidence**: `register/route.ts` accepts any string for `email`/`password`/`name`. `campaigns/route.ts` POST takes `data` as `any` and writes through. `sync/route.ts` accepts any array.
- **Risk**: Mass assignment, malformed payloads, oversized JSON, no min budget / bid enforcement (engine has `assertFiniteNonNegative` but it's bypassed by the API).
- **Fix**: Add a single `validation.ts` for API shapes (Zod is overkill if you want zero deps — the same `assertX` style you already use works). At minimum:
  - Email regex + length cap.
  - Password length ≥ 8, zxcvbn-style "not top 1k".
  - `dailyBudget >= 1`, `defaultBid >= 0.02`, `dailyBudget <= 100000`.
  - `campaignId` must be a string ≤ 64 chars, ASCII.
  - Cap `products` / `targets` / `searchTerms` array sizes (DoS via 10 MB of JSON).

### 5. Auth has no rate limiting, no lockout, no email verification
- **Evidence**: `lib/auth.ts` and `/api/auth/register` have no per-IP / per-account throttle.
- **Risk**: Credential stuffing, account enumeration (the same 400 for "user exists" and "bad input" leaks existence — actually right now it always says "User already exists", which leaks existence), brute force.
- **Fix**:
  - Reverse the registration error: return a generic "Account created" even if email is taken, then send a confirmation email.
  - Add IP-based rate limit on `/api/auth/*` (e.g. 10/min).
  - bcrypt cost: bump from **10 → 12** (cost 10 is below 2024 OWASP guidance for bcrypt).
  - Add a failed-attempt counter on the user, lock after 5.

### 6. No CSRF protection on custom API routes
- **Evidence**: NextAuth handles CSRF for `/api/auth/[...nextauth]`, but `/api/auth/register`, `/api/campaigns/*`, `/api/sync` have no CSRF token check. They rely on cookie-based session + same-origin.
- **Risk**: A logged-in user can be tricked into a cross-site POST that wipes their campaigns.
- **Fix**: Add a `middleware.ts` that double-submits a CSRF token for unsafe methods on `/api/*` (except NextAuth routes). Or require `Content-Type: application/json` + an `Origin`/`Referer` allowlist for state-changing routes.

### 7. `next.config.ts` is missing key security headers
- **Evidence**: Only `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` are set.
- **Missing**: `Strict-Transport-Security` (HSTS), `Content-Security-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.
- **Risk**: XSS amplification, clickjacking on auth pages, no defense-in-depth.
- **Fix**: Add a strict CSP (`default-src 'self'; script-src 'self' 'nonce-…'; …`), HSTS, Permissions-Policy locking down sensors/camera.

---

## 🟠 High (correctness / data integrity)

### 8. `prisma.ts` Proxy loses types
- **Evidence**: `prisma` is `new Proxy({} as PrismaClient, { get: (_t, p) => (getPrisma() as any)[p] })`.
- **Risk**: No autocomplete, `as any` propagates, runtime errors only.
- **Fix**: Export `getPrisma` only; replace `import { prisma }` with `import { getPrisma as prisma }` or use a top-level lazy initialization (`let prisma: PrismaClient; export function prisma() {…}`).

### 9. `selectCampaign(null)` then `setView('campaigns')` in back button
- **Evidence**: `CampaignDetail.tsx:66`.
- **Risk**: Sets selected to null but the store doesn't clear the persisted `selectedCampaignId`. On next reload the user can land on detail view of a deleted campaign. Minor UX bug.
- **Fix**: Use a single `goBack()` action on the store that resets selection + view atomically.

### 10. `CreateCampaignWizard` keeps 11 `useState` calls for child forms
- **Evidence**: `wizard/CreateCampaignWizard.tsx:34-44` — `exactKeywords`, `phraseKeywords`, `broadKeywords`, `asinTargets`, `categoryTargets`, `audienceTargets`, `audienceLookback`, `storeUrl`, `brandId`, `logo`, `headline`, `image`, `video`.
- **Risk**: These belong in the step components. The comment `// (In a real app, use useEffect for this)` is a TODO that the handoff doc itself flags. State can drift between the wizard and child step components.
- **Fix**: Move each form's local state into its own step component. Pass callbacks for `onChange` if parent needs visibility.

### 11. `isFilteredByNegative` short-circuits on first match but `negatives.some` already does this — fine, but it ignores ASIN/category negatives for search term filtering
- **Evidence**: `engine/negative.ts:9-17`. Comment says "ASIN/category/brand negatives don't filter search terms directly", but this is undocumented behavior the simulation may silently violate.
- **Fix**: Document the rule in `types.ts` (which negatives can filter which entity) and add a test that locks the behavior in.

### 12. `JSON.parse` on every API response, per row, per field
- **Evidence**: `campaigns/route.ts:18-31`, `campaigns/[id]/route.ts:29-42`, `sync/route.ts:73-89`.
- **Risk**: Throws on malformed JSON (no try/catch), 500s the entire list. Single corrupted row = no list returned.
- **Fix**: Wrap each `JSON.parse` in try/catch with a safe fallback (e.g. `[]` for arrays, `{}` for objects) and log the bad row. Or move to a typed Prisma `transform`.

### 13. `package.json` versions are forward-dated
- **Evidence**:
  - `next@^16.0.0` (current stable: 15.x)
  - `react@^19.0.0` (released late 2024 — fine)
  - `prisma@^7.8.0` (current stable: 6.x)
  - `vitest@^4.1.10` (current stable: 3.x)
  - `jsdom@^29.1.1` (current stable: 25.x)
  - `next-auth@^5.0.0-beta.31` (still beta)
  - `@types/bcryptjs@^2.4.6` while `bcryptjs@^3.0.3` (mismatch — types are for v2)
  - Migration dir is named `20260720051221_init` (future date)
- **Risk**: `npm ci` will fail or pull pre-release/canary builds. Lockfile drift.
- **Fix**: Pin to known-good versions; run `npm outdated` and align with current LTS. Replace `@types/bcryptjs` (deprecated) with `bcryptjs`'s own types.

### 14. `viewport.userScalable = false`
- **Evidence**: `app/layout.tsx`.
- **Risk**: Accessibility violation (WCAG 1.4.4). Blocks users with low vision.
- **Fix**: Remove that line. Allow zoom.

### 15. No email format validation server-side
- **Evidence**: `register/route.ts:14` only checks `if (!email || !password)`.
- **Risk**: Accepts `notanemail`, breaks login, pollutes DB.
- **Fix**: Add a simple regex check (or use `validator` lib).

### 16. `auth.ts` `authorize` returns `null` on bad password without logging
- **Evidence**: `lib/auth.ts:33-37`.
- **Risk**: Indistinguishable from "user not found" (good for security), but no log = impossible to detect brute force in prod.
- **Fix**: Add a `console.warn` (or better, structured logger) gated behind a flag. Always log **only** the email length / IP, not the password.

---

## 🟡 Medium (architecture / code quality)

### 17. The handoff doc contradicts the package.json
- **Evidence**: `HANDOFF.md` line 7: "Next.js 14, React 18" but `package.json` says Next 16 / React 19.
- **Fix**: Update HANDOFF.md to reflect reality, or roll the version back to a real one.

### 18. Components import the store directly instead of going through custom hooks
- **Evidence**: `CampaignDetail.tsx:14-25` has 7 separate `useAdConsoleStore((s) => s.field)` selectors. Same in `CreateCampaignWizard.tsx:23-31`, `AdConsole.tsx:14-15`, etc.
- **Risk**: Re-renders on any slice change, harder to test, breaks encapsulation. The handoff doc itself flags this.
- **Fix**: Introduce thin domain hooks (`useCampaignDetail(id)`, `useWizard()`, `useFilters()`) that return memoized views. The `hooks/` folder already exists for `useCampaignManager` / `useSearchTerms` / `useCampaignDetail` — extend the pattern.

### 19. `AppStore` type is a megazord
- **Evidence**: `store.ts:67-75` — `CoreSlice & TargetSlice & AdGroupSlice & NegativeSlice & BudgetSlice & PortfolioSlice & QuerySlice & DraftSlice & DrillsSlice & ProfilesSlice & TrainerSlice & BulkSlice & ReportsSlice & MissionsSlice & IntegritySlice & …`.
- **Risk**: `interface segregation` violation. Hard to use only the slice you need in tests, type errors are noisy.
- **Fix**: Export per-slice hook selectors (`useCore()`, `useTargets()`, etc.) and let components compose them. Same `useAdConsoleStore` is fine for the data layer, but the *public* type can be split.

### 20. `Dashboard.tsx` is 242 lines and does heavy work inline
- **Evidence**: `src/components/AdConsole/Dashboard.tsx`.
- **Risk**: Re-renders run the aggregation every time anything changes.
- **Fix**: Memoize KPI tiles with `useMemo` over `filteredCampaigns`. Extract `<KpiRow />`, `<PortfolioBreakdown />` subcomponents.

### 21. The 7 e2e specs are not part of CI
- **Evidence**: `.github/workflows/ci.yml` runs type-check → test → build. No `npm run test:e2e`.
- **Risk**: E2E is "set up but never run on PR" — it rots.
- **Fix**: Add a job with `npx playwright install --with-deps chromium && npm run test:e2e`. Or gate behind a "ready-to-merge" label.

### 22. No ESLint, no Prettier config
- **Evidence**: No `.eslintrc*`, no `eslint.config.*`, no `.prettierrc*`. `package.json` has `lint: next lint` but no config.
- **Risk**: Style drift, no unused-imports check, no `react-hooks/exhaustive-deps` enforcement.
- **Fix**: Add `eslint.config.mjs` (flat config) with `next/core-web-vitals`, `react-hooks`, and `@typescript-eslint/recommended`.

### 23. Engine `useAdConsoleStore` persists the full state to `localStorage`
- **Evidence**: `store.ts:140-155` with key `ad-console-storage`.
- **Risk**: Quota exhaustion on long-running sessions (browsers cap at 5–10 MB), silent data loss on quota error, no migration story.
- **Fix**: `partialize` only user-edit fields (campaigns, draft, filter, view). Add `version` + `migrate` to the persist config.

### 24. The 1 component test (`tabs.test.tsx`) depends on the global store and a `resetAll` action
- **Evidence**: `src/components/AdConsole/__tests__/tabs.test.tsx:13`.
- **Risk**: Tests touch shared state → flaky. Need a `renderWithStore()` helper + a way to reset just the in-memory store.
- **Fix**: Build a `renderWithStore(ui, { initialState })` test util that wraps in a fresh `create()` per test.

### 25. No rate limit / size limit on any API route
- **Evidence**: All routes have no middleware.
- **Fix**: Add a `middleware.ts` with a simple in-memory token bucket for `/api/auth/*` and `/api/sync`.

### 26. `postinstall: prisma generate`
- **Evidence**: `package.json`.
- **Risk**: If `DATABASE_URL` is unset (e.g. CI cache build), install fails. Surprises.
- **Fix**: Only generate when building, not on every install.

---

## 🟢 Low (nice-to-have)

### 27. No structured logging
- Add `pino` or `consola` + a request-id middleware. Replace bare `console.error`.

### 28. `History` is `string[]`
- Replace with `Array<{ id; timestamp; action; payload? }>` for queryability and i18n.

### 29. `simulation.ts` uses `Math.random()` for non-deterministic sims
- Acceptable for a training tool, but tests will flake. Inject a `rand()` function for tests.

### 30. No `OpenTelemetry` / tracing
- Skip for v1, but flag for the multi-user path.

### 31. No accessibility audit
- Components use `<button>` and semantic HTML — good — but no `aria-*` for tabs, no keyboard nav check on the wizard.

### 32. No image optimization
- Product images are placeholder strings. When you wire real images, use `next/image`.

### 33. `HANDOFF.md` references paths that may not exist
- E.g. `src/engine/ad-console/core/scenarios.ts` is in the `exclude` list for coverage but is referenced as core data.

### 34. The `landing/page.tsx` route is unused from `Home`
- `app/page.tsx` renders `<AdConsole />` directly, not landing. Dead route or stub?

### 35. `SyncButton.tsx` is imported by `Topbar` — verify it gracefully handles unauth users
- Likely fine but worth a manual check.

---

## 🔧 Top 10 fixes (priority-ordered)

1. **Add `dev.db` to `.gitignore` and remove from git.** (1 min)
2. **Add request validation to `/api/auth/register`, `/api/campaigns`, `/api/sync`.** Reject oversized payloads. Enforce min budget/bid. (~2 hr)
3. **Wrap sync in a Prisma transaction** and add a request-size cap. (~30 min)
4. **Bump bcrypt cost 10 → 12** and add an in-memory rate limit on `/api/auth/*`. (~1 hr)
5. **Add `eslint.config.mjs`** with `next/core-web-vitals` + `react-hooks` + `@typescript-eslint`. (~30 min)
6. **Add `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy` to `next.config.ts`.** (~30 min)
7. **Move form state from `CreateCampaignWizard` into the step components** it actually belongs in. (~2 hr)
8. **Add the E2E job to CI** (with caching for Playwright browsers). (~1 hr)
9. **Fix version drift**: pin to real stable versions of Next, Prisma, Vitest, jsdom. Drop `@types/bcryptjs` in favor of bcryptjs's own types. (~1 hr)
10. **Add `renderWithStore` + per-slice hooks** so components don't import the global store. (~4 hr, high payoff)

---

## ✅ What's actually good (don't touch)

- **Engine architecture**: SOLID-aligned, focused modules, fail-fast validation, strategy pattern for search terms. TDD-driven. Keep it.
- **Prisma schema** (apart from JSON-as-string tradeoff, which is fine for a simulator): cascade delete, unique `(userId, campaignId)`, indexed FKs.
- **Per-user data isolation**: every API route scopes by `session.user.id` and checks ownership before write. Good.
- **Negative-filtering** logic: matches the user requirement (phrase blocks substring).
- **Tailwind/styling** is a custom design system in `globals.css` — opinionated but consistent, and the no-deps policy is intentional.
- **TypeScript strict mode**: enabled.
- **Search-term generator** is genuinely extensible (OCP) and tested.
- **Documentation set** in `docs/` is comprehensive (ARCHITECTURE, API, SCHEMA, FEATURES, INTEGRATION, AUTH, etc.).
- **Slice composition** in `store.ts` is the right shape; the issue is component-side encapsulation, not the slices themselves.

---

## Summary

**Ship the engine. Don't ship the API yet.** The pure-TS engine is solid and ready; the API surface needs a security and validation pass before any real user data goes through it. The biggest single fix is `dev.db` in git — everything else is incremental hardening.

---

## Appendix: Live Browser Test Results

**Method**: installed Chromium via Playwright, started `npm run dev`, drove a real headless browser through the main flows, captured console errors + screenshots.

### App runtime (sandbox / no DB)

| Flow | Result |
|------|--------|
| `GET /` | HTTP 200, **9 KPI tiles, 6 campaign rows, 19 pills** rendered |
| Click "Create campaign" → wizard | 6 steps, step 1 "Ad type" active, 3 choices (SP/SB/SD) with descriptions |
| Pick SP → Next | advances to step 2 "Basics" |
| Step 2 form | 6 controls (2 text, 1 number, 2 date, 1 more); accepts defaults |
| Skip-fill Next → step 3 | advances to "Products & creative" |
| Click campaign row → detail | 8 tabs (Overview, Ad groups, Targeting, Search terms, Negatives, Budget rules, Placements, Change history) |
| **Console / page / request errors** | **none** |

### Playwright e2e suite (`e2e/*.spec.ts`, 41 tests)

| Result | Count | Notes |
|--------|-------|-------|
| Passed | 25 | Most single-flow tests work |
| Failed | 16 | Mixed: stale selectors + dev server crashed under load |

**Stale selectors (real bugs in tests, not app)**:
- `expect(h1).toContainText("Advertising Dashboard")` → actual is `"Advertising dashboard"` (lowercase d). Retried 14× then failed.
- `expect(.card-title)` → no such class; current UI uses `.section-head`.

**Dev server stability**: running the full suite serially killed `next dev` mid-run. ~16 failures are `ERR_CONNECTION_REFUSED` after the server died, not real product bugs. Works fine for a single user.

**Net**: the app itself is solid for the sandbox use case. The e2e suite is a maintenance debt — selectors drifted from the UI, and the suite is not in CI, so it rots silently. Either fix the selectors or delete the suite.

### Real versions vs `package.json`

`^16.0.0` of `next` resolves to **Next.js 16.2.10 (Turbopack)** — real, not a typo. `prisma@^7.8.0` and `vitest@^4.1.10` did not appear in the install; the lockfile resolved to the highest version under the caret that npm could find. The forward-dated versions called out in the audit stand.

### Note on `dev.db`

The repo ships a 45 KB `dev.db` containing 6 pre-built campaigns from `src/engine/ad-console/core/scenarios.ts`. Confirm with the team whether this file should be **kept** (as a "ready-to-explore" sandbox for new users) or **removed** (per the audit, it leaks any test user data the moment someone registers an account). Recommendation: keep the **scenarios as code**, ship an empty `dev.db` (or seed on first run), and ignore the file.

