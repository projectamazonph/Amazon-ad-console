# Feature Documentation

Detailed documentation for each module in the Amazon Ad Console Training Simulator.

---

## 1. Dashboard

**Component**: `Dashboard.tsx` (133 lines)
**View**: `dashboard`

The aggregate metrics view showing totals across all enabled campaigns.

### Metrics Displayed
- **Total Impressions** — sum of all enabled campaign impressions
- **Total Clicks** — sum of all enabled campaign clicks
- **Total Spend** — sum of all enabled campaign spend
- **Total Sales** — sum of all enabled campaign sales
- **Total Orders** — sum of all enabled campaign orders
- **Average ACoS** — spend / sales × 100
- **Average ROAS** — sales / spend
- **Average CTR** — clicks / impressions × 100

### Rollup Logic
Metrics flow bottom-up:
1. **Targets** (per-keyword) have individual metrics
2. **Ad Groups** sum their child targets' metrics
3. **Campaigns** sum their child ad groups' metrics
4. **Dashboard** sums all enabled campaigns' metrics

The `totalMetrics()` function in `core/engine.ts` handles the campaign → dashboard aggregation. The `simulateDays()` function handles the target → ad group → campaign cascade.

---

## 2. Campaign Manager

**Component**: `CampaignManager.tsx` (300 lines)
**View**: `campaigns`

List view of all campaigns with filtering and bulk actions.

### Features
- **Filter by type**: All / SP / SB / SD
- **Filter by status**: All / Enabled / Paused / Archived
- **Filter by portfolio**: All / any portfolio name
- **Search**: Free-text across name, type, targeting mode, portfolio, ad format
- **Per-campaign actions**: Toggle status, archive, duplicate, view details
- **Inline metrics**: Impressions, clicks, spend, sales, ACoS, ROAS

### Interaction Flow
1. Click a campaign row → navigates to `CampaignDetail`
2. Toggle button → calls `toggleCampaignStatus`
3. Archive button → calls `archiveCampaign`
4. Duplicate button → calls `duplicateCampaign`

---

## 3. Campaign Detail

**Component**: `CampaignDetail.tsx` (550+ lines)
**View**: `detail`

Deep-dive view for a single campaign with tabbed sub-views.

