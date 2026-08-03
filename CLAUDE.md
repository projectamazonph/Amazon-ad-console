# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pixel-faithful Next.js replica of the Amazon Ads Console (`advertising.amazon.com`) used to train VAs and eCommerce teams on PPC campaign management — offline, risk-free, with built-in coaching (drills, missions, trainer dashboard, integrity checks). The simulation engine is deliberately isolated from the UI so it can be ported into other apps (see "Porting" below).

## Commands

```bash
npm install             # postinstall runs `prisma generate` automatically
npm run dev              # dev server on :3000
npm run build             # production build (Next.js standalone output)
npm run lint               # next lint
npm run type-check          # tsc --noEmit — run this before considering a change done
npm test                     # vitest run (unit/integration, single pass)
npm run test:watch            # vitest watch mode
npm run test:e2e               # Playwright e2e (auto-boots `npm run dev` on :3000)
npm run test:e2e:ui             # Playwright with UI runner
npx prisma migrate dev           # apply DB migrations (schema.prisma is Postgres)
npx prisma generate               # regenerate client into src/generated/prisma
```

Run a single Vitest test file or test name:
```bash
npx vitest run src/engine/ad-console/core/__tests__/engine.test.ts
npx vitest run -t "adds a keyword target"
```

Run a single Playwright spec:
```bash
npx playwright test e2e/campaign-wizard.spec.ts
```

CI (`.github/workflows/ci.yml`) runs, in order: `type-check` → `test` → `build`. Match that locally before pushing.

Coverage thresholds (vitest.config.ts): 80% statements/functions/lines, 70% branches, over `src/**/*.{ts,tsx}` minus components, tests, `.d.ts` files, `store.ts`, and a couple of named exclusions — see the `coverage.exclude` list for specifics.

## Architecture

Layered, in order of dependency (top depends on bottom, never the reverse):

```text
Next.js App Router (src/app) — pages, layouts, API routes
React components (src/components/AdConsole) — presentation only
Zustand store (src/engine/ad-console/store.ts) — composed of 8 core slices + 7 feature slices
Feature engines (src/engine/ad-console/features/<name>/{types,engine,store}.ts)
Core engine (src/engine/ad-console/core/) — zero framework dependencies, pure functions
```

**`core/engine/`, `core/types.ts`, and `core/simulation.ts` have zero React/Next/Zustand dependencies.** They are pure TypeScript: given state in, return new state out, no mutation, no side effects. This is the most important invariant in the codebase — it's what makes those modules portable and unit-testable in isolation. Never import React, Next.js, or store code into them. Note that `core/slices/` (below) is the one exception within `core/` — it depends on Zustand's `StateCreator` type by design, since its job is to wrap the pure engine in store slices.

- `core/types.ts` — every domain interface (Campaign, AdGroup, Target, Negative, BudgetRule, Portfolio, Metrics, etc.)
- `core/engine/` — one module per domain concern: `campaign.ts`, `target.ts`, `adgroup.ts`, `negative.ts`, `budget.ts`, `portfolio.ts`, `draft.ts`, `id.ts`, `metrics.ts`, `responsive.ts`, `search-term-generator.ts`. All re-exported through `core/engine/index.ts`. `campaign.ts` also exports `isVideoFormat(type, adFormat)`, the single source of truth for which `adFormat` string means "video" for a given campaign type (SB uses `'Video'`, SD uses `'Video creative'`) — used by both the engine and `OverviewTab`.
- `core/simulation.ts` — the 7-day performance simulator; metrics cascade target → ad group → campaign → dashboard.
- `core/slices/` — Zustand-dependent `StateCreator` slices (core, target, adgroup, negative, budget, portfolio, draft) that wrap the pure engine functions with state.
- `features/<name>/` — self-contained modules (`drills`, `profiles`, `trainer`, `bulk`, `reports`, `missions`, `integrity`), each with its own `types.ts`, `engine.ts`, `store.ts`. Adding a feature means adding a new directory here — existing files shouldn't need edits (open/closed).
- `store.ts` — combines every slice into one `AppStore` type via intersection and creates the single Zustand store (localStorage-persisted, with optional cloud sync).

Entity hierarchy the engine models:
```text
Account → Portfolio → Campaign (SP/SB/SD) → AdGroup → Target (keyword/ASIN/category/auto/audience)
                                            → ProductAd / Ad (creative)
                                            → SearchTerm (report data linked to Target)
                                            → Negative (campaign- or ad-group-level)
                                            → BudgetRule
```

