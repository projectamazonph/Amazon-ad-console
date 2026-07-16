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

**Component**: `CampaignDetail.tsx` (436 lines)
**View**: `detail`

Deep-dive view for a single campaign with tabbed sub-views.

### Tabs
- **Overview** — campaign settings, metrics, creative status
- **Ad Groups** — list of ad groups with metrics
- **Targets** — keyword/product targets with bid management
- **Search Terms** — customer search terms with harvest/negate actions
- **Negatives** — negative keyword list
- **Placements** — placement bid adjustments
- **Budget Rules** — automated budget rules
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

**Component**: `CreateCampaignWizard.tsx` (227 lines)
**View**: `create`

Multi-step campaign creation wizard mimicking the Amazon Ads Console flow.

### Steps
1. **Campaign type**: Select SP, SB, or SD
2. **Settings**: Name, portfolio, daily budget, default bid, targeting mode, bid strategy
3. **Products**: Select ASINs from the product catalog
4. **Targeting**: Add keywords (for SP Manual/SB) or configure auto-targeting
5. **Creative**: Brand name, headline, destination (SB/SD only)
6. **Review & Launch**: Summary and confirmation

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
