# Engine API Reference

All functions live in `src/engine/ad-console/` and can be imported via the public API barrel at `src/engine/ad-console/index.ts`.

## Import Patterns

```ts
// Full public API
import { calc, simulateDays, Campaign } from '@/engine/ad-console';

// Core engine only (zero deps)
import { calc, simulateDays } from '@/engine/ad-console/core/engine';

// Store hook
import { useAdConsoleStore } from '@/engine/ad-console/store';
```

---

## Core Engine (`core/engine.ts`)

### ID Generation

#### `generateId(prefix?: string): string`
Generates a unique ID with a timestamp-based component and incrementing counter.
- **prefix**: Default `'C'`. Used to namespace IDs (e.g., `'C'`, `'AG'`, `'T'`).
- **Returns**: `"{prefix}-{base36timestamp}-{counter}"`

---

### Metrics

#### `calc(metrics: Metrics): DerivedMetrics`
Computes derived KPIs from raw metrics.

| Derived Metric | Formula | Range |
|---------------|---------|-------|
| `ctr` | clicks / impressions × 100 | 0–100% |
| `cpc` | spend / clicks | $0+ |
| `acos` | spend / sales × 100 | 0–100% |
| `roas` | sales / spend | 0+ |
| `cvr` | orders / clicks × 100 | 0–100% |

#### `totalMetrics(campaigns: Campaign[]): Metrics`
Sums raw metrics (impressions, clicks, spend, sales, orders) across an array of campaigns.

#### `metricDefaults(m: Partial<Metrics>): Metrics`
Fills missing metric fields with `0`.

---

### Campaign Normalization

#### `normalizeCampaign(c: Partial<Campaign>): Campaign`
Normalizes a partial campaign object into a fully-formed `Campaign` with:
- Validated `type` (SP/SB/SD)
- Generated `id` if missing
- Default ad group with generated ID
- Normalized targets, search terms, negatives, budget rules
- Default creative for SB/SD campaigns
- History entry logged

---

### Campaign Operations

#### `toggleCampaignStatus(c: Campaign): Campaign`
Cycles campaign status: `Enabled → Paused → Enabled`. Archived campaigns are unchanged. Logs the change.

#### `archiveCampaign(c: Campaign): Campaign`
Sets campaign status to `'Archived'`. Logs the archive action.

#### `duplicateCampaign(c: Campaign): Campaign`
Creates a deep copy of a campaign with:
- New unique ID
- New ad group IDs
- New target IDs
- Status set to `'Paused'`
- Name appended with `"(copy)"`

---

### Target (Keyword) Operations

#### `addTarget(campaign: Campaign, value: string, match: MatchType | string, bid: number): { campaign: Campaign; target: Target }`
Adds a new keyword target to the campaign's first ad group.
- **value**: The keyword text
- **match**: `'Exact'`, `'Phrase'`, or `'Broad'`
- **bid**: CPC bid in dollars
- Logs the addition. Returns both the updated campaign and the new target.

#### `removeTarget(campaign: Campaign, targetId: string): Campaign`
Removes a target by ID from the campaign. Logs the removal.

#### `setTargetBid(campaign: Campaign, targetId: string, bid: number): Campaign`
Sets an exact bid on a target. Logs the change with old/new values.

#### `adjustTargetBid(campaign: Campaign, targetId: string, multiplier: number): Campaign`
Adjusts a target's bid by a multiplier (e.g., `1.2` = +20%, `0.8` = -20%). Logs the adjustment.

#### `pauseTarget(campaign: Campaign, targetId: string): Campaign`
Sets a target's status to `'Paused'`. Logs the pause action.

---

### Negative Keywords

#### `addNegative(campaign: Campaign, term: string, type?: string): Campaign`
Adds a negative keyword to the campaign.
- **term**: The negative keyword text
- **type**: `'Negative exact'` (default) or `'Negative phrase'`
- Logs the addition.

