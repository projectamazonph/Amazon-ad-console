# Amazon Ad Console — Campaign Creation System Handoff Document

> **Source project:** `/root/Documents/Codex/2026-07-16/install-github/Amazon-ad-console`
> **Branch:** `main` (latest)
> **Last reviewed:** 2026-07-20
> **Test status:** 298/305 passing (7 failing due to localStorage in test env), TypeScript compiles clean

---

## 1. Architecture Overview

Next.js + Zustand + pure TypeScript engine + Prisma/SQLite database. SOLID principles throughout.

```
src/
├── engine/ad-console/
│   ├── core/
│   │   ├── types.ts          — All domain interfaces
│   │   ├── engine.ts         — Stateless pure functions (CRUD, simulation, metrics)
│   │   └── scenarios.ts      — Seed data (product catalog, default campaigns)
│   ├── store.ts              — Zustand root store (8 composed slices)
│   ├── index.ts              — Public API re-exports
│   ├── engine.ts             — Re-exports core/engine
│   ├── types.ts              — Re-exports core/types
│   ├── scenarios.ts          — Re-exports core/scenarios
│   └── features/*/           — Drill, profile, trainer, bulk, reports, missions, integrity
├── components/
│   ├── AdConsole/
│   │   ├── AdConsole.tsx          — Root view switcher
│   │   ├── CampaignManager.tsx    — Campaigns/AdGroups/Targets/SearchTerms/Negatives tabs
│   │   ├── CampaignDetail.tsx     — Single campaign detail (8 tabs)
│   │   ├── CreateCampaignWizard.tsx — 6-step campaign creation wizard
│   │   ├── Dashboard.tsx          — Summary metrics
│   │   ├── PortfolioOverview.tsx  — Portfolio view
│   │   ├── metrics/MetricCard.tsx — Metric card display component
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        — Navigation rail
│   │   │   └── Topbar.tsx         — Header with actions + UserMenu
│   │   ├── mobile/
│   │   │   └── MobileNav.tsx      — Mobile drawer navigation
│   │   ├── nav/
│   │   │   └── consoleNav.ts      — Amazon console nav model
│   │   └── features/*/
│   ├── SessionProvider.tsx    — NextAuth session wrapper
│   ├── UserMenu.tsx           — User dropdown menu
│   └── SyncButton.tsx         — Cloud sync controls
├── lib/
│   ├── auth.ts                — NextAuth configuration
│   ├── prisma.ts              — Prisma client singleton
│   ├── validation.ts          — Input validation helpers (ValidationError, assert*)
│   └── useBreakpoint.ts       — Responsive breakpoint hook
├── generated/prisma/          — Prisma generated client
├── app/
│   ├── layout.tsx             — Root layout + SessionProvider
│   ├── page.tsx               — Home → <AdConsole />
│   ├── landing/page.tsx       — Landing page with auth links
│   ├── auth/
│   │   ├── login/page.tsx     — Login page
│   │   └── register/page.tsx  — Registration page
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts — NextAuth API
│       │   └── register/route.ts      — User registration
│       ├── campaigns/
│       │   ├── route.ts       — GET/POST campaigns
│       │   └── [id]/route.ts  — GET/PUT/DELETE single campaign
│       └── sync/route.ts      — Bulk sync campaigns to/from DB
└── prisma/
    ├── schema.prisma          — Database schema (User, Campaign, Simulation)
    └── migrations/            — Database migrations
tests/                         — Additional engine tests
```

**Key principle:** Engine layer has zero React imports. Components have zero business logic. Validation is fail-fast — invalid state never propagates.

---

## 2. Multi-User Access System

### 2.1 Authentication
- **Provider**: NextAuth v5 with credentials (email/password)
- **Session**: JWT tokens stored in HTTP-only cookies
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Database**: SQLite via Prisma ORM

### 2.2 Database Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  campaigns     Campaign[]
  simulations   Simulation[]
}

