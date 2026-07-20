# Codebase Audit — Amazon Ad Console Simulator

**Date:** 2026-07-20 · **Branch:** `claude/backend-engine-ad-console-audit-r51nrh`
**Baseline at audit time:** 448 unit tests passing, `tsc --noEmit` clean, `next build` clean.

This audit covers architecture, correctness, security, data integrity, and how far
the backend is from behaving like the real Amazon Ads console. Items marked
**[FIXED]** were addressed on this branch; the rest are recommendations.

---

## 1. Summary

The client-side engine (`src/engine/ad-console/`) is the strongest part of the
codebase: pure, modular, well-typed, and covered by 400+ tests. The backend,
however, was largely decorative before this branch:

- The simulator ran entirely in the browser (Zustand + localStorage). The server
  had no authority over account state.
- `/api/campaigns` and `/api/campaigns/[id]` were **dead code** — nothing in the
  frontend called them, and `[id]` was addressed by internal DB row id while
  every other surface used the engine's campaign id.
- Cloud sync was a manual button pair doing **delete-all-then-recreate** with no
  transaction — a mid-sync failure would wipe the user's cloud data.
- The DB schema **silently dropped fields** (`productAds`, `ads`, `portfolioId`,
  `creativeStatus`, `creativeIssue`, `createdBySimulator`) on every round-trip.
- The `Simulation` Prisma model existed but was never written to.

## 2. Findings

### Critical

| # | Finding | Status |
|---|---------|--------|
| C1 | **Destructive sync**: `POST /api/sync` ran `deleteMany` then `createMany` without a transaction. A failure between the two calls permanently deleted all cloud campaigns. Row ids and `createdAt` were also churned on every sync. | **[FIXED]** — transactional upsert-and-prune in `src/server/campaign-service.ts` (`syncCampaigns`), preserving row identity. |
| C2 | **Round-trip data loss**: the `Campaign` table had no columns for `productAds`, `ads`, `portfolioId`, `creativeStatus`, `creativeIssue`, `createdBySimulator`. Loading from cloud returned campaigns missing arrays the engine dereferences (e.g. `c.productAds.map(...)` in `toggleCampaignStatus`) → runtime crash risk after a cloud load. | **[FIXED]** — schema + additive migration `20260720171000_campaign_full_round_trip`; serializer round-trips the full engine shape and every load passes through `normalizeCampaign`. |
| C3 | **Corrupt row takes down the account**: every API route did bare `JSON.parse` on ten columns; one malformed value made `GET /api/sync` / `GET /api/campaigns` throw 500 for the whole account. | **[FIXED]** — defensive per-field parse with fallbacks in `src/server/campaign-serializer.ts`; unparseable rows are skipped in list views instead of failing them. |

### High

| # | Finding | Status |
|---|---------|--------|
| H1 | **`/api/campaigns` routes were dead and inconsistent**: unused by the UI; `[id]` keyed on the Prisma row id (which no client ever sees) while sync keyed on the engine id; `POST` crashed with a DB constraint error (500) on duplicate `campaignId`, and `campaignId` was not even required by the handler despite being `NOT NULL`. | **[FIXED]** — routes rewritten as thin wrappers over a tested service layer; `[id]` is the engine campaign id; duplicates return 409; validation returns 400. `PATCH` added (PUT kept as alias). |
| H2 | **No input validation on any mutation route**: budgets of `-5`, bids of `0`, bogus `type`/`status` strings were persisted verbatim. `dailyBudget: rest.dailyBudget \|\| 25` also silently turned `0` into `25`. | **[FIXED]** — `validateCampaignInput` enforces name, type, status, `dailyBudget ≥ $1`, `defaultBid ≥ $0.02`; all payloads normalize through the engine's `normalizeCampaign`. |
| H3 | **Server had no engine**: simulation only ran in the browser; the `Simulation` model was never used, so there was no server-side record of account activity. | **[FIXED]** — `POST /api/simulate` runs the same `simulateDays` engine server-side against the DB, persists results transactionally, and writes a `Simulation` audit row. |
| H4 | **Persistence was opt-in and manual**: users had to remember to press "↑ Save"; everything else lived only in one browser's localStorage — the opposite of how the real console works. | **[FIXED]** — `useCloudSync` (`src/lib/cloud-sync.ts`): on login the store hydrates from the server (server-authoritative); first login seeds the server from the local sandbox; afterwards campaign mutations auto-save with a 2s debounce. Manual buttons remain as an escape hatch. |
| H5 | **Registration accepted anything**: no email format check, 1-character passwords allowed. | **[FIXED]** — email regex + minimum 8-character password (400 otherwise). |

### Medium (recommendations — not fixed on this branch)