#### `harvestTerm(campaign: Campaign, term: string): Campaign`
Finds a matching search term in the campaign and:
1. Adds it as a new Exact keyword target
2. Adds a Negative phrase to block it from auto/targeted matching
3. Logs the harvest action

---

### Simulation

#### `simulateDays(campaigns: Campaign[], days: number): Campaign[]`
Generates realistic performance data for enabled campaigns over N days.

For each campaign:
1. Calculates daily CTR, CPC, conversion rate from existing metrics (with fallback defaults)
2. Generates impressions based on daily budget and bid competitiveness
3. Converts impressions → clicks → sales → orders with randomized variance
4. Distributes metrics across targets proportionally
5. Recomputes ad group metrics from target totals
6. Appends a history entry

Returns new campaign objects (no mutation).

---

### Settings

#### `updateCampaignSettings(campaign: Campaign, updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status'>>): Campaign`
Updates campaign-level settings. Logs individual changes.

#### `savePlacements(campaign: Campaign, placements: { top: number; product: number; rest: number }): Campaign`
Saves placement bid adjustment percentages. Logs changes.

---

### Helpers

#### `campaignById(state: AdConsoleState, id: string): Campaign | undefined`
Finds a campaign by ID in the state.

#### `filteredCampaigns(state: AdConsoleState): Campaign[]`
Returns campaigns filtered by the current filter state (type, status, portfolio, search text).

#### `portfolioNames(campaigns: Campaign[]): string[]`
Returns unique portfolio names, sorted, with `'All'` prepended.

#### `formatMoney(n: number): string`
Formats a number as `$X,XXX.XX`.

#### `formatWhole(n: number): string`
Formats a number with locale-aware thousand separators.

#### `formatBid(n: number): string`
Formats a bid as `$X.XX`.

#### `formatPercent(n: number): string`
Formats a number as `XX.XX%`.

#### `formatRoas(n: number): string`
Formats ROAS as `X.XX`.

#### `acosClass(acos: number): string`
Returns `'good'` (≤30%), `'warn'` (≤50%), or `'bad'` (>50%).

---

## Feature Engines

### Drills Engine (`features/drills/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `getDrills` | `(): DrillDefinition[]` | Returns all 5 drill definitions |
| `getDrill` | `(id: DrillId): DrillDefinition \| undefined` | Get a drill by ID |
| `createSession` | `(): DrillSession` | Create an empty drill session |
| `startDrill` | `(id: DrillId): DrillSession` | Start a drill session |
| `isCorrectAction` | `(session, drill, action): boolean` | Check if an action matches the current step |
| `advanceStep` | `(session, drill): DrillSession` | Move to the next step |
| `recordMistake` | `(session): DrillSession` | Increment mistake counter |
| `recordSkip` | `(session, drill): DrillSession` | Skip a step (if allowed) |
| `calculateScore` | `(session, totalSteps): number` | Compute 0–100 score |

### Profiles Engine (`features/profiles/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `createProfile` | `(name: string): TraineeProfile` | Create a new profile |
| `switchProfile` | `(profiles, id): TraineeProfile[]` | Update lastActiveAt on switch |
| `renameProfile` | `(profiles, id, name): TraineeProfile[]` | Rename a profile |
| `deleteProfile` | `(profiles, id): TraineeProfile[]` | Remove a profile |
| `defaultProfile` | `(): TraineeProfile` | Create the default "Trainee" profile |

### Trainer Engine (`features/trainer/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `addNote` | `(text: string): TrainerNote` | Create a timestamped note |
| `calculateCertScore` | `(items: CertificationItem[]): number` | Compute 0–100 cert score |
| `calculateGrade` | `(type: string): { tone }` | Auto-grade an action type |

### Bulk Engine (`features/bulk/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseBulkCsv` | `(csv: string): BulkRow[]` | Parse CSV text into row objects |
| `validateBulkRows` | `(rows: BulkRow[]): BulkValidationError[]` | Validate rows against schema |
| `generateTemplate` | `(): string` | Generate a blank CSV template |

