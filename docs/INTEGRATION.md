# Integration Guide — Porting to amph-v2

The Amazon Ad Console engine is designed to be portable. This guide covers integrating it into the amph-v2 project.

---

## Prerequisites

- amph-v2 running Next.js 16 + Zustand 5
- Same TypeScript configuration (`@/*` path alias)
- Same dependency versions (React 19, Zustand 5)

## Step 1: Copy the Engine

The engine layer has **zero external dependencies** — it is pure TypeScript.

```bash
# From Amazon-ad-console root:
cp -r src/engine/ad-console /path/to/amph-v2/src/engine/ad-console
```

This gives amph-v2:
```
amph-v2/src/engine/ad-console/
├── core/
│   ├── types.ts        # All domain interfaces
│   ├── engine.ts       # Pure business logic
│   └── scenarios.ts    # Training data
├── features/
│   ├── drills/         # Navigation coaching
│   ├── profiles/       # Multi-user profiles
│   ├── trainer/        # Certification
│   ├── bulk/           # CSV import
│   ├── reports/        # Report generation
│   ├── missions/       # Scenario challenges
│   └── integrity/      # Data quality
├── store.ts            # Composed Zustand store
├── index.ts            # Public API
├── engine.ts           # Backward-compat re-export
└── types.ts            # Backward-compat re-export
```

## Step 2: Copy Components (Optional)

If you want the full UI:

```bash
cp -r src/components/AdConsole /path/to/amph-v2/src/components/AdConsole
```

## Step 3: Register in amph-v2 Engine Registry

amph-v2 uses an engine registry pattern. Add the ad-console module:

```ts
// amph-v2/src/engine/registry.ts
import { useAdConsoleStore } from './ad-console/store';

export const engines = {
  // ... existing engines
  'ad-console': {
    store: useAdConsoleStore,
    name: 'Amazon Ads Console',
    version: '3.5.0',
  },
};
```

## Step 4: Add Route

Create a page in amph-v2's app router:

```tsx
// amph-v2/src/app/(training)/ad-console/page.tsx
import { AdConsole } from '@/components/AdConsole/AdConsole';

export default function AdConsolePage() {
  return <AdConsole />;
}
```

## Step 5: Import Only What You Need

The engine supports selective imports:

### Full Engine
```ts
import { useAdConsoleStore } from '@/engine/ad-console/store';
```

### Core Only (no feature modules)
```ts
import { calc, simulateDays, normalizeCampaign } from '@/engine/ad-console/core/engine';
import type { Campaign, Metrics } from '@/engine/ad-console/core/types';
```

### Single Feature
```ts
import { runIntegrityCheck } from '@/engine/ad-console/features/integrity/engine';
import type { IntegrityReport } from '@/engine/ad-console/features/integrity/types';
```

### Store Slices (for custom composition)
```ts
import { createDrillsSlice } from '@/engine/ad-console/features/drills/store';
import { createIntegritySlice } from '@/engine/ad-console/features/integrity/store';
```

## Architecture Compatibility

### amph-v2 Existing Pattern
```
amph-v2/src/engine/
├── listing-audit/
│   ├── types.ts
│   ├── engine.ts
│   └── scenarios.ts
├── keyword-research/
│   ├── types.ts
│   └── engine.ts
├── str-triage/
│   ├── types.ts
│   ├── engine.ts
│   └── scenarios.ts
├── registry.ts
└── scoring.ts
```

### After Integration
```
amph-v2/src/engine/
├── ad-console/          # NEW — the full module
│   ├── core/
│   ├── features/
│   ├── store.ts
│   └── index.ts
├── listing-audit/       # existing
├── keyword-research/    # existing
├── str-triage/          # existing
├── registry.ts          # updated
└── scoring.ts           # existing
```

## Style Considerations

The ad-console uses global CSS (`globals.css`). For amph-v2 integration:

### Option A: CSS Modules (Recommended)
Convert the global styles to CSS modules:
```css
/* amph-v2/src/components/AdConsole/AdConsole.module.css */
.app-layout { display: flex; height: 100vh; }
.app-sidebar { width: 220px; background: var(--surface-100); }
/* ... */
```

### Option B: Global CSS
Import the ad-console styles in amph-v2's global stylesheet:
```css
/* amph-v2/src/styles/globals.css */
@import '../../components/AdConsole/styles/ad-console.css';
```

### Option C: CSS Variables Only
The ad-console already uses CSS custom properties (`--ink-100`, `--surface-200`, etc.). Map these to amph-v2's design tokens:
```css
/* amph-v2/src/styles/variables.css */
:root {
  --ink-100: #0F1111;
  --ink-200: #565959;
  --surface-100: #FFFFFF;
  --surface-200: #F7F8F8;
  /* ... match amph-v2's existing palette */
}
```

## Testing the Integration

```bash
cd amph-v2
npm run dev
# Navigate to /ad-console
```

Verify:
1. Dashboard loads with 4 default campaigns
2. Campaign manager shows filtering and search
3. Campaign detail shows all tabs (Overview, Targets, Search Terms, etc.)
4. Add/remove keywords works
5. Bid adjustments save correctly
6. Simulation generates cascading metrics
7. All 5 drills work end-to-end
8. Reports generate and export as CSV
9. Integrity check runs and shows issues
10. State persists during session (Zustand in-memory)

## Zero-Dependency Guarantee

The engine layer imports only:
- `zustand` — for store creation (can be replaced with any state manager)
- TypeScript standard library — `Date`, `Set`, `Math`, `Array`, `JSON`

It does NOT import:
- React
- Next.js
- Any UI library
- Any database/ORM

This means the engine can also run in:
- Node.js scripts
- Web Workers
- Server-side API routes
- CLI tools
