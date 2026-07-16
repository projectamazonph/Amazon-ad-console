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
| `globals.css` | 935 | Amph-v2 Field Manual design system + all styles |

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
## Styling

### Design System
The UI adopts the **amph-v2 "Field Manual"** design system — dense, scannable, utilitarian. Warm off-white surfaces with an orange accent, auto dark mode via `prefers-color-scheme`.

#### Tokens (CSS Custom Properties on `:root`)

**Surfaces**
| Token | Value | Use |
|-------|-------|-----|
| `--surface-0` | `#FAFAF7` | Page background (warm off-white) |
| `--surface-1` | `#FFFFFF` | Card/panel background |
| `--surface-2` | `#F4F3EE` | Hover states, subtle fills |
| `--surface-3` | `#1A1A1A` | Inverted surfaces (dark mode text bg) |

**Ink (Text)**
| Token | Value | Use |
|-------|-------|-----|
| `--ink-900` | `#171717` | Primary text |
| `--ink-700` | `#404040` | Secondary text |
| `--ink-500` | `#737373` | Muted/label text |
| `--ink-300` | `#D4D4D4` | Disabled text |

**Brand**
| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `#FF6B35` | Primary actions, active nav |
| `--accent-hover` | `#E55A2B` | Hover state |
| `--accent-soft` | `#FFE5D9` | Active background tint |
| `--accent-ink` | `#1A1A2E` | Text on accent (navy, WCAG AA) |

**Semantic**
| Token | Value | Use |
|-------|-------|-----|
| `--success` | `#0E7C3A` | Good metrics, positive delta |
| `--success-soft` | `#DCFCE7` | Success background |
| `--warning` | `#B45309` | Caution, medium ACoS |
| `--warning-soft` | `#FEF3C7` | Warning background |
| `--danger` | `#B91C1C` | Errors, high ACoS |
| `--danger-soft` | `#FEE2E2` | Error background |

**Typography**
| Token | Value |
|-------|-------|
| `--font-display` | Space Grotesk, system-ui |
| `--font-body` | Space Grotesk, system-ui |
| `--font-mono` | JetBrains Mono, ui-monospace |

**Spacing** (4px base): `--space-1` (4px) through `--space-12` (48px)

**Radius**: `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (10px), `--radius-full` (9999px)

**Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg` — subtle, low-opacity

**Dark Mode**: Full `prefers-color-scheme: dark` override — surfaces invert, accent-soft becomes deep burnt orange, shadows darken. No manual toggle needed.

### Layout
- Sidebar: 240px fixed width, sticky, warm white background
- Topbar: 56px height, sticky, border-bottom separator
- Main content: flex-1 with `--space-6` padding
- Metric cards: CSS Grid (`grid-4` responsive), `--radius-lg` borders
- Tables: Full-width with hover highlight on `--surface-2`
- Mobile: Sidebar hides below 768px, grids collapse to 2-col then 1-col

### Fonts
Loaded via `next/font/google`:
- **Space Grotesk** — display and body text (weights 400–700)
- **JetBrains Mono** — code, metrics, financial figures

### Component Patterns
- **Buttons**: `.btn` base with `.primary` (accent), `.danger`, `.ghost` variants; small/medium sizes
- **Cards**: `.card` with `.pad` variant; border + subtle shadow
- **Pills/Badges**: `.pill` with semantic color variants (`.active`, `.green`, `.red`, `.amber`)
- **Inputs**: `.input`, `.select` with accent focus ring
- **Tabs**: Bottom-border active indicator, accent color
- **Toasts**: Fixed bottom-right, semantic color backgrounds, slide-in animation
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
