# Audit Follow-Ups

This document tracks fixes applied in response to the security and quality
audit dated **2026-07-21** (report: `Amazon-ad-console-audit-2026-07-21-1.md`).
It is the canonical cross-reference between audit findings, the PRs that
closed them, and the resulting test coverage.

## Release blockers — resolved

| Audit ID | Finding | Resolution | PR |
|---|---|---|---|
| **B-01** | Vercel build failed with `Module not found: ../generated/prisma/client`; no `prisma generate` in the build path | Fixed on `main` before this remediation wave (commit history, not in this doc) | — |
| **B-02** | `new PrismaClient({} as any)` triggered `engine type "client" requires adapter or accelerateUrl` | Fixed on `main` (Postgres driver adapter) | — |
| **B-04** | SQLite is unsuitable for Vercel multi-instance cloud sync | Fixed on `main` (Postgres via `@prisma/adapter-neon`) | — |
| **B-03** | `/api/sync` ran `deleteMany` then `createMany` outside a transaction, so a single bad record could leave the user with an empty cloud account | Wrapped both in `prisma.$transaction(async tx => …)`; returns 500 with "previous cloud data preserved" on any failure; 12 new unit tests | [#24](https://github.com/projectamazonph/Amazon-ad-console/pull/24) |

## High-priority findings — resolved

| Audit ID | Finding | Resolution | PR |
|---|---|---|---|
| **H-01** | The campaign-creation wizard dropped `startDate`, `endDate`, `placements`, `adFormat`, ASIN/Category/Audience targets, and SB/SD creative fields between the draft and the persisted campaign | `launchCampaign` now passes the full draft through. ASIN/Category/Audience target inputs are parsed with the existing `parseKeywords` helper. 9 new tests pin each round-tripped field. | [#26](https://github.com/projectamazonph/Amazon-ad-console/pull/26) |
| **H-02** | The Campaign Manager metric block was shifted one column to the left: the cell under "CPC" actually showed spend, "Spend" showed sales, "Sales" showed orders, and "Orders" showed CPC. Dangerous in a training product. | Reordered the 4 `<td>`s in `ManagerCampaignsTab.tsx`. 3 new tests with pairwise-distinct metric values so any future shift fails loudly. | [#25](https://github.com/projectamazonph/Amazon-ad-console/pull/25) |
| **H-03** | The 6 advertised training-product pages (Drills, Missions, Reports, Bulk ops, Trainer, Integrity) had no nav item or UI control calling `setView()` for any of them — the only way to reach them was to mutate the store by hand | Added a `Training` section to `GLOBAL_NAV` (lands on drills), a shared `TRAINING_RAIL` exposing all 6 training views, and pure helpers `activeTopbarSection(view)` and `sidebarSectionForView(view)` so Topbar/Sidebar/MobileNav share one source of truth. 10 new tests. "← Back to campaigns" added to 5 of the 6 pages. | [#27](https://github.com/projectamazonph/Amazon-ad-console/pull/27) |

## Open findings — not yet addressed

The following findings are documented in the audit but were intentionally
left out of this remediation wave. They are listed here so the next person
picking up the work has a starting checklist.

### High-priority

- **H-04** Reports are fabricated and misaligned. Report rows are randomized
  and do not reflect the user's campaigns; search-term and placement
  reports always contain zero rows; the queue/report id mismatch causes
  the "View" button to select an ID no report owns; the table renders
  9 headers but only 5 data cells; CSV values are not escaped and object
  URLs are not revoked.
- **H-05** Drills and Missions do not observe real user actions. `evaluateDrillAction`
  is read but never called; the "Skip step" button is always visible even on
  `skippable: false` steps; "Back to drills" does not reset session state;
  Mission steps advance through a self-attested "Complete step" button.
- **H-06** Simulation violates metric roll-up invariants. Campaign metrics
  are generated independently then split across targets with rounding,
  so campaign totals, sum-of-targets, and sum-of-ad-groups can disagree.
- **H-07** Local and authenticated user data are not isolated. Every
  visitor uses the same `ad-console-storage` localStorage key; sign-in/out
  does not reset local campaign state; one account can see and upload
  another user's campaigns on a shared browser.
- **H-08** Tailwind classes are absent from dependencies, leaving landing /
  auth / account / sync UI unstyled. **Status: resolved on `main`**
  (commit `f1f72d4` removed Tailwind and added the missing CSS classes).
- **H-09** Mobile navigation dropped tab intent. **Status: resolved on
  `main`** (HEAD `a7a39e0` fixed sidebar/mobile nav overlaps and
  duplicate Create campaign button).
- **H-10** Campaign status UI and child-status logic are incorrect: the
  Overview select ignores the chosen value, archived campaigns show an
  "Enable" button, and parent pause/enable overwrites every child status.
- **H-11** API input and output contracts are unsafe: registration has no
  email canonicalization, password strength, rate limit, or content-type
  validation; campaign POST/PUT accepts arbitrary types/statuses; `dailyBudget || 25`
  silently coerces 0; direct `JSON.parse` can turn one corrupt row into a
  500. Sync route was hardened in B-03; the rest remains.
- **H-12** Dockerfile cannot produce the configured runtime image: no
  `prisma generate`; copies `.next/standalone` but `next.config.ts` does
  not enable `output: 'standalone'`; contradictory `npm ci` flags.

### Medium-priority

The 14 medium findings (M-01 through M-14) cover empty-state traps, draft
engine divergence, duplicate implementations, hydration mismatches, the
bulk CSV parser, placement validation, the cloud download reconcile path,
no URL model for views, clickable `div`s instead of buttons, two
unrelated `actionLog` fields, read-only negatives, and duplicate
campaign-lifecycle code paths.

## Documentation drift — fixed in this wave

| Claim | Was | Now |
|---|---|---|
| README seed count | "4 pre-built training campaigns" | 6 (table with names and targeting modes) |
| README "Training Features" | 6 bullets with no nav mention | Adds a Training global-nav section; explicitly notes reachability |
| `docs/FEATURES.md` training sections | No reachability info | Each training section now has a `Reachable from:` line |
| `.env.example` | Documented as "client-only" with no DATABASE_URL | Already correct on `main` (DATABASE_URL + AUTH_SECRET documented) |

## Test growth

| Stage | Files | Tests |
|---|---:|---:|
| Pre-audit (audit baseline) | 27 | 448 |
| After B-03 (#24) | 28 | 464 |
| After H-02 (#25) | 29 | 467 |
| After H-01 (#26) | 30 | 476 |
| After H-03 (#27) | 30 | 486 |

## How to read this document

- The **Resolved** tables map audit ID → PR → behaviour change. Each PR
  contains a failing test added before the fix, the production code
  change, and a green run of the full suite.
- The **Open findings** section is the next picklist. Items marked
  **resolved on `main`** were fixed by commits that landed before this
  remediation wave; they are kept in the table so the next person can
  grep the report and immediately see the status.
- The **Test growth** table is a quick way to verify each PR landed
  without regressions.
