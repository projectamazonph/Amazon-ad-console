# Amazon Ad Console — Handoff Document for AI Coder

> **Historical planning doc.** This was the original implementation plan and gap
> analysis. Most of the gaps below have since been implemented — the search-term
> generator strategy, wizard/tab component splits, custom hooks, all-8-metrics
> views (plus CPC), negative phrase filtering, SB search terms, and the SB/SD
> flows. For the current state see `README.md`, `docs/FEATURES.md`,
> `docs/ARCHITECTURE.md`, `docs/AUTH.md`, and the audits (`docs/AUDIT.md`,
> `UI-AUDIT.md`). Treat the "gaps"/"TODO" items here as history, not open work.

## Project Overview
Amazon Advertising Console simulator (SP, SB, SD) with Next.js 16, React 19, TypeScript, Zustand, Vitest, Playwright.

**Stack**: Next.js 16, React 19, TypeScript, Zustand 5, Prisma 7 + Neon Postgres, NextAuth v5, Vitest, Playwright

---

## Current Architecture (SOLID Assessment)

### ✅ Well-Structured (Engine Layer)
```
src/engine/ad-console/
├── core/
│   ├── types.ts              # Domain types (S)
│   ├── simulation.ts         # Pure simulation (S, O)
│   ├── engine/               # Focused modules (S, D)
│   │   ├── id.ts, metrics.ts, campaign.ts, target.ts, adgroup.ts
│   │   ├── negative.ts, budget.ts, portfolio.ts, draft.ts
│   │   ├── responsive.ts, index.ts (barrel)
│   ├── slices/               # Zustand slice factories (S, D)
│   ├── __tests__/            # 312 passing tests
│   └── scenarios.ts          # Default campaigns
├── features/                 # Feature slices (S, O, L)
│   ├── bulk/, drills/, integrity/, missions/, profiles/, reports/, trainer/
└── store.ts                  # Composed store (D)
```

### ❌ SOLID Violations (Component Layer)
| Component | Lines | Violations |
|-----------|-------|------------|
| `CreateCampaignWizard.tsx` | 600+ | SRP (6 steps in one), no tests |
| `CampaignManager.tsx` | 350+ | SRP (5 tabs), no tests |
| `CampaignDetail.tsx` | 500+ | SRP (8 tabs), no tests |
| `SearchTermsTab.tsx` | 100+ | No tests |
| `NegativesTab.tsx` | 80+ | No tests |

---

## Campaign Creation Flow — Current State

### SP (Sponsored Products) — 6 Steps ✅ Mostly Complete
| Step | Fields |
|------|--------|
| 1. Ad Type | SP/SB/SD |
| 2. Basics | Name, Portfolio, Status, Daily Budget, Dates |
| 3. Products | Multi-select from catalog (5 products) |
| 4. Targeting | Mode: Auto / Manual Keyword / Manual Product<br>Manual KW: exact/phrase/broad textareas (one per line)<br>Manual Product: ASIN targets, Category targets<br>Bid Strategy: Dynamic down / up&down / Fixed |
| 5. Bidding | Default bid, Placement % (Top, Product, Rest) |
| 6. Review | Summary + Launch |

**GAP**: Match types on keyword addition (Step 4) — textareas determine match type, but "Add keyword" button in CampaignDetail uses dropdown. Simulation must generate **distinct search terms per match type**.

### SB (Sponsored Brands) — 6 Steps ⚠️ Missing Flows
| Missing | Details |
|---------|---------|
| Store Spotlight URL validation | Input exists, no validation |
| Audience lookback window | In draft type, not in wizard UI |
| Category targeting picker | Parsed but no UI |
| Search terms simulation | SB campaigns don't generate search terms |

### SD (Sponsored Display) — 6 Steps ⚠️ Missing Flows
| Missing | Details |
|---------|---------|
| Audience lookback window | In draft type, not in wizard UI (7/14/30/60/90 days) |
| Contextual category picker | No UI for category selection |
| Search terms | SD doesn't have search terms (by design - uses audiences/contextual) |

---

## Metrics Requirements — ALL Views Must Show

| View | Current | Required (8 metrics) |
|------|---------|---------------------|
| Campaigns tab | Impr, Clicks, CPC, Spend, ACOS, ROAS | **+ Orders, Sales** |
| Ad Groups tab | ✅ All 8 | ✅ Complete |
| Targets tab | ✅ All 8 | ✅ Complete |
| Search Terms tab | Clicks, CPC, Spend, Sales, Orders, ACOS, ROAS | **+ Impressions** |
| Campaign Detail → Overview | Partial | **All 8** |