### Tabs
- **Overview** — campaign settings, metrics, creative status
- **Ad Groups** — list of ad groups with CRUD actions and drill-down

  **CRUD operations** (inline in the table):
  - **Create**: Enter a name in the "New ad group name" field and click "+ Add ad group"
  - **Rename**: Click the inline edit icon next to the ad group name
  - **Status**: Toggle via inline dropdown (Enabled / Paused / Archived); cascades to all targets in the group
  - **Default bid**: Set via inline numeric input; clamped to ≥ $0.02
  - **Delete**: Click the "Remove" button (disabled if it's the only ad group); removes the group and all its targets

  **Drill-down**: Click an ad group row to see its child targets in a focused sub-view with a "← All ad groups" back button. The drill-down shows:
  - Ad group name, status dropdown, default bid editor with Save button
  - Full targets table filtered to that ad group
- **Targets** — keyword/product targets with bid management
- **Search Terms** — customer search terms with harvest/negate actions
- **Negatives** — negative keyword list
- **Placements** — placement bid adjustments
- **Budget Rules** — schedule/performance-based rules with full CRUD
  - **Add rule**: Form with name, type (Schedule/Performance), budget increase multiplier, condition text
  - **Edit rule**: Inline editable name, type dropdown, increase amount, condition text
  - **Remove rule**: Delete button with confirmation dialog
  - **Validation**: Type must be Schedule or Performance, increase must be positive, name and condition required
- **Change History** — chronological log of all changes

### Target Management
- **Add keyword**: Opens form for keyword text, match type, bid
- **Remove target**: Removes target from campaign
- **Set bid**: Set exact CPC bid on a target
- **Adjust bid**: Multiply current bid by a factor
- **Pause target**: Sets target status to Paused

### Search Term Actions
- **Harvest**: Promotes a converting search term to an Exact keyword target and adds a Phrase negative to prevent duplicate matching
- **Negate**: Adds the search term as a Negative exact keyword

### Placement Adjustments
Three placement types with percentage bid modifiers:
- **Top of Search** — premium placement at top of results
- **Product Pages** — ads on product detail pages
- **Rest of Search** — all other placements

---

## 4. Create Campaign Wizard

**Component**: `CreateCampaignWizard.tsx` (280+ lines)
**View**: `create`

Multi-step campaign creation wizard mimicking the Amazon Ads Console flow.

### Steps
1. **Ad type**: Select SP, SB, or SD
2. **Basics**: Campaign name, portfolio, status, daily budget, start date, ad format
3. **Products & creative**: Select ASINs from a checkable product catalog table; enter brand name and headline for SB/SD campaigns
4. **Targeting**: Choose targeting mode with auto-targeting context panel; enter keywords (one per line) for manual modes, or ASIN/audience targets for product/contextual targeting
5. **Bidding & budget**: Bid strategy, default bid, and placement adjustments (Top of Search / Product pages / Rest of Search)
6. **Review & launch**: Full settings summary; keywords and product counts shown; launch creates the campaign with parsed keywords as targets

### Validation
- Campaign name is required
- Daily budget must be ≥ $1
- Default bid must be ≥ $0.02
- Keywords are parsed one-per-line from the text area

### Launch
Creates a normalized campaign via `normalizeCampaign()` and prepends it to the campaigns array. Immediately navigates to the detail view.

---

## 5. Portfolio Overview

**Component**: `PortfolioOverview.tsx` (136 lines)
**View**: `portfolio`

Campaigns grouped by portfolio with aggregate metrics per group.

### Groups
- Each unique portfolio name becomes a group
- Campaigns without a portfolio go into "Training Portfolio" (default)
- Each group shows aggregate metrics and campaign count
- Click a campaign within a group → navigates to detail view

---

## 6. Guided Drills

**Component**: `DrillsPage.tsx` (126 lines)
**Engine**: `features/drills/engine.ts`
**View**: `drills`

Click-by-click navigation coaching through real Amazon Ads Console workflows.

### Available Drills

| ID | Title | Ad Type | Difficulty | Steps |
|----|-------|---------|-----------|-------|
| `nav-sp-search-term-negative` | Find and block waste from Search terms | SP | Beginner | 5 |
| `nav-sp-placement-controls` | Adjust SP placement settings | SP | Beginner | 5 |
| `nav-sb-creative-review` | Review SB creative before launch | SB | Intermediate | 4 |
| `nav-report-request` | Request and copy a performance report | SP | Beginner | 3 |
| `nav-sd-audience-path` | Find Sponsored Display audience targeting | SD | Intermediate | 4 |

### How It Works
1. User selects a drill from the list
2. Sidebar shows step-by-step instructions
3. User clicks the target action in the simulator
4. Engine evaluates: correct → advance; incorrect → record mistake
5. Skippable steps allow skipping without penalty
6. Score calculated: `100 - (mistakes × 15) - (skips × 5)`, min 0
7. Results stored in `drillResults` history

---

## 7. Training Missions

**Component**: `MissionsPage.tsx` (68 lines)
**Engine**: `features/missions/engine.ts`
**View**: `missions`

Scenario-based challenges that test real campaign management skills.

### Available Missions

| ID | Title | Difficulty | Steps |
|----|-------|-----------|-------|
| `mission-optimize-acos` | Optimize Campaign ACoS Below Target | Advanced | 6 |
| `mission-launch-manual` | Launch a Manual SP Campaign from Scratch | Intermediate | 5 |
| `mission-cleanup-waste` | Clean Up Wasted Spend | Beginner | 4 |

### Scoring
- Starts at 100 points
- Each hint used: -10 points
- Complete all steps to finish
- Final score reflects efficiency (fewer hints = higher score)

---

## 8. Reports

**Component**: `ReportsPage.tsx` (89 lines)
**Engine**: `features/reports/engine.ts`
**View**: `reports`

Generate and export performance reports matching Amazon Ads Console report types.

### Report Types

| Type | Description |
|------|------------|
| `campaign` | Campaign-level performance summary |
| `adGroup` | Ad group breakdown |
| `target` | Keyword/target performance |
| `searchTerm` | Customer search term data |
| `placement` | Placement-level breakdown |

### Workflow
1. Select report type
2. Click "Request report"
3. Report generates immediately (simulated)
4. View report data in table format
5. Click "Export CSV" to download

---

## 9. Bulk Operations

**Component**: `BulkOpsPage.tsx` (85 lines)
**Engine**: `features/bulk/engine.ts`
**View**: `bulk`

Import and validate Amazon Ads bulk CSV operations.

### CSV Format
```
Entity,Operation,Id,Campaign Name,Field,Value
campaign,update,C-SP-001,,DailyBudget,50
target,pause,,C-SP-001,Status,Paused
negative,create,,C-SP-001,Keyword,irrelevant term
```

### Supported Operations
- **campaign**: update, pause, enable, archive
- **adGroup**: update, pause, enable
- **target**: update, pause, enable, delete
- **negative**: create, delete
- **budgetRule**: create, delete

### Validation
The `validateBulkRows()` function checks:
- Required fields per entity type
- Valid operation names
- Valid field names
- Value format matching (e.g., bid must be numeric)

Returns row-level error messages with specific field and reason.

---

## 10. Integrity Center

**Component**: `IntegrityPage.tsx` (76 lines)
**Engine**: `features/integrity/engine.ts`
**View**: `integrity`

Automated data-quality auditing of campaign setup.

### Checks Performed

| Check | Severity | Description |
|-------|----------|------------|
| Archived campaign has active children | Error | Targets in archived campaigns should also be archived |
| Duplicate target IDs | Error | Each target must have a unique ID |
| Orphaned search terms | Warning | Search terms should link to a target (except SD) |
| SD with search terms | Warning | SD campaigns use audience reports, not search terms |
| SB rejected creative | Error | Creative must be approved before campaign can run |
| Low-inventory product | Warning | Campaigns promoting low-stock items may waste spend |

### Scoring
- Score starts at 100
- Each error: -15 points
- Each warning: -5 points
- Passes at ≥70

### Self-Heal Recommendations
Each issue includes a `recommendation` string explaining how to fix the problem.

---

## 11. Trainer Dashboard

**Component**: `TrainerPage.tsx` (124 lines)
**Engine**: `features/trainer/engine.ts`
**View**: `trainer`

Supervisor view for monitoring trainee progress.

### Certification Checklist
9-item checklist tracking trainee competency:

1. Names ad type before making changes
2. Checks campaign status before editing
3. Checks date range before reading performance
4. Reads spend, sales, orders, ACoS, CPC, CVR
5. Explains why a target gets increased, decreased, paused, harvested, or negated
6. Uses exact negatives for precise waste, phrase only when safe
7. Validates SB creative fields before launch
8. Understands SD audience/contextual targeting vs keyword targeting
9. Checks change history after major edits

### Action Grading
Each simulator action is automatically graded:
- **Good** (green): Creating campaigns, adding keywords, harvesting terms, pausing waste
- **Bad** (red): Deleting without reason, ignoring metrics, wrong match type
- **Warn** (yellow): Pausing broadly, adjusting bids without analysis

### Notes
Trainer can add timestamped notes for each trainee session.

---

## 12. Multi-User Profiles

**Engine**: `features/profiles/engine.ts`
**View**: Integrated into sidebar

Separate training state per trainee.

### Features
- Default profile: "Trainee" (`p-default`)
- Create new profiles with custom names
- Switch between profiles (updates `lastActiveAt`)
- Rename profiles
- Delete profiles (falls back to first available)

---

## 13. Persistence & State Management

**Engine**: `store.ts` — Zustand persist middleware
**View**: Automatic (no user-facing component)

### LocalStorage Persistence
The Zustand store uses `persist` middleware from `zustand/middleware` to save and restore state across page refreshes.

**Storage key**: `ad-console-storage` (localStorage)

**Persisted data**:
- All campaigns, ad groups, targets, search terms, negatives, budget rules
- Portfolio assignments and portfolio name list
- Filter preferences, simulation days, action log
- State version string

**Not persisted** (UI-only transient state):
- Draft/campaign creation wizard state
- Current view, selected tab, selected campaign ID
- Mobile menu status
- Feature engine state (drills, missions, profiles, etc.)

### Export/Import
The store exposes `exportState()` and `importState(json)` for manual backup/restore:
- `exportState()` serializes all core state to a JSON string
- `importState()` deserializes and validates the JSON (rejects empty strings and non-object values)
- Returns `true` on success, `false` on parse failure

### Sidebar Navigation Wiring
Left-rail sidebar items now map to campaign detail tabs:
- **Campaigns** → campaign list view
- **Ad groups** → `adgroups` tab in campaign detail
- **Targeting** → `targets` tab
- **Search terms** → `searchTerms` tab
- **Negative keywords** → `negatives` tab
- **Budget rules** (Portfolios section) → `budgetRules` tab

When clicking a tab-mapped item:
- If user is already viewing a campaign detail → switches the active tab
- If user is in the campaign list → navigates to detail view and switches tab
- Items without a tab → plain view navigation (unchanged behaviour)

---

## 14. Mobile & Responsive Layout

**Component**: `MobileNav.tsx` (133 lines)
**Hook**: `useBreakpoint.ts` (52 lines)
**Engine**: `core/engine.ts` — `resolveBreakpoint`, `mobileMenuReducer`, `isTouchViewport`
**View**: Integrated into all views via topbar

### Breakpoints

| Range | Label | Behavior |
|-------|-------|----------|
| < 768px | Mobile | Sidebar hidden, hamburger toggle + slide-out drawer |
| 768–1100px | Tablet | Sidebar collapses to 200px, hamburger still available |
| > 1100px | Desktop | Full Amazon Console layout |

### Mobile Drawer
- Hamburger button in the global nav toggles a slide-out drawer
- Drawer contains all sidebar groups: Campaign Manager, Portfolios, Measurement
- Backdrop overlay with click-to-close
- Escape key closes the drawer
- Animation state machine: closed → open ↔ closing → closed
- Touch-friendly `44px` minimum tap targets on all interactive elements

### Touch Viewport
- `isTouchViewport()` in the engine detects devices with coarse pointer at ≤ 1100px
- Touch-action: manipulation on interactive elements prevents tap delay
- -webkit-overflow-scrolling: touch on scrollable panels

### Responsive Adjustments
- **Nav**: Brand text truncates, nav account text truncates, section text hidden
- **Tables**: Horizontal scroll, smaller padding, smaller pill badges
- **Forms**: Full-width input stacking, 44px min-height on inputs
- **Tabs**: Horizontal overflow scroll with hidden scrollbar
- **Toolbar**: Wrap on multiple lines, flex-grow on filter controls
- **Page titles**: Stack vertically on mobile
