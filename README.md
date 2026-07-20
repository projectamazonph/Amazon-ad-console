# Amazon Ads Console Training Simulator

> A pixel-faithful Next.js replica of the Amazon Ads Console for training Filipino VAs and eCommerce teams on PPC campaign management — risk-free, offline, with built-in coaching. The UI is a 1:1 reskin of `advertising.amazon.com` with dark slate global nav, grouped left rail (including a Training-tools section), Amazon orange accent, 10 KPI tiles (incl. CPC), and responsive mobile layout with hamburger drawer navigation.

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
- **Add keywords** in one box, applied under any combination of Exact / Phrase / Broad match types at once
- **Automatic targeting** — enable/disable each SP auto group (close match, loose match, substitutes, complements) with its own bid
- **Remove keywords** (pause / delete targets)
- **Adjust bids** — set an exact bid or use ±multiplier; all bids clamped to $0.02–$999.99
- **Manage negatives** — add Negative exact / phrase / ASIN / category, and enable, disable, or remove any negative
- **Harvest** converting search terms into new targets
- Targets, negatives, and search terms are clickable from every table (Campaign Manager, portfolios, detail) and open the campaign where they can be edited

### Portfolios & Organizing
- **View** campaigns grouped by portfolio
- **Filter** by campaign type (SP/SB/SD), status, portfolio, and free-text search

### Metrics & Reporting
- **Dashboard** — aggregate metrics across all enabled campaigns
- **Campaign view** — metrics roll up from targets → ad groups → campaign
- **Ad group view** — individual ad group performance
- **Keyword/target view** — per-keyword metrics (impressions, clicks, spend, sales, orders)
- **Derived KPIs** — CTR, CPC, ACoS, ROAS, CVR computed at every level; **CPC is shown on every metric table** (dashboard, campaign manager, portfolios, ad groups, targets, search terms)
- **Reports** — generate and export campaign / ad group / target / search term / placement reports as CSV

### Simulation
- **Run 7-day simulation** — generates realistic performance data across all enabled campaigns
- Metrics reconcile exactly at every level, every run: `campaign == sum(ad groups) == sum(targets)` (no rounding drift)

### Training Features
- **Missions** — scenario-based challenges (Beginner → Advanced) with scoring and hints
- **Guided Drills** — click-by-click navigation coaching with mistake tracking
- **Integrity Center** — automated data-quality checks (orphaned terms, duplicate IDs, creative issues)
- **Bulk Operations** — paste Amazon Ads bulk CSV for validation and preview
- **Trainer Dashboard** — certification checklist, action grading, notes
- **Multi-User Profiles** — separate training state per trainee

### Multi-User Access
- **User Registration** — create account with email/password (email format + 8-char minimum enforced)
- **Login/Logout** — secure session management via NextAuth
- **Cloud Sync** — when signed in, the account is server-authoritative: it hydrates from the server on login and auto-saves campaign changes (debounced, transactional). Manual Save/Load buttons remain as an escape hatch.
- **Server-side simulation** — `POST /api/simulate` runs the engine over the account on the server and records an audit row
- **Per-User Data** — each user has isolated campaign data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| State | Zustand 5 (single composed store, domain + feature slices) |
| Language | TypeScript 5.8 (strict mode) |
| Styling | Global CSS (premium design system with Amazon-faithful tokens) |
| Engine | Pure TypeScript — zero React/UI dependencies; reused on the server |
| Database | PostgreSQL (Neon) via Prisma 7 + `@prisma/adapter-neon` |
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
│   │   │   ├── campaigns/          # Campaign CRUD API (addressed by engine id)
│   │   │   │   ├── route.ts        # GET/POST campaigns
│   │   │   │   └── [id]/route.ts   # GET/PATCH/DELETE single campaign (PUT alias)
│   │   │   ├── simulate/route.ts   # POST — server-side day simulation + audit
│   │   │   └── sync/route.ts       # Transactional account sync (upsert + prune)
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
│   ├── server/                      # Server-side campaign engine
│   │   ├── db.ts                    # Narrow, testable CampaignDb contract
│   │   ├── campaign-serializer.ts   # Campaign ⇄ DB-row (defensive JSON)
│   │   ├── campaign-service.ts      # Validated CRUD/sync/simulate over the engine
│   │   └── api-helpers.ts           # Session guard + error→HTTP mapping
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── prisma.ts                # Prisma client singleton (Neon adapter)
│   │   ├── cloud-sync.ts            # useCloudSync — login hydrate + debounced autosave
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
- [Authentication Guide](docs/AUTH.md) — Multi-user access, API routes, cloud sync
- [Backend Audit](docs/AUDIT.md) — Backend/server findings and roadmap
- [UI Audit](UI-AUDIT.md) — Live UI walkthrough findings (all fixed)

## License

MIT
