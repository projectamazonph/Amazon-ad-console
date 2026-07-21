# Amazon Ads Console Training Simulator

> A pixel-faithful Next.js replica of the Amazon Ads Console for training Filipino VAs and eCommerce teams on PPC campaign management — risk-free, offline, with built-in coaching. The UI is a 1:1 reskin of `advertising.amazon.com` with dark slate global nav, grouped left rail, Amazon orange accent, 9 KPI tiles, and responsive mobile layout with hamburger drawer navigation.

## Quick Start

```bash
cd Amazon-ad-console
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the simulator loads with 6 pre-built training campaigns across SP, SB, and SD:

| # | Type | Name | Targeting |
|---|---|---|---|
| 1 | SP | Auto \| Coffee Filter \| Discovery | Automatic |
| 2 | SP | Manual \| Coffee Filter \| Exact Winners | Manual keyword |
| 3 | SB | Video \| Coffee Brand Awareness | Video creative |
| 4 | SD | Views Remarketing \| 30 Day | Audience |
| 5 | SB | Product Collection \| Coffee Variety | Product targeting |
| 6 | SD | Contextual \| Coffee Accessories | Contextual |

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
- **Training** global nav section in the topbar exposes all 6 training-product pages.
- **Drills** — click-by-click navigation coaching with mistake tracking
- **Missions** — scenario-based challenges (Beginner → Advanced) with scoring and hints
- **Reports** — generate and export campaign / target / search-term / placement reports as CSV
- **Bulk Operations** — paste Amazon Ads bulk CSV for validation and preview
- **Trainer Dashboard** — certification checklist, action grading, notes
- **Integrity Center** — automated data-quality checks (orphaned terms, duplicate IDs, creative issues)
- **Multi-User Profiles** — separate training state per trainee

### Multi-User Access
- **User Registration** — create account with email/password
- **Login/Logout** — secure session management via NextAuth
- **Cloud Sync** — save/load campaigns to database
- **Per-User Data** — each user has isolated campaign data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| State | Zustand 5 (single store, 8 slices) |
| Language | TypeScript 5.8 (strict mode) |
| Styling | Global CSS (premium design system with Amazon-faithful tokens) |
| Engine | Pure TypeScript — zero React/UI dependencies |
| Database | Prisma + SQLite (local development) |
| Authentication | NextAuth v5 (credentials provider) |
| Password Hashing | bcryptjs |

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
│   │   ├── layout.tsx              # Root layout + metadata + SessionProvider
│   │   ├── page.tsx                # Home → <AdConsole />
│   │   ├── landing/page.tsx        # Landing page with auth links
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Login page
│   │   │   └── register/page.tsx   # Registration page
│   │   ├── api/
│   │   │   ├── auth/               # NextAuth API routes
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── campaigns/          # Campaign CRUD API
│   │   │   │   ├── route.ts        # GET/POST campaigns
│   │   │   │   └── [id]/route.ts   # GET/PUT/DELETE single campaign
│   │   │   └── sync/route.ts       # Bulk sync campaigns to/from DB
│   │   └── globals.css             # Premium design system tokens + styles
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
│   ├── components/
│   │   ├── AdConsole/              # React UI layer
│   │   │   ├── AdConsole.tsx        # Root view router
│   │   │   ├── Dashboard.tsx        # Aggregate metrics
│   │   │   ├── CampaignManager.tsx  # Campaign list + filters
│   │   │   ├── CampaignDetail.tsx   # Single campaign deep-dive
│   │   │   ├── CreateCampaignWizard.tsx # Multi-step creation flow
│   │   │   ├── PortfolioOverview.tsx # Portfolio grouping
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx      # Navigation rail
│   │   │   │   └── Topbar.tsx       # Header with actions + UserMenu
│   │   │   ├── mobile/
│   │   │   │   └── MobileNav.tsx    # Mobile drawer navigation
│   │   │   ├── nav/
│   │   │   │   └── consoleNav.ts    # Amazon console nav model
│   │   │   ├── metrics/
│   │   │   │   └── MetricCard.tsx   # Reusable metric display
│   │   │   ├── details/             # Tab components
│   │   │   └── features/            # Feature-specific pages
│   │   │       ├── drills/DrillsPage.tsx
│   │   │       ├── missions/MissionsPage.tsx
│   │   │       ├── reports/ReportsPage.tsx
│   │   │       ├── bulk/BulkOpsPage.tsx
│   │   │       ├── trainer/TrainerPage.tsx
│   │   │       └── integrity/IntegrityPage.tsx
│   │   ├── SessionProvider.tsx      # NextAuth session wrapper
│   │   ├── UserMenu.tsx             # User dropdown menu
│   │   └── SyncButton.tsx           # Cloud sync controls
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── validation.ts            # Input validation helpers
│   │   └── useBreakpoint.ts         # Responsive breakpoint hook
│   └── generated/prisma/            # Prisma generated client
├── prisma/
│   ├── schema.prisma                # Database schema (User, Campaign, Simulation)
│   └── migrations/                  # Database migrations
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SCHEMA.md
│   ├── FEATURES.md
│   ├── INTEGRATION.md
│   ├── TECH-SPECS.md
│   ├── MOBILE_REDESIGN_PLAN.md
│   └── AUTH.md                      # Multi-user authentication guide
├── package.json
├── tsconfig.json
├── next.config.ts
└── prisma.config.ts                 # Prisma configuration
```

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run Next.js linter |
| `npm run type-check` | TypeScript type checking |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Generate Prisma client |

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
- [Mobile Redesign Plan](docs/MOBILE_REDESIGN_PLAN.md) — Mobile-first redesign strategy
- [Authentication Guide](docs/AUTH.md) — Multi-user access setup and configuration
- [Audit Follow-Ups](docs/AUDIT-FOLLOWUPS.md) — Status of each finding from the 2026-07-21 audit, with PR links

## License

MIT