**Required 8**: Impressions, Clicks, CPC, Spend, Sales, Orders, ACOS, ROAS

---

## Negation System — Current & Required

### Current Implementation (`engine/negative.ts`)
```typescript
isFilteredByNegative(term, negatives):
  - Negative exact: term === negative
  - Negative phrase: term.includes(negative)  // ✅ "plastic" blocks "plastic cup", "red plastic", etc.
```

### SearchTermsTab.tsx — Already Filters
```typescript
visibleSearchTerms = c.searchTerms.filter(st => !isFilteredByNegative(st.term, c.negatives))
```

### ⚠️ Gap: CampaignManager "Search Terms" Tab
The CampaignManager's `renderSearchTerms()` does NOT filter by negatives — must fix.

### User Requirement (Already Met in Engine)
> "a word added as negative phrase should prevent that word or anything that contains that word or phrase from showing up in search terms tab"
**Status**: ✅ Implemented in engine, needs verification in CampaignManager search terms tab.

---

## Simulation — Search Term Generation by Match Type

### Current (Hardcoded in `simulation.ts`)
```typescript
const matchGens = {
  Exact: kw => [kw, kw + 's' or singular],
  Phrase: kw => ['organic ' + kw, 'best ' + kw],
  Broad: kw => ['cheap ' + kw, kw + ' accessories', kw + ' deals'],
}
```

### Required: Extensible Generator Pattern (Open/Closed)
Create `src/engine/ad-console/core/engine/search-term-generator.ts`:
```typescript
interface SearchTermGenerator {
  generate(keyword: string): string[];
  getMatchType(): MatchType;
}

class ExactMatchGenerator implements SearchTermGenerator { ... }
class PhraseMatchGenerator implements SearchTermGenerator { ... }
class BroadMatchGenerator implements SearchTermGenerator { ... }

export const searchTermGenerators: Record<MatchType, SearchTermGenerator> = {
  Exact: new ExactMatchGenerator(),
  Phrase: new PhraseMatchGenerator(),
  Broad: new BroadMatchGenerator(),
};
```

### Generation Rules (Amazon-like)
| Match Type | Keyword | Generated Search Terms (examples) |
|------------|---------|-----------------------------------|
| **Exact** | "coffee filter" | "coffee filter", "coffee filters", "coffee filter" (close variants) |
| **Phrase** | "coffee filter" | "organic coffee filter", "best coffee filter", "coffee filter for chemex", "reusable coffee filter" |
| **Broad** | "coffee filter" | "cheap coffee filter", "coffee filter accessories", "coffee filter deals", "paper coffee filter", "reusable coffee filter", "metal coffee filter", "coffee filter holder" |

### Negative Filtering
- Apply **during generation** (not after) — filtered terms never enter `campaign.searchTerms`
- Negative Exact: exact match
- Negative Phrase: substring match

---

## TDD Compliance — Current State

### ✅ Passing: 312 Tests (Engine Layer)
- All core engine tests pass
- Simulation tests pass (12 tests including match type generation, negative filtering)
- Feature slice tests pass

### ❌ Missing: Component Tests (0 tests)
| Component | Required |
|-----------|----------|
| CreateCampaignWizard | 90% |
| CampaignManager | 85% |
| CampaignDetail | 85% |
| SearchTermsTab | 90% |
| NegativesTab | 90% |
| Wizard Steps | 90% each |

### TDD Violations
1. No tests written FIRST for new features
2. React components have zero test coverage
3. Integration/E2E tests missing for critical flows

---

## SOLID Compliance — Gap Analysis

| Principle | Status | Action Required |
|-----------|--------|-----------------|
| **S** Single Responsibility | ❌ | Split wizard (6 components), CampaignDetail (8 tab components), CampaignManager (5 tab components) |
| **O** Open/Closed | ❌ | Search term generators hardcoded — extract to strategy pattern |
| **L** Liskov Substitution | ✅ | No violations |
| **I** Interface Segregation | ❌ | `AppStore` is God object — split into domain hooks/stores |
| **D** Dependency Inversion | ❌ | Components use `useAdConsoleStore` directly — use custom hooks |

---

## Implementation Plan — 100% TDD + SOLID

### Phase 1: Core Engine — Search Term Generators (TDD First)
**Files**: `search-term-generator.ts`, `search-term-generator.test.ts`, modify `simulation.ts`

