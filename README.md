# Amazon Ads Console Training Simulator

> A pixel-faithful Next.js replica of the Amazon Ads Console for training Filipino VAs and eCommerce teams on PPC campaign management — risk-free, offline, with built-in coaching. The UI is a 1:1 reskin of `advertising.amazon.com` with dark slate global nav, grouped left rail, Amazon orange accent, and 9 KPI tiles.

## Quick Start

```bash
cd Amazon-ad-console
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the simulator loads with 4 pre-built training campaigns across SP, SB, and SD.

## What You Can Do

### Campaign Management
- **Create** Sponsored Products (SP), Sponsored Brands (SB), and Sponsored Display (SD) campaigns via step-by-step wizard
- **Toggle** campaign status (Enable / Pause / Archive)
- **Duplicate** campaigns to experiment without losing originals
- **Delete** (archive) campaigns
- **Adjust** daily budgets, default bids, bid strategies, and placement modifiers

### Keyword & Target Operations
- **Add keywords** with Exact, Phrase, or Broad match types at custom bids
- **Remove keywords** (pause / delete targets)
- **Adjust bids** — set exact bid or use ±multiplier
- **Add negative keywords** — Negative exact and Negative phrase
- **Harvest** converting search terms into new targets

### Portfolios & Organizing
- **View** campaigns grouped by portfolio
- **Filter** by campaign type (SP/SB/SD), status, portfolio, and free-text search

### Metrics & Reporting
- **Dashboard** — aggregate metrics across all enabled campaigns
- **Campaign view** — metrics roll up from targets → ad groups → campaign
- **Ad group view** — individual ad group performance
- **Keyword/target view** — per-keyword metrics (impressions, clicks, spend, sales, orders)
- **Derived KPIs** — CTR, CPC, ACoS, ROAS, CVR computed at every level
- **Reports** — generate and export campaign / ad group / target / search term / placement reports as CSV

### Simulation
- **Run 7-day simulation** — generates realistic performance data across all enabled campaigns
- Metrics cascade correctly: keyword → ad group → campaign → dashboard

### Training Features
- **Missions** — scenario-based challenges (Beginner → Advanced) with scoring and hints
- **Guided Drills** — click-by-click navigation coaching with mistake tracking
- **Integrity Center** — automated data-quality checks (orphaned terms, duplicate IDs, creative issues)
- **Bulk Operations** — paste Amazon Ads bulk CSV for validation and preview
- **Trainer Dashboard** — certification checklist, action grading, notes
- **Multi-User Profiles** — separate training state per trainee

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| State | Zustand 5 (single store, 8 slices) |
| Language | TypeScript 5.8 (strict mode) |
| Styling | Global CSS (935 lines, amph-v2 "Field Manual" design system) |
| Engine | Pure TypeScript — zero React/UI dependencies |

## Testing

This project uses **TDD** for the pure business logic in `src/engine/ad-console/core`.
Tests live next to the code they cover (`*.test.ts`) and run on Vitest.

```bash
npm test          # run the suite once
npm run test:watch
```

### Principles enforced by the suite
- **Fail fast** — invalid inputs throw `ValidationError` instead of silently
  clamping or producing `NaN` (see `src/lib/validation.ts`). Covered by tests
  for `calc`, `normalizeCampaign`, and `addTarget`.
- **Single responsibility** — each engine function transforms one thing and
  returns new state; no hidden side effects.
- **DRY / KISS / YAGNI** — shared guards live in one `validation.ts` module;
  no duplicate clamping or re-validation across functions.

To add a feature: write a failing test in `src/engine/ad-console/core/__tests__/`,
then implement the function until green. Keep logic in the engine layer so it
stays framework-free and unit-testable.


## Project Structure

```
Amazon-ad-console/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout + metadata
│   │   ├── page.tsx                # Home → <AdConsole />
│   │   └── globals.css             # Amph-v2 Field Manual design tokens + styles
│   ├── engine/                     # Portable business logic
│   │   └── ad-console/
│   │       ├── core/               # Zero-dep engine
│   │       │   ├── types.ts        # All domain interfaces
│   │       │   ├── engine.ts       # Pure stateless functions
│   │       │   └── scenarios.ts    # Training data & product catalog
│   │       ├── features/           # 7 SOLID feature modules
│   │       │   ├── drills/         # Navigation coaching
│   │       │   ├── profiles/       # Multi-user profiles
│   │       │   ├── trainer/        # Certification & grading
│   │       │   ├── bulk/           # CSV import/validate
│   │       │   ├── reports/        # Report generation & export
│   │       │   ├── missions/       # Scenario challenges
│   │       │   └── integrity/      # Data quality checks
│   │       ├── store.ts            # Composed root Zustand store
│   │       ├── index.ts            # Public API re-exports
│   │       ├── engine.ts           # Backward-compat re-export
│   │       └── types.ts            # Backward-compat re-export
│   └── components/AdConsole/       # React UI layer
│       ├── AdConsole.tsx            # Root view router
│       ├── Dashboard.tsx            # Aggregate metrics
│       ├── CampaignManager.tsx      # Campaign list + filters
│       ├── CampaignDetail.tsx       # Single campaign deep-dive
│       ├── CreateCampaignWizard.tsx # Multi-step creation flow
│       ├── PortfolioOverview.tsx    # Portfolio grouping
│       ├── layout/
│       │   ├── Sidebar.tsx          # Navigation rail
│       │   └── Topbar.tsx           # Header with actions
│       ├── nav/
│       │   ├── consoleNav.ts        # Amazon console nav model (pure data)
│       │   └── __tests__/
│       │       └── consoleNav.test.ts # 8 TDD tests for nav model
│       ├── metrics/
│       │   └── MetricCard.tsx       # Reusable metric display
│       └── features/                # Feature-specific pages
│           ├── drills/DrillsPage.tsx
│           ├── missions/MissionsPage.tsx
│           ├── reports/ReportsPage.tsx
│           ├── bulk/BulkOpsPage.tsx
│           ├── trainer/TrainerPage.tsx
│           └── integrity/IntegrityPage.tsx
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SCHEMA.md
│   ├── FEATURES.md
│   ├── INTEGRATION.md
│   └── TECH-SPECS.md
├── amazon_ppc_simulator.html       # Legacy single-file (v3.4)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run Next.js linter |
| `npm run type-check` | TypeScript type checking |

## Porting to amph-v2

The entire engine layer (`src/engine/ad-console/`) is portable with zero changes:

```ts
// In amph-v2, copy the engine folder and import:
import { useAdConsoleStore } from '@/engine/ad-console/store';
// or use the core engine standalone:
import { calc, simulateDays } from '@/engine/ad-console/core/engine';
```

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for the full porting guide.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — SOLID design, slice composition, data flow
- [API Reference](docs/API.md) — All engine functions with signatures
- [Data Schema](docs/SCHEMA.md) — TypeScript interfaces and data shapes
- [Features](docs/FEATURES.md) — Detailed feature documentation
- [Integration Guide](docs/INTEGRATION.md) — Porting to amph-v2
- [Tech Specs](docs/TECH-SPECS.md) — Dependencies, configuration, performance

## License

MIT