model Campaign {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaignId    String    // Original campaign ID from the engine
  type          String    // SP, SB, SD
  name          String
  // ... all campaign fields as JSON
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, campaignId])
}
```

### 2.3 API Routes
- `POST /api/auth/register` — Create new user
- `GET/POST /api/campaigns` — List/create campaigns
- `GET/PUT/DELETE /api/campaigns/[id]` — Single campaign CRUD
- `GET/POST /api/sync` — Bulk sync campaigns to/from database

### 2.4 Frontend Components
- `SessionProvider` — Wraps app for client-side session access
- `UserMenu` — Shows avatar, name, dropdown with sign out
- `SyncButton` — "Save" and "Load" buttons to sync campaigns to cloud

---

## 3. Campaign Creation Flow — Per Type (SP/SB/SD)

### 3.1 Wizard Steps

| Step | Name | SP | SB | SD |
|------|------|----|----|-----|
| 1 | Ad type | Choice card → sets `type` + defaults `adFormat` | Same | Same |
| 2 | Basics | Name, portfolio, budget, dates, status, ad format | Same | Same |
| 3 | Products & creative | Product catalog checkboxes + coach tip | Product catalog + Brand name, Headline, Destination | Product catalog + Brand name, Headline |
| 4 | Targeting | Automatic / Manual keyword (3 textareas) / Manual product | Keyword (3 textareas) / Product / Category | Contextual / Views remarketing / Purchases remarketing / Categories |
| 5 | Bidding | Dynamic bids / up-down / fixed | CPC only | CPC / CPC+CPM (audiences) |
| 6 | Review & launch | Full summary → `launchCampaign()` | Same | Same |

### 3.2 Type-Specific Defaults (normalizeCampaign)

| Field | SP | SB | SD |
|-------|----|----|-----|
| `targetingMode` | `Automatic` | `Keyword` | `Contextual` |
| `adFormat` | `Standard` | `Product collection` | `Auto generated` |
| `bidStrategy` | `Dynamic bids - down only` | `Cost per click` | `Cost per click` |
| `creative` | `null` | `{ brandName, logo, headline, ... }` | `{ brandName, logo, headline, ... }` |
| `searchTerms[]` | empty | empty | empty (explicitly) |
| `products` | `['B0TRAIN001']` | same | same |

### 3.3 Simulation Differences

| Type | ROAS Baseline | Quality Bonus Factors |
|------|---------------|----------------------|
| SP | 3.2 | negatives ×0.03, budget rules ×0.02, top placement >30% → +0.04 |
| SB | 2.7 | Same as SP |
| SD | 3.5 | Same + remarketing targeting → +0.05 |

### 3.4 Match Type Search Term Generation (simulateDays)

| Match Type | Generated Terms | ROAS Adj |
|-----------|----------------|----------|
| Exact | Exact keyword + singular/plural variant (2 terms) | 4.0× |
| Phrase | "organic kw", "best kw" (2 terms) | 2.5× |
| Broad | "cheap kw", "kw accessories", "kw deals" (3 terms) | 1.5× |

Generated search terms are filtered against negatives via `isFilteredByNegative()`.

---

## 4. Feature Implementation Status

### 4.1 ✅ Fully Implemented

| Feature | Files | Status |
|---------|-------|--------|
| **Match types (Exact/Phrase/Broad keywords)** | `types.ts`, `CreateCampaignWizard.tsx`, `store.ts`, `engine.ts` | Three textareas in Step 4, parsed into targets at launch, search terms generated per match type in `simulateDays()` |
| **Product selection UI** | `CreateCampaignWizard.tsx`, `CampaignDetail.tsx` | Catalog table + checkbox grid in Step 3, removable pills in detail |
| **Full metrics (Impr, Clicks, CPC, Spend, Sales, Orders, ACOS, ROAS)** | `CampaignManager.tsx`, `CampaignDetail.tsx` | All 8 views show the complete column set |
| **Negative keywords** | `NegativesTab.tsx`, `SearchTermsTab.tsx` | Add negative exact/phrase, negate from search terms |
| **Harvest terms** | `SearchTermsTab.tsx` | Convert search terms to exact keywords |
| **Budget rules** | `BudgetRulesTab.tsx` | Add/remove/update budget rules |
| **Placements** | `PlacementsTab.tsx` | Top of Search, Product pages, Rest of Search adjustments |
| **Portfolio management** | `PortfolioOverview.tsx` | View campaigns grouped by portfolio |
| **Ad group management** | `AdGroupsTab.tsx` | Add/rename/status/bid/remove ad groups |
| **Bulk operations** | `BulkOpsPage.tsx` | CSV import, validation, preview |
| **Reports** | `ReportsPage.tsx` | Generate/export CSV reports |
| **Training missions** | `MissionsPage.tsx` | Scenario-based challenges with scoring |
| **Guided drills** | `DrillsPage.tsx` | Click-by-click coaching |
| **Integrity checks** | `IntegrityPage.tsx` | Data quality auditing |
| **Multi-user auth** | `auth/`, `api/`, `SessionProvider.tsx` | Registration, login, cloud sync |
| **Landing page** | `landing/page.tsx` | Public landing with auth links |
| **Mobile responsive** | `globals.css`, `MobileNav.tsx` | Hamburger menu, touch-optimized |
| **SD Campaign Goal** | `Step4TargetingSD.tsx` | Awareness/Consideration/Conversions selector |
| **Placements hidden for SD** | `CampaignDetail.tsx` | Tab conditionally hidden |
| **Headline character counter** | `Step3ProductsCreativeSB.tsx`, `Step3ProductsCreativeSD.tsx` | 50 char limit with counter |
| **campaignGoal passthrough** | `core.ts` | Wired through launchCampaign |

---

## 5. Test Coverage

```
16 test files, 239+ tests — all passing