### Reports Engine (`features/reports/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `createReportRequest` | `(type: ReportType): ReportRequest` | Create a pending report request |
| `generateReport` | `(type: ReportType): Report` | Generate a report with mock data |
| `reportToCsv` | `(report: Report): string` | Convert report to CSV string |

### Missions Engine (`features/missions/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `getMissions` | `(): Mission[]` | Returns all 3 mission definitions |
| `getMission` | `(id: string): Mission \| undefined` | Get a mission by ID |
| `createMissionSession` | `(): MissionSession` | Create an empty mission session |
| `startMission` | `(id: string): MissionSession` | Start a mission (score = 100) |
| `useHint` | `(session): MissionSession` | Use a hint (-10 score) |
| `completeStep` | `(session, totalSteps): MissionSession` | Advance to next step |

### Integrity Engine (`features/integrity/engine.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `runIntegrityCheck` | `(campaigns: Campaign[]): IntegrityReport` | Run all data-quality checks |

Checks performed:
- Archived campaigns with active children
- Duplicate target IDs
- Orphaned search terms (no target link)
- SD campaigns with search term rows
- SB campaigns with rejected creative
- Low-inventory products

Score: `100 - (errors × 15) - (warnings × 5)`, passes at ≥70.

---

## Store API (`store.ts`)

### Core Actions

| Action | Parameters | Description |
|--------|-----------|-------------|
| `selectCampaign` | `(id: string \| null)` | Select a campaign for detail view |
| `setView` | `(view)` | Navigate to a view |
| `setTab` | `(tab: string)` | Switch tab within campaign detail |
| `setFilter` | `(filter: Partial<FilterState>)` | Update campaign list filters |
| `toggleCampaignStatus` | `(id: string)` | Toggle enabled/paused |
| `archiveCampaign` | `(id: string)` | Archive a campaign |
| `duplicateCampaign` | `(id: string)` | Clone a campaign |
| `addKeyword` | `(campaignId, value, match, bid)` | Add a keyword target |
| `removeTarget` | `(campaignId, targetId)` | Remove a target |
| `setTargetBid` | `(campaignId, targetId, bid)` | Set exact bid |
| `adjustTargetBid` | `(campaignId, targetId, multiplier)` | Adjust bid by multiplier |
| `pauseTarget` | `(campaignId, targetId)` | Pause a target |
| `addNegative` | `(campaignId, term, type?)` | Add negative keyword |
| `harvestTerm` | `(campaignId, term)` | Harvest a search term |
| `runSimulation` | `(days?: number)` | Run N-day simulation (default 7) |
| `updateCampaignSettings` | `(id, updates)` | Update campaign settings |
| `savePlacements` | `(id, placements)` | Save placement adjustments |
| `updateDraft` | `(field, value)` | Update campaign creation draft |
| `setWizardStep` | `(step: number)` | Set wizard step |
| `resetDraft` | `()` | Reset creation wizard |
| `launchCampaign` | `()` | Create campaign from draft |
| `toggleAddKeywordForm` | `()` | Toggle keyword form visibility |
| `resetAll` | `()` | Reset to default campaigns |
| `exportState` | `(): string` | Export state as JSON string |
| `importState` | `(json: string): boolean` | Import state from JSON |

### Derived Getters

| Getter | Returns | Description |
|--------|---------|-------------|
| `filtered()` | `Campaign[]` | Filtered campaign list |
| `selectedCampaign()` | `Campaign \| undefined` | Currently selected campaign |
| `portfolioOptions()` | `string[]` | Portfolio filter options |
| `totalMetricsCalc()` | `Metrics` | Aggregate metrics (enabled campaigns) |
| `derivedMetrics(m)` | `DerivedMetrics` | Compute KPIs from raw metrics |