| # | Finding | Recommendation |
|---|---------|----------------|
| M1 | **User enumeration**: `/api/auth/register` returns "User already exists", and no rate limiting exists on register/login. | Return a generic message; add rate limiting (e.g. an edge middleware or Upstash-style limiter) before production use. |
| M2 | **JSON-blob storage model**: child entities (ad groups, targets, search terms) are JSON strings on the `Campaign` row. Works for a training simulator, but blocks per-entity queries, date-ranged reporting, and concurrent edits. | The relational design already sketched in `api-route-mapping.md` (Campaign → AdGroup → Keyword/Target → PerformanceMetric rows) is the right next step if the product should keep converging on the real console. |
| M3 | **Metrics are lifetime totals, not a time series**: the real console is date-range-driven; the engine accumulates single counters, so a date picker can never be honest. | Introduce a `PerformanceMetric`-per-day model (schema for it is also in `api-route-mapping.md`) and have `simulateDays` emit daily rows. |
| M4 | **Last-write-wins sync**: two browsers logged into the same account will overwrite each other (no versioning/updatedAt conflict check). | Add an `updatedAt`/revision check to `POST /api/sync` and surface a conflict to the client. |
| M5 | **`merge` in the Zustand `persist` config is a shallow spread**: a stale persisted snapshot with missing keys silently shadows newer defaults. Low impact today because only `state` is partialized. | Version the persisted state (`version` + `migrate` options of `persist`). |

### Low / hygiene

| # | Finding | Recommendation |
|---|---------|----------------|
| L1 | Root directory clutter: `amazon_ppc_simulator*.{html,js,py,md,json}` (v3.3/v3.4 artifacts), `CampaignManager.jsx (1).txt`, `ppc-simulator-schema.prisma (1).txt`, `v3.3-port-analysis.md` are legacy one-off files committed at the root. | Move to `legacy/` or delete; they confuse tooling and new contributors. |
| L2 | `dev.db` (SQLite binary) is committed while the Prisma datasource is PostgreSQL — it is dead weight and misleading. | Delete and add `*.db` to `.gitignore`. |
| L3 | Duplicate barrel files: `src/engine/ad-console/engine.ts`, `core/engine.ts`, and `core/engine/index.ts` are three layers of re-export kept "for backward compatibility". | Collapse to one barrel and codemod imports. |
| L4 | `HANDOFF.md` exists at both root and `docs/HANDOFF.md` with diverging content. | Keep one. |
| L5 | Coverage config excludes all of `src/components/**` — component tests exist (`__tests__/tabs.test.tsx`, `hooks.test.ts`) but don't count toward thresholds. | Re-include components once coverage is realistic. |
| L6 | **E2E suite was broken by the UI redesign** (PR #18): stale `h1` casing ("Advertising Dashboard" vs "Advertising dashboard"), removed `.card-title` selectors, and history-tab assertions against table rows that are now `.timeline-item`s — 10 of 41 tests failed. E2E is also not part of CI, which is how the drift went unnoticed. | **[FIXED]** — specs updated to current markup; all 41 pass. Consider adding a Playwright job to CI. `playwright.config.ts` now honors `PLAYWRIGHT_CHROMIUM_PATH` for sandboxed environments with a pre-installed browser. |
| L7 | Running the dev server without `AUTH_SECRET` floods the console with `[auth][error] MissingSecret` on every session poll (the app still works signed-out). | Document it, or make `auth.ts` fall back to a generated dev-only secret outside production. |

## 3. What "backend engine as the real ad console" now looks like

After this branch, a signed-in user's account behaves server-authoritatively:

```
Browser (Zustand engine, optimistic)          Server (source of truth)
────────────────────────────────────          ─────────────────────────────
login ──────────────────────────────────────▶ GET /api/sync (hydrate store)
mutate campaigns (wizard, bids, negatives) ─▶ POST /api/sync   (debounced auto-save,
                                                               transactional upsert+prune)
                                              POST /api/simulate {days}
                                                → runs engine simulateDays on the DB
                                                → persists campaigns + Simulation audit row
CRUD per campaign  ─────────────────────────▶ GET/POST /api/campaigns
                                              GET/PATCH/DELETE /api/campaigns/[id]
                                                (engine ids, 400/404/409 semantics)
```

Key properties, all covered by `src/server/__tests__/campaign-service.test.ts`
(16 tests, no live DB needed — the service layer runs against a narrow
`CampaignDb` contract):

- Full-fidelity round-trip of the engine `Campaign` shape.
- Validation identical in spirit to the console (min budget $1, min bid $0.02,
  required name, enum-checked type/status).
- Per-user isolation on every operation.
- Non-destructive, transactional sync.
- Server-side simulation with an audit trail.

## 4. Suggested roadmap (beyond this branch)

1. **Relational schema** (M2) → per-entity routes as mapped in `api-route-mapping.md`.
2. **Daily performance rows** (M3) → real date-range picker and honest reports.
3. **Conflict-aware sync** (M4).
4. **Auth hardening** (M1): rate limiting, generic errors, optional email verification.
5. **Repo hygiene sweep** (L1–L4).