- [ ] Write tests for Exact/Phrase/Broad generators (distinct outputs, no duplicates)
- [ ] Write test: negative filtering applied DURING generation
- [ ] Implement generator classes with strategy pattern
- [ ] Integrate into `simulation.ts` (replace hardcoded `matchGens`)
- [ ] Run simulation tests — all pass

### Phase 2: Campaign Wizard Refactor (SOLID - SRP)
**Files**: Extract 6 step components + campaign-type variants

- [ ] Create `WizardStep` interface
- [ ] Extract `Step1AdType`, `Step2Basics`, `Step3ProductsCreative`, `Step4Targeting`, `Step5Bidding`, `Step6ReviewLaunch`
- [ ] Create campaign-type-specific variants in `wizard/steps/sp|sb|sd/`
- [ ] Refactor `CreateCampaignWizard` to orchestrator (<100 lines)
- [ ] Write component tests for each step (React Testing Library)

### Phase 3: Campaign Views — Add Missing Metrics (TDD)
**Files**: `CampaignManager.tsx`, `CampaignDetail.tsx`, `SearchTermsTab.tsx`

- [ ] Add Orders, Sales columns to Campaigns table + tests
- [ ] Add Impressions to SearchTermsTab + tests
- [ ] Add all 8 metrics to CampaignDetail Overview + tests
- [ ] Fix CampaignManager Search Terms tab negative filtering + tests

### Phase 4: SB/SD Missing Flows (TDD)
**Files**: Wizard steps, simulation.ts

- [ ] SB: Add search term generation in simulation + tests
- [ ] SB: Store Spotlight URL validation + test
- [ ] SB: Audience lookback dropdown in wizard + test
- [ ] SD: Audience lookback dropdown in wizard + test
- [ ] SD: Contextual category picker + test

### Phase 5: Component Test Infrastructure
- [ ] Add `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- [ ] Create test utilities: `renderWithStore()`, mock store helpers
- [ ] Write first component test (e.g., `CreateCampaignWizard.test.tsx`)

### Phase 6: SOLID Refactoring
- [ ] Extract custom hooks: `useCampaignWizard`, `useCampaignManager`, `useCampaignDetail`, `useSearchTerms`, `useNegatives`, `useSimulation`
- [ ] Split `AppStore` into domain stores/hooks
- [ ] Each CampaignDetail tab → own component + hook

### Phase 6: Error/Null States
- [ ] Empty states for all tabs (see table below)
- [ ] Inline validation errors (bid < 0.02, budget < 1, name required, etc.)

### Phase 7: Campaign Click → Ad Groups Tab
- [ ] Modify `CampaignManager.selectCampaign()` to set tab to 'adgroups'

---

## Empty/Error States Required

| View | Empty Message | Action |
|------|---------------|--------|
| Campaigns | "No campaigns yet. Create your first campaign." | → Create campaign |
| Ad Groups | "No ad groups. Created automatically when campaign launches." | → Create campaign |
| Targets | "No targets. Add keywords, products, or audiences." | → Campaign → Targeting |
| Search Terms | "No search terms. Run simulation to generate from keywords." | → Run simulation |
| Search Terms (w/ negatives) | "All terms filtered by negatives. Check Negatives tab." | → Negatives tab |
| Negatives | "No negatives. Add to prevent wasted spend." | → Add negative form |

| Error | Trigger | Display |
|-------|---------|---------|
| Name required | Launch w/o name | Inline: "Campaign name required" |
| Bid too low | Bid < 0.02 | Inline: "Minimum bid $0.02" |
| Budget too low | Budget < 1 | Inline: "Minimum budget $1" |
| No products | Launch w/o products | Inline: "Select at least one product" |
| Duplicate negative | Add existing | Toast: "Already exists" |

---

## File Structure for New Code

```
src/
├── engine/ad-console/core/
│   ├── engine/
│   │   ├── search-term-generator.ts       # NEW - Strategy pattern
│   │   └── index.ts                       # Export
│   ├── simulation.ts                      # MODIFY - Use generators
│   └── __tests__/
│       ├── search-term-generator.test.ts  # NEW - TDD
│       └── simulation.test.ts             # EXTEND
├── components/AdConsole/
│   ├── wizard/
│   │   ├── CreateCampaignWizard.tsx       # REFACTOR <100 lines
│   │   ├── WizardStep.tsx                 # NEW - Interface
│   │   ├── Step1AdType.tsx                # NEW
│   │   ├── Step2Basics.tsx                # NEW
│   │   ├── Step3ProductsCreative.tsx      # NEW
│   │   ├── Step4Targeting.tsx             # NEW
│   │   ├── Step5Bidding.tsx               # NEW
│   │   ├── Step6ReviewLaunch.tsx          # NEW
│   │   └── steps/
│   │       ├── sp/Step3.tsx, Step4.tsx, Step5.tsx
│   │       ├── sb/Step3.tsx, Step4.tsx, Step5.tsx
│   │       └── sd/Step3.tsx, Step4.tsx, Step5.tsx
│   ├── CampaignManager.tsx                # REFACTOR - Extract tabs
│   ├── CampaignDetail.tsx                 # REFACTOR - Extract tabs
│   ├── details/
│   │   ├── AdGroupsTab.tsx                # NEW
│   │   ├── TargetsTab.tsx                 # NEW
│   │   ├── SearchTermsTab.tsx             # MODIFY + Impressions
│   │   ├── NegativesTab.tsx               # MODIFY
│   │   └── ...
│   └── hooks/                             # NEW - Custom hooks
│       ├── useCampaignWizard.ts
│       ├── useCampaignManager.ts
│       ├── useCampaignDetail.ts
│       ├── useSearchTerms.ts
│       └── useNegatives.ts
└── __tests__/components/                  # NEW - Component tests
    ├── CreateCampaignWizard.test.tsx
    ├── CampaignManager.test.tsx
    ├── CampaignDetail.test.tsx
    ├── SearchTermsTab.test.tsx
    └── NegativesTab.test.tsx
