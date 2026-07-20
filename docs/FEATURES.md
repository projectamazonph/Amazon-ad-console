# Feature Documentation

Detailed documentation for each module in the Amazon Ad Console Training Simulator.

---

## 1. Dashboard

**Component**: `Dashboard.tsx` (133 lines)
**View**: `dashboard`

The aggregate metrics view showing totals across all enabled campaigns.

### KPI Tiles (10)
Impressions, Clicks, **CPC**, Spend, Sales, Orders, Units, CTR, ACoS, RoAS —
built by `getKpiTiles()` in `nav/consoleNav.ts`. The campaign table below the
tiles also shows a CPC column.

### Rollup Logic
Metrics flow bottom-up and reconcile exactly:
1. **Targets** (per-keyword) have individual metrics
2. **Ad Groups** sum their child targets' metrics
3. **Campaigns** sum their child ad groups' metrics
4. **Dashboard** sums all enabled campaigns' metrics

`totalMetrics()` in `core/engine.ts` handles the campaign → dashboard
aggregation. `simulateDays()` distributes each run's activity to the enabled
targets with largest-remainder integer rounding and derives ad-group and
campaign totals from them, so `campaign == sum(ad groups) == sum(targets)` holds
after every run (a campaign with no target rows accrues at the campaign level).

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
- **Inline metrics**: Impressions, clicks, CPC, spend, sales, orders, ACoS, ROAS
- **Cross-entity tabs**: Ad groups, Targeting, Search terms, and Negatives tabs list those entities across all campaigns. Every row links through to the owning campaign's matching detail tab, and rows expose inline actions — target bid ±10% / pause / remove, negative enable-disable / remove, and search-term harvest / negate.

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
- **Targets** — keyword/product targets with bid management (bids clamped to $0.02–$999.99); includes a CPC column
- **Search Terms** — customer search terms with harvest/negate actions
- **Negatives** — add negatives (exact / phrase / ASIN / category) and, per row, **enable, disable, or remove** them; a disabled negative is kept but stops filtering search terms. Shows campaign vs ad-group level.
- **Placements** — placement bid adjustments

The **Overview** tab's "top targets" rows are clickable and jump to the Targeting tab.
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
4. **Targeting**: Choose targeting mode. **Automatic** (SP) shows the four auto-targeting groups (close match, loose match, substitutes, complements), each with an enable checkbox and its own bid. **Keyword** modes (SP "Manual keyword" / SB "Keyword") show a single keyword box (one per line) plus **Exact / Phrase / Broad checkboxes** — a keyword is added under every checked match type at once (`KeywordEntry`). Product/category/audience modes take ASIN/category/audience targets.
5. **Bidding & budget**: Bid strategy, default bid, and placement adjustments (Top of Search / Product pages / Rest of Search)
6. **Review & launch**: Full settings summary (keyword count × match types, or enabled auto groups); launch creates the campaign with the corresponding targets

### Validation (gates Next / Launch)
Validation lives in `core/engine/draft.ts` (`canLeaveWizardStep`, `draftLaunchErrors`) and disables the Next/Launch buttons with an inline message:
- Campaign name is required; daily budget must be ≥ $1 (gates leaving step 2)
- At least one product must be selected (step 3)
- In a keyword mode with keywords entered, at least one match type must be selected (step 4)
- Default/target/ad-group bids are clamped to $0.02–$999.99 by the engine (`clampBid`)

### Launch
Creates a normalized campaign via `normalizeCampaign()` and prepends it to the campaigns array. Keyword targets are only built for keyword modes; Automatic SP campaigns get a target per enabled auto group. Immediately navigates to the detail view.

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
The sidebar (`layout/Sidebar.tsx`, model in `nav/consoleNav.ts`) renders
semantic `<button>` items (keyboard-accessible). Left-rail items map to campaign
detail tabs:
- **Campaigns** → campaign list view
- **Ad groups** → `adgroups` tab in campaign detail
- **Targeting** → `targets` tab
- **Search terms** → `searchTerms` tab
- **Negative keywords** → `negatives` tab
- **Budget rules** (Portfolios section) → `budgetRules` tab

