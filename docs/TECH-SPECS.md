# Technical Specifications

## Runtime Requirements

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18.0 |
| npm | ≥ 9.0 |
| TypeScript | ~5.8 |

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.0.0 | React framework (App Router) |
| `react` | ^19.0.0 | UI library |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `zustand` | ^5.0.0 | State management |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/node` | ^22.0.0 | Node.js type definitions |
| `@types/react` | ^19.0.0 | React type definitions |
| `@types/react-dom` | ^19.0.0 | ReactDOM type definitions |
| `typescript` | ~5.8.0 | TypeScript compiler |

**Total runtime dependency count: 4** (next, react, react-dom, zustand)

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Key settings:
- **strict mode**: All strict type-checking options enabled
- **ES2022 target**: Modern JavaScript output
- **Bundler resolution**: Compatible with Next.js bundler
- **Path alias**: `@/*` maps to `./src/*`

## Next.js Configuration

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
};
```

Minimal configuration. No custom webpack, no env files, no middleware.

## File Statistics

| Directory | Files | Total Lines |
|-----------|-------|------------|
| `src/engine/ad-console/core/` | 3 | ~800 |
| `src/engine/ad-console/features/` | 21 | ~1,800 |
| `src/engine/ad-console/` (root) | 4 | ~220 |
| `src/components/AdConsole/` | 15 | ~1,800 |
| `src/app/` | 3 | ~530 |
| **Total src/** | **46** | **~5,150** |

### Source File Breakdown

| File | Lines | Responsibility |
|------|-------|---------------|
| `core/types.ts` | ~180 | All domain interfaces |
| `core/engine.ts` | ~560 | Core business logic |
| `core/scenarios.ts` | ~135 | Training data & product catalog |
| `store.ts` | ~194 | Composed root Zustand store |
| `CampaignDetail.tsx` | 436 | Campaign deep-dive view |
| `CampaignManager.tsx` | 300 | Campaign list view |
| `CreateCampaignWizard.tsx` | 227 | Campaign creation wizard |
| `globals.css` | 522 | All styles |

## Data Architecture

### State Shape
```
AppStore
├── CoreSlice
│   ├── state: AdConsoleState
│   │   ├── campaigns: Campaign[]
│   │   ├── filter: FilterState
│   │   ├── selectedCampaignId: string | null
│   │   ├── selectedTab: string
│   │   ├── simulationDays: number
│   │   └── actionLog: ActionLogEntry[]
│   ├── draft: CampaignDraft
│   ├── wizardStep: number
│   ├── view: string
│   └── showAddKeywordForm: boolean
├── DrillsSlice
│   ├── drillSession: DrillSession
│   └── drillResults: DrillResult[]
├── ProfilesSlice
│   ├── activeProfileId: string
│   └── profiles: TraineeProfile[]
├── TrainerSlice
│   ├── notes: TrainerNote[]
│   ├── actionLog: ActionGrade[]
│   └── certificationChecklist: CertificationItem[]
├── BulkSlice
│   ├── bulkInput: string
│   ├── bulkPreview: BulkRow[]
│   ├── bulkErrors: BulkValidationError[]
│   └── bulkValid: boolean
├── ReportsSlice
│   ├── reportQueue: ReportRequest[]
│   ├── reports: Report[]
│   └── selectedReportId: string | null
├── MissionsSlice
│   ├── missions: Mission[]
│   └── missionSession: MissionSession
└── IntegritySlice
    └── integrityReport: IntegrityReport | null
```

### Campaign Hierarchy
```
Campaign
├── AdGroup[]           (1-N, default 1)
│   └── metrics: Metrics
├── Target[]            (0-N)
│   ├── type: Keyword | Auto | ASIN | Category | Audience
│   ├── match: Exact | Phrase | Broad | Auto
│   └── metrics: per-target
├── SearchTerm[]        (0-N)
│   ├── term: customer query
│   ├── target: matched target
│   └── recommendation: Add | Negate | Review
├── Negative[]          (0-N)
│   └── type: Negative exact | Negative phrase
├── BudgetRule[]        (0-N)
├── products: string[]  (ASINs)
├── creative: Creative | null
├── metrics: Metrics    (campaign-level)
└── history: string[]   (change log)
```

### Metrics Cascade
```
Target.impressions + Target.clicks + ... 
    ↓ sum by adGroupId
AdGroup.metrics 
    ↓ sum by campaign
Campaign.metrics
    ↓ sum enabled campaigns
Dashboard (totalMetricsCalc)
```

## Simulation Engine

The `simulateDays()` function generates realistic performance data:

### Daily Rate Calculation
```
dailyImpressions = (budget / avgCPC) × (ctr / 100) × variance
dailyClicks = dailyImpressions × (ctr / 100)
dailySpend = dailyClicks × avgCPC
dailyOrders = dailyClicks × (cvr / 100)
dailySales = dailyOrders × avgOrderValue × variance
```

### Variance
Each day uses a random variance factor within configurable bounds to prevent identical daily outputs.

### Target Distribution
Metrics are distributed across targets proportionally to their existing share of total impressions. This preserves the relative performance profile of each campaign.

## Performance Characteristics

- **Rendering**: Only components that read changed store slices re-render (Zustand selectors)
- **State updates**: Immutable — each action returns a new state tree
- **Simulation**: O(n × m) where n = campaigns, m = targets per campaign
- **Memory**: In-memory only — no persistence layer. State resets on page refresh.
- **Bundle size**: Minimal — 4 runtime deps, no UI library, no chart library

## Styling

### Design System
Amazon-themed color palette via CSS custom properties:

```
--ink-100: #0F1111     (primary text)
--ink-200: #565959     (secondary text)
--ink-300: #8D9096     (muted text)
--surface-100: #FFFFFF (card background)
--surface-200: #F7F8F8 (page background)
--accent-500: #FF9900  (Amazon orange — CTAs, active states)
--accent-600: #E47911  (hover state)
--success: #067D62     (good metrics)
--warning: #B12704     (warning metrics)
--error: #CC0C39       (bad metrics)
```

### Layout
- Sidebar: 220px fixed width
- Main content: flex-1 with padding
- Metric cards: CSS Grid, responsive
- Tables: Full-width with hover states

## Portability Guarantees

The engine layer (`src/engine/ad-console/`) is guaranteed to be:
- **Framework-free**: No React, Vue, Angular imports
- **Runtime-agnostic**: Works in Node.js, browsers, Web Workers
- **State-manager agnostic**: Pure functions — can be used with Redux, MobX, React Context, or no state manager
- **Zero config**: No environment variables, no config files, no build steps required
- **Type-safe**: Full TypeScript with strict mode

## Compatibility Matrix

| Target Environment | Engine | Store | Components |
|-------------------|--------|-------|------------|
| amph-v2 (Next.js 16) | ✅ Copy | ✅ Use directly | ✅ Copy |
| Standalone Node.js | ✅ Import | ⚠️ Requires zustand | ❌ No DOM |
| Web Worker | ✅ Import | ⚠️ Requires zustand | ❌ No DOM |
| React SPA (Vite) | ✅ Import | ✅ Use directly | ✅ Copy with CSS |
| Legacy HTML | ⚠️ Port functions | ❌ No Zustand | ❌ Rewrite UI |