Import from the public barrel when consuming the engine from UI code:
```ts
import { calc, simulateDays, useAdConsoleStore } from '@/engine/ad-console';
```
`@/*` maps to `src/*` (tsconfig + vitest alias).

### Data flow
- Client state: `User Action → Component → Store Slice → Engine Function → New State → Re-render`.
- Server-side: `Component → /api/* route → Prisma (Neon adapter) → Postgres`, gated by `auth()` session checks on every route, with all queries scoped by `userId`.
- Persistence is dual: Zustand `persist` middleware keeps state in localStorage for offline/no-login use; `/api/sync` optionally pushes/pulls the same shape to Postgres for logged-in users. Campaign fields that are structurally nested (adGroups, targets, negatives, etc.) are stored as JSON strings in Postgres, not relational tables — see `prisma/schema.prisma`.

### Auth
NextAuth v5 (beta), Credentials provider, JWT sessions, bcrypt password hashing. Config in `src/lib/auth.ts`. Every protected `/api/*` route must check `const session = await auth(); if (!session?.user?.id) return 401`. The two public exceptions are `/api/auth/register` and `/api/auth/[...nextauth]` (login/session handling itself) — those must work without an existing session.

### Database reality check
`prisma/schema.prisma` targets **Postgres** (via `@prisma/adapter-neon`, `src/lib/prisma.ts`), not SQLite — some older docs (README, AGENTS.md) still say SQLite; trust the schema and `.env.example` over those. `DATABASE_URL` and `AUTH_SECRET` are required at runtime for registration/login/sync to work; the simulator itself runs fully client-side without them.

### UI conventions (Astryx design system)
Components come from `@astryxdesign/core` (153 components, theme via `@astryxdesign/theme-neutral`). This is actively used across the component tree (~40 files) — don't hand-roll layout `<div>`s or raw CSS when an Astryx component/prop/token covers it. Key rules (full detail lives in `AGENTS.md`'s Astryx block):
- No raw `<div>` for layout — components handle layout/spacing (`AppShell` for full pages, `SideNav` for sidebar nav). In practice the component layer predates full Astryx adoption and still uses hand-rolled `.app-layout`/`.app-sidebar`/`.app-main` divs throughout (see "known SOLID violations" below) — match the existing pattern in a file rather than mixing conventions mid-component.
- Dense data → `Table`/`List`/`Item` rows edge-to-edge, never Card-wrapped. `Card` is for dashboard widgets/galleries/settings groups only.
- Styling values must be tokens (`var(--color-*|--spacing-*|--radius-*)`) — no raw hex/px, no Tailwind utility classes (this repo has no Tailwind compiler wired up despite Tailwind appearing in some older docs).
- Discover components/props via the CLI: `npm run astryx -- component <Name>`, `npm run astryx -- search "<thing>"`, `npm run astryx -- build "<idea>"`.
- **Never add `padding` (or any box-model property Astryx components expose as a prop) to a bare-selector reset in `globals.css`** (e.g. `*, *::before, *::after { ... }`). Astryx ships its component styles inside `@layer astryx-base`/`@layer astryx-theme`; per the CSS cascade-layers spec, *any* unlayered declaration beats a layered one regardless of specificity. An unlayered `* { padding: 0 }` silently zeroed every Astryx `padding` prop sitewide until it was found and fixed (3.6.0) — the global reset only zeroes `margin`, plus `padding` on the couple of native elements (`ul`, `ol`) that actually need it. If a future reset-like rule needs to beat Astryx's own styling, put it in the unlayered `src/app/astryx-theme.css` bridge scoped to the specific class/selector, not a wildcard.
- Empty states use the shared `EmptyState` component (`src/components/AdConsole/details/EmptyState.tsx`) — icon + title + optional message, not a bare `Card` with a muted paragraph.

### Validation
Engine functions fail fast: invalid input throws `ValidationError` (`src/lib/validation.ts`) rather than silently clamping or producing `NaN`. Follow this pattern for new engine functions — don't add silent fallbacks. `MIN_BID` and `assertValidBid` (also in `src/lib/validation.ts`) enforce the $0.02 platform bid floor for "set an explicit bid" actions (`setTargetBid`, `setAdGroupDefaultBid`); creation/normalization paths (`addTarget`, `normalizeCampaign`) still clamp instead of throwing, since those fill in defaults for incomplete data rather than acting on explicit user intent. Relative adjustments (`adjustTargetBid`, the "±10%" buttons) floor at `MIN_BID` rather than fail fast, since the caller doesn't fully control the resulting value.