When clicking a tab-mapped item:
- If user is already viewing a campaign detail → switches the active tab
- If user is in the campaign list → navigates to detail view and switches tab

**Measurement rail**: Sponsored Products / Brands / Display open Campaign
Manager filtered to that ad-product type; Search query performance opens the
Search terms tab.

**Training tools rail** (always visible): links to the six feature pages that
were previously unreachable from the UI — Drills, Missions, Reports, Bulk
operations, Trainer, Integrity.

Active-state highlighting tracks the current campaign-type filter and selected
tab, so only the chosen item is highlighted.

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

---

## 15. Multi-User Authentication

**Auth Provider**: NextAuth v5
**Database**: PostgreSQL (Neon) via Prisma 7
**Components**: `SessionProvider.tsx`, `UserMenu.tsx`, `SyncButton.tsx`, `lib/cloud-sync.ts`
**Server**: `src/server/` (campaign service, serializer, `CampaignDb` contract)
**Pages**: `/auth/login`, `/auth/register`, `/landing`

### Overview
Multi-user access system where a signed-in trainee's account is
server-authoritative: it hydrates from the server on login, seeds the server
from local state on first login, then auto-saves campaign changes with a 2s
debounce (`useCloudSync`). Signed-out users keep the purely local sandbox.

### Authentication Flow
1. **Registration**: User creates account with email/password
2. **Login**: User signs in with credentials
3. **Session**: JWT token stored in HTTP-only cookie
4. **Logout**: Session destroyed, redirect to home

### Database Schema
- **User**: id, email, name, passwordHash, timestamps
- **Campaign**: All campaign data linked to userId
- **Simulation**: Simulation history linked to userId

### API Routes
Campaign routes address campaigns by their **engine id** (e.g. `C-SP-123`),
validate input (400), and return 404/409 where appropriate.
- `POST /api/auth/register` — Create new user (email format + 8-char password)
- `GET/POST /api/campaigns` — List / create campaigns
- `GET/PATCH/DELETE /api/campaigns/[id]` — Single campaign (PUT kept as an alias)
- `POST /api/simulate` — Run the day simulation server-side, persist, audit
- `GET/POST /api/sync` — Load / reconcile the account (transactional upsert + prune)

### Frontend Components
- **SessionProvider**: Wraps app for client-side session access
- **UserMenu**: Shows avatar, name, dropdown with sign out
- **SyncButton**: sync-status indicator + manual Save/Load (auto-sync via `useCloudSync`)

### User Flow
1. Visit `/auth/register` to create account
2. Sign in at `/auth/login` — the account hydrates from the server automatically
3. Use simulator normally — campaign changes auto-save (debounced)
4. Sign in from any device to restore the same account; manual Save/Load remain available

### Security
- Password hashing with bcrypt (10 rounds)
- JWT sessions with secure HTTP-only cookies
- User data isolation via userId foreign key
- API route protection via session checks

---

## 16. Landing Page

**Component**: `landing/page.tsx`
**Route**: `/landing`

### Features
- Public landing page with auth links
- Feature showcase with animations
- Stats display
- CTA to simulator
- Responsive design

### Design
- Dark theme with zinc-950 background
- Emerald accent color
- Motion animations via `motion/react`
- Mobile-optimized layout

---

## 17. Premium UI Redesign

**File**: `globals.css`

### Design System
- **Typography**: Geist font stack with refined type scale
- **Colors**: Amazon-faithful palette with improved contrast
- **Shadows**: Subtle, depth-aware shadow system
- **Borders**: Refined hairlines with light/strong variants
- **Radius**: Consistent corner radius scale

### Component Upgrades
- **Buttons**: Better hover/active/disabled states
- **Cards**: Subtle border + shadow, hover elevation
- **Tables**: Sticky headers, better row hover
- **Forms**: Teal focus ring, proper select arrows
- **Pills**: Refined color system

### Mobile Improvements
- 48px minimum touch targets
- Better drawer animation with blur backdrop
- Safe area padding for iPhone notch
- Improved responsive breakpoints

### Accessibility
- Visible focus ring on all interactive elements
- Reduced motion support
- Better color contrast ratios