Core engine tests (engine.test.ts):          74 tests
Wizard engine tests (wizard-engine.test.ts):   7 tests
Ad group tests (adgroup.test.ts):             14 tests
Budget rules tests (budget-rules.test.ts):    12 tests
Portfolio tests (portfolio.test.ts):           8 tests
Responsive tests (responsive.test.ts):        18 tests
Persistence tests (persistence.test.ts):       8 tests
Feature tests (drills, profiles, etc.):       98 tests
```

---

## 6. Git State

```
Branch: main (up to date with origin/main)
Latest commit: 800c2ba refactor: premium UI redesign with refined typography, surfaces, and mobile support

Recent commits:
- 800c2ba refactor: premium UI redesign with refined typography, surfaces, and mobile support
- e77e27e fix: remove AI design slop across all pages
- 0ab1fca docs: add comprehensive mobile redesign plan
- 1715571 feat: add login/register links to landing page navigation
- e858968 feat: add multi-user access with auth and database
```

---

## 7. Quick Start Commands

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Run tests
npx vitest run

# TypeScript check
npx tsc --noEmit

# Start dev server
npm run dev
```

---

## 8. Documentation

- [Architecture](ARCHITECTURE.md) — SOLID design, slice composition, data flow
- [API Reference](API.md) — All engine functions with signatures
- [Data Schema](SCHEMA.md) — TypeScript interfaces and data shapes
- [Features](FEATURES.md) — Detailed feature documentation
- [Integration Guide](INTEGRATION.md) — Porting to amph-v2
- [Tech Specs](TECH-SPECS.md) — Dependencies, configuration, performance
- [Mobile Redesign Plan](MOBILE_REDESIGN_PLAN.md) — Mobile-first redesign strategy
- [Authentication Guide](AUTH.md) — Multi-user access setup and configuration

---

*Document generated: 2026-07-20 | Codebase verified against HANDOFF.md*