```

---

## Quick Start for AI Coder

```bash
cd /root/Documents/Codex/2026-07-16/install-github/Amazon-ad-console

# 1. Verify baseline
npm test

# 2. Phase 1: Search Term Generators (TDD)
#    - Create search-term-generator.ts + test FIRST
#    - Run test, implement, run test
#    - Integrate into simulation.ts
#    - Run all tests

# 3. Add component test deps
npm install -D @testing-library/react @testing-library/user-event jsdom

# 4. Phase 2-7: Follow plan above
#    - Write test FIRST
#    - Implement
#    - Run tests frequently
```

---

## Key Types Reference (`types.ts`)

```typescript
type CampaignType = 'SP' | 'SB' | 'SD';
type MatchType = 'Exact' | 'Phrase' | 'Broad';
type TargetingMode = 'Automatic' | 'Manual keyword' | 'Manual product' | 'Keyword' | 'Product' | 'Category' | 'Contextual' | 'Audiences - views remarketing' | 'Audiences - purchases remarketing' | 'Categories';
type CampaignStatus = 'Enabled' | 'Paused' | 'Archived' | 'Draft';
type BidStrategy = 'Dynamic bids - down only' | 'Dynamic bids - up and down' | 'Fixed bids' | 'Cost per click' | 'Cost per thousand impressions';
```

---

## Engine Utilities (Use These)
- `calc(metrics)` → {ctr, cpc, acos, roas, cvr}
- `formatMoney(n)` → "$1,234.56"
- `formatWhole(n)` → "1,234"
- `formatPercent(n)` → "25.00%"
- `formatBid(n)` → "$0.75"
- `formatRoas(n)` → "4.00"
- `acosClass(acos)` → 'good'|'warn'|'bad'
- `generateId(prefix)` → unique ID
- `isFilteredByNegative(term, negatives)` → boolean

---

## Definition of Done (100% Compliance)

### TDD
- [ ] Every new function/module has tests written FIRST
- [ ] All 312+ existing tests pass
- [ ] Component tests >85% coverage for all React components
- [ ] Integration tests for wizard flow
- [ ] E2E tests for: create campaign → simulate → search terms → add negative

### SOLID
- [ ] **S**: No component >200 lines, single responsibility
- [ ] **O**: Search generators extensible without modifying simulation.ts
- [ ] **L**: No LSP violations
- [ ] **I**: No God store; domain-specific hooks
- [ ] **D**: Components depend on hooks/interfaces, not concrete store

### Features
- [ ] SP/SB/SD wizards complete with all fields
- [ ] Match types generate distinct search terms in simulation
- [ ] Negative phrase filters "word or anything containing that word"
- [ ] All views show: Impressions, Clicks, CPC, Spend, Sales, Orders, ACOS, ROAS
- [ ] Campaign click → Ad Groups tab (not Overview)
- [ ] Error/null states for all empty views
- [ ] SB search terms simulation works
- [ ] SD audience lookback in wizard
- [ ] SD contextual category picker in wizard
