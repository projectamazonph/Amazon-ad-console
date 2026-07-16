# Architecture

## Design Philosophy

The Amazon Ad Console follows **SOLID principles** with strict separation between business logic (engine) and presentation (React UI). The engine layer has **zero framework dependencies** — it is pure TypeScript that can run in any JavaScript environment.

## Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js App Router (pages/layout)          │
├─────────────────────────────────────────────┤
│  React Components (UI layer)                │
│  Components/AdConsole/*                     │
├─────────────────────────────────────────────┤
│  Zustand Store (state management)           │
│  store.ts — composed root store             │
│  8 independent slices                       │
├─────────────────────────────────────────────┤
│  Feature Engines (per-module business logic)│
│  features/drills/engine.ts                  │
│  features/profiles/engine.ts                │
│  features/trainer/engine.ts                 │
│  features/bulk/engine.ts                    │
│  features/reports/engine.ts                 │
│  features/missions/engine.ts                │
│  features/integrity/engine.ts               │
├─────────────────────────────────────────────┤
│  Core Engine (zero dependencies)            │
│  core/engine.ts — stateless pure functions  │
│  core/types.ts — all domain interfaces      │
│  core/scenarios.ts — training data          │
└─────────────────────────────────────────────┘
```

## SOLID Principles Applied

### Single Responsibility
Each feature module owns exactly one concern:
- `drills/` — navigation coaching and scoring
- `profiles/` — multi-user trainee management
- `trainer/` — certification checklist and action grading
- `bulk/` — CSV parsing and validation
- `reports/` — report generation and CSV export
- `missions/` — scenario-based challenges
- `integrity/` — data quality auditing

### Open/Closed
The store is composed via `StateCreator` slices. Adding a new feature means creating a new `features/<name>/` directory with `types.ts`, `engine.ts`, `store.ts` — no existing files need modification.

### Liskov Substitution
All store slices implement independent `StateCreator<T>` interfaces. The root store combines them via intersection (`CoreSlice & DrillsSlice & ...`) — any slice can be swapped or mocked independently.

### Interface Segregation
Each feature exports its own typed slice interface (`DrillsSlice`, `ProfilesSlice`, etc.). Components import only the slice types they need. The core `AppStore` type is a composition of all slices.

### Dependency Inversion
- Components depend on the `useAdConsoleStore` hook (abstraction), not on concrete state shape
- Feature engines depend only on `core/types.ts` interfaces (abstractions)
- Core engine has zero external dependencies

## Zustand Slice Composition

The root store is composed at `src/engine/ad-console/store.ts`:

```ts
export type AppStore =
  CoreSlice           // campaign state, filters, draft
  & DrillsSlice       // drill sessions & results
  & ProfilesSlice     // multi-user profiles
  & TrainerSlice      // certification & grading
  & BulkSlice         // CSV parse/validate
  & ReportsSlice      // report queue & generation
  & MissionsSlice     // scenario sessions
  & IntegritySlice    // data quality reports
  & { /* all actions */ };
```

Each slice follows the pattern:
1. **`types.ts`** — defines the slice's interfaces
2. **`engine.ts`** — pure functions that transform data
3. **`store.ts`** — `StateCreator` that wires engine functions to state updates

The single hook `useAdConsoleStore` provides access to all state and actions.

## Data Flow

### Campaign CRUD
```
User action → Component calls store method → Store calls engine function → Returns new Campaign → State updated → Component re-renders
```

### Metrics Rollup (Bottom-Up)
```
Target metrics (per keyword/target)
    ↓ aggregate
Ad Group metrics (sum of targets in group)
    ↓ aggregate
Campaign metrics (sum of ad groups)
    ↓ aggregate
Dashboard metrics (sum of all enabled campaigns)
```

This is computed via `totalMetrics()` in `core/engine.ts` and via the `simulateDays()` function which cascades metrics from targets upward.

### Simulation Flow
```
runSimulation(days) 
  → simulateDays(campaigns, days)
    → For each campaign:
      → Calculate daily CTR/CPC/conversion rates
      → Generate impressions → clicks → conversions
      → Distribute across targets proportionally
      → Sum target metrics into ad group metrics
      → Sum ad group metrics into campaign metrics
    → Return updated campaigns
  → Store updates with new campaign data
```

## File Organization Rules

### Engine Layer (`src/engine/ad-console/`)
- **No React imports** — pure TypeScript only
- **No side effects** — all functions are deterministic given the same input
- **Immutable updates** — functions return new objects, never mutate inputs
- **Portable** — can be copied to any project without modification

### Component Layer (`src/components/AdConsole/`)
- **'use client'** directive on all interactive components
- **Single hook** — all state via `useAdConsoleStore`
- **No business logic** — components only render and dispatch actions
- **Feature isolation** — feature pages live in `features/<name>/`

### Backward Compatibility
Two re-export files maintain compatibility with older imports:
- `src/engine/ad-console/engine.ts` → re-exports `core/engine.ts`
- `src/engine/ad-console/types.ts` → re-exports `core/types.ts`

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `CampaignManager.tsx` |
| Engine/type files | camelCase | `engine.ts`, `types.ts` |
| Store slices | `create<X>Slice` | `createDrillsSlice` |
| Component exports | PascalCase function | `export function CampaignManager()` |
| Engine functions | camelCase | `simulateDays()`, `calc()` |
| Type prefixes | None (TypeScript interface) | `Campaign`, `Metrics`, `DrillSession` |
| Feature directories | lowercase | `features/drills/` |
| Route aliases | `@/*` → `./src/*` | `@/engine/ad-console/store` |

## Scalability Notes

- Each feature module is independently testable via its engine functions
- New features require only: types + engine + store slice + UI component
- The engine can be extracted to an npm package for shared use across projects
- Zustand's subscription model ensures only affected components re-render