## Testing conventions

- Engine/core tests live beside the code in `src/engine/ad-console/**/__tests__/*.test.ts` (TDD — write the failing test first, keep the engine framework-free and easy to test in isolation).
- Component/integration tests: `src/components/AdConsole/__tests__/` (Vitest + React Testing Library).
- Legacy top-level tests: `tests/engine.test.ts`, `tests/next-config.test.ts`.
- E2E specs: `e2e/*.spec.ts` (Playwright, one browser project — chromium — boots the real dev server).
- When changing engine behavior, add/adjust unit tests in the same PR; the engine layer is considered stable and changes without tests should be treated as suspect.

## Working conventions specific to this repo

These come from `AGENTS.md`, `LOOP.md`, `loop-constraints.md`, and `gate.yaml` — they apply to automated/agentic changes here and are good defaults for any change:

- **Never edit without explicit human approval**: `.env`/`.env.*`, `prisma/schema.prisma` or `prisma/migrations/`, `next.config.ts`, `src/lib/auth.ts`, or files matching `*_key*`/`*_secret*` (the latter two patterns are enforced via `gate.yaml`'s denylist).
- Always run `npm run test` before proposing a change as done.
- One fix per change — no drive-by refactors bundled into unrelated work.
- The engine layer (`src/engine/`) is stable; treat changes there as needing test coverage. The component layer has known SOLID violations (`CreateCampaignWizard`, `CampaignManager`, `CampaignDetail`) — refactor incrementally, not all at once, and don't attempt a full rewrite unprompted.
- Don't auto-merge or push without being asked; this repo's own agent-loop tooling (`gate.yaml`, `loop-*.md`) treats `docs/**` and `*.md` as the only auto-mergeable paths and requires human review for everything else.

## Repo layout notes

- `legacy/` holds the pre-Next.js prototype (a single-file `amazon_ppc_simulator.html` with inline JS) and its old QA/docs — historical reference only, not part of the current build.
- `codegraphs/Amazon-ad-console.md` describes that old single-file prototype and is stale relative to the current Next.js/engine architecture described above; don't rely on it.
- `docs/` has deeper reference material: `ARCHITECTURE.md`, `API.md` (full engine function signatures), `SCHEMA.md`, `FEATURES.md`, `INTEGRATION.md` (porting guide), `AUTH.md`, `AUDIT-FOLLOWUPS.md`.
- `CHANGELOG.md` (repo root) tracks notable changes per release starting at 3.6.0; bump `version` in `package.json` (and the unused-but-should-stay-in-sync `coreState.version` in `core/slices/core.ts`) together with a new entry when cutting a release.
- `skills/`, `patterns/`, `gate.yaml`, `STATE.md`, `loop-*.md` support an autonomous triage/fix loop tool used against this repo — not part of the app runtime.
- `.claude/`, `.agents/`, `.codex/` (added via the `ecc-tools` bot PR #56) are an auto-generated agent-tooling bundle: a repo skill, Codex config/agent roles, workflow command scaffolds, and "continuous learning instincts" derived from git-history analysis — not part of the app runtime either. Treat `.claude/skills/Amazon-ad-console/SKILL.md` as unverified: it was generated from commit-history heuristics and contains at least one claim that doesn't match this repo (it says filenames use `camelCase` with invented examples like `adEngine.ts`; the real convention is PascalCase for components (`CampaignManager.tsx`) and lowercase-per-domain-concern for engine modules (`core/engine/campaign.ts`), per the Architecture section above). This file (`CLAUDE.md`) is the authoritative guide — prefer it over the generated skill wherever they disagree.

## Porting the engine

The entire `src/engine/ad-console/` tree is designed to be copied into other apps with zero changes, provided the target app also runs Zustand 5 (`store.ts` and `core/slices/` depend on it — only `core/engine/`, `core/types.ts`, and `core/simulation.ts` are fully dependency-free):
```ts
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, simulateDays } from '@/engine/ad-console/core/engine';
```
See `docs/INTEGRATION.md` for the full guide.
