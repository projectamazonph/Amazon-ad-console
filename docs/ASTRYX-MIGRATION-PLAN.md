# Astryx Migration Plan

**Status:** Phases 0-5 merged
**Date:** 2026-07-24
**Owner:** Amazon Ad Console
**Approach:** TDD-first, SOLID, theme-preserving, incremental

---

## Why this plan exists

The first Astryx migration (PRs #32–#36) shipped 5 PRs across 6 weeks, broke 14 unit
tests, regressed the global visual theme in three places, and was force-reverted
from `main` on 2026-07-24. This plan replaces that approach with a tighter, test-first
strategy where every commit must:

1. **Pass `npm test`** with the same number of tests as before the change.
2. **Preserve the existing Amazon-themed design tokens** (no visual regression).
3. **Migrate one component per PR** so a regression points to a single diff.
4. **Have a failing test first** for the new behaviour (TDD).
5. **Keep `main` deployable** at every commit.

---

## Audit summary (2026-07-24, pre-migration)

### Codebase scope

- **53** TS/TSX files under `src/components/AdConsole/`
- **2,647** lines of CSS in `src/app/globals.css` (Amazon platform palette)
- **511** passing tests across 33 files
- **0** direct Astryx component imports today (just CSS reset/theme is loaded)

### Custom CSS classes used by the UI (the migration surface)

| Class family | Where | Astryx target |
|---|---|---|
| `.app-navbar` / `.nav-section` / `.nav-brand` | layout/Topbar | `TopNav` + `NavItem` |
| `.app-sidebar` / `.sidebar-item` / `.sidebar-group-title` | layout/Sidebar + mobile/MobileNav | `SideNav` + `Section` + `NavItem` |
| `.card` / `.card.pad` / `.card-title` | every page | `Card` |
| `.btn` / `.btn.primary` / `.btn.blue` / `.btn.danger` / `.btn.warn` | every page | `Button variant=…` |
| `.tabs` / `.tab` | CampaignManager, CampaignDetail | `TabList` + `Item` |
| `.toolbar` | every page that has filters | `Toolbar` |
| `.metric-card` / `.kpi-tile` | Dashboard, CampaignManager, PortfolioOverview | `Card` + `MetricCard` (keep ours) |
| `.table-wrap` + raw `<table>` | every tab | `Table` |
| `.choice-grid` / `.choice-card` | Step1AdType (wizard) | `Grid` + `SelectableCard` |
| `.empty` / `.empty-state` | every tab when no data | `EmptyState` |
| `.input` / `.select` / `.textarea` | every form | `TextInput` / `Selector` / `TextArea` |
| `.badge` (in `.btn.solid .status`/inline pills) | tab tables, headers | `StatusDot` (when boolean) / `Badge` (when labelled) |
| `.banner` / `.alert-inline` | BulkOpsPage errors, login/register | `Banner status=…` |
| `.field` + `<label>` + `<input>` | every form | `Field` + `FieldStatus` + `TextInput` |
| `.sim-overlay` | CampaignManager sim loading | `Dialog` / `Layer` + `Spinner` |
| `.dot` (loading dots) | sim overlay | `Spinner` |
| `.tag` (chips) | Step2Basics, Step6ReviewLaunch | `Token` |
| raw `<h1>` `<h2>` `<h3>` | every page | `Heading as=h1/h2/h3` |
| raw `<p>` / muted text | everywhere | `Text type=…` |

### Astryx components available (catalog checked at 0.1.8)

- **Layout:** `AppShell`, `Layout`, `LayoutContent`, `LayoutNav`, `LayoutTopBar`, `Grid`, `Stack`, `HStack`, `VStack`, `Section`, `Center`, `AspectRatio`, `Layer`
- **Nav:** `TopNav`, `SideNav`, `Section`, `NavItem`, `NavIcon`, `NavMenu`, `MobileNav`, `Breadcrumbs`, `TabList`, `Toolbar`, `Pagination`
- **Surfaces:** `Card`, `ClickableCard`, `SelectableCard`, `EmptyState`, `Outline`
- **Buttons:** `Button`, `IconButton`, `ToggleButton`, `ButtonGroup`
- **Inputs:** `TextInput`, `TextArea`, `NumberInput`, `DateInput`, `DateRangeInput`, `DateTimeInput`, `TimeInput`, `CheckboxInput`, `CheckboxList`, `RadioList`, `Selector`, `MultiSelector`, `Typeahead`, `FileInput`, `Slider`, `Switch`
- **Form helpers:** `Field`, `FieldStatus`, `FormLayout`
- **Display:** `Text`, `Heading`, `Code`, `CodeBlock`, `Kbd`, `Markdown`, `Blockquote`, `Citation`, `MetadataList`, `Thumbnail`, `Avatar`, `AvatarGroup`, `Timestamp`, `StatusDot`, `Token`, `Tokenizer`, `VisuallyHidden`
- **Data:** `Table`, `PowerSearch`, `OverflowList`, `List`, `Item`
- **Feedback:** `Banner`, `AlertDialog`, `Dialog`, `Toast`, `Tooltip`, `Popover`, `HoverCard`, `Skeleton`, `Spinner`, `ProgressBar`
- **Menu:** `CommandPalette`, `ContextMenu`, `MoreMenu`, `DropdownMenu`

### Theme and visual contract

- The Amazon brand palette (`#ff9900` accent, `#131921` top nav, `#eaeded` page bg,
  `#007185` info) is encoded in `:root` CSS variables in `globals.css`. **These must
  not change.** Astryx's `theme-neutral` uses different tokens; we must configure
  Astryx to inherit our `--surface-*`, `--ink-*`, `--border-*`, `--accent-*`,
  `--success`, `--warning`, `--danger`, `--info` tokens via a theme bridge
  (Phase 1).

### The 9 contracts the previous migration broke (do not break again)

1. `ResizeObserver` mock must be a class — Astryx `Text` truncation uses it.
2. `Selector` and `TextInput` do not support `type=number`/`type=date` natively
   (Astryx has `NumberInput` / `DateInput` for those).
3. `as` prop on `Text` is required when rendering headings; can't be cast via JSX.
4. `xstyle` requires a `StyleX.create()` binding; plain `style` prop works.
5. `Button icon={SomeIcon}` requires `ReactNode`, not a function.
6. `Badge label="Neg"` — `Neg` is fine, no enum restriction at runtime.
7. `Target.metrics` does not exist; `Target` has flat fields
   (impressions/clicks/spend/sales/orders).
8. `CampaignDraft.brandKeywords` does not exist; it's `broadKeywords`.
9. `Stack vAlign=baseline` → use `vAlign=center`; `wrap=boolean` → `wrap="wrap"`.

---

## Phase plan

Each phase is a single PR with its own tests. Every phase has a **"must pass" gate**
that blocks the next phase from starting.

### Phase 0 — Foundation (TDD setup, no UI change)

**Goal:** Lock down the existing UI contracts in tests so we can migrate against
them. No Astryx imports yet.

**Files:**
- `vitest.setup.ts` — proper `ResizeObserver` class mock
- `__tests__/contracts/sidebar.test.tsx` — active item reflects view + selected tab
- `__tests__/contracts/topbar.test.tsx` — active section follows view
- `__tests__/contracts/buttons.test.tsx` — every `.btn` variant renders and is clickable
- `__tests__/contracts/cards.test.tsx` — `.card` has correct padding
- `__tests__/contracts/tabs.test.tsx` — `.tab.active` matches store state
- `__tests__/contracts/tables.test.tsx` — `.table-wrap` wraps in scroll container
- `__tests__/contracts/forms.test.tsx` — label-wired inputs render
- `__tests__/contracts/a11y.test.tsx` — main landmark, skip link, nav buttons

**Gate:** `npm test` shows 511+ tests passing. CI green.

### Phase 1 — Theme bridge (theme, no component change)

**Goal:** Configure Astryx to consume our Amazon CSS variables without changing
either side's tokens.

**Files:**
- `src/app/astryx-theme.css` (NEW) — maps Astryx design tokens to our `--surface-*`,
  `--ink-*`, etc.
- `src/app/providers.tsx` — wrap with `AstryxProvider` from `@astryxdesign/core`
- `globals.css` — add the theme bridge import; **no token changes**
- `__tests__/astryx-theme.test.ts` (NEW) — asserts our CSS variables drive Astryx
  components

**Gate:** `npm test` + visual check. The app looks identical. Astryx docs import
without changing visuals.

### Phase 2 — Buttons (the most-reused component)

**Goal:** Migrate every `<button class="btn …">` to `<Button variant="…">` while
keeping all existing behaviour, sizes, and click handlers.

**Mapping:**
| Old | New |
|---|---|
| `<button className="btn primary">` | `<Button variant="primary" />` |
| `<button className="btn blue">` | `<Button variant="info" />` |
| `<button className="btn danger">` | `<Button variant="danger" />` |
| `<button className="btn warn">` | `<Button variant="warning" />` |
| `<button className="btn">` | `<Button variant="secondary" />` |
| `<button className="btn ghost">` | `<Button variant="tertiary" />` |
| `<button className="btn small primary">` | `<Button variant="primary" size="sm" />` |

**Files (one per touched page, 1 PR):**
- `__tests__/Button.contract.test.tsx` (NEW) — covers all variants/sizes/states
- `details/ManagerCampaignsTab.tsx`
- `details/ManagerAdGroupsTab.tsx`
- `details/ManagerTargetsTab.tsx`
- `details/ManagerSearchTermsTab.tsx`
- `details/ManagerNegativesTab.tsx`
- `details/OverviewTab.tsx`, `AdGroupsTab.tsx`, `TargetsTab.tsx`, `NegativesTab.tsx`,
  `BudgetRulesTab.tsx`, `SearchTermsTab.tsx`, `PlacementsTab.tsx`, `HistoryTab.tsx`
- `features/bulk/BulkOpsPage.tsx`, `features/reports/ReportsPage.tsx`,
  `features/drills/DrillsPage.tsx`, `features/missions/MissionsPage.tsx`,
  `features/integrity/IntegrityPage.tsx`, `features/trainer/TrainerPage.tsx`
- `wizard/Step1AdType.tsx` (NEW design with `SelectableCard`)
- `wizard/Step2Basics.tsx` + all Step3/4/5 (SP/SB/SD)
- `wizard/Step6ReviewLaunch.tsx`
- `wizard/CreateCampaignWizard.tsx` (Next/Back)
- `Dashboard.tsx`, `CampaignManager.tsx`, `CampaignDetail.tsx`,
  `PortfolioOverview.tsx`
- `layout/Sidebar.tsx`, `layout/Topbar.tsx` (sidebar/topbar items)
- `mobile/MobileNav.tsx`
- `auth/login/page.tsx`, `auth/register/page.tsx`, `auth/account/page.tsx`
- `landing/page.tsx`

**Gate:** All buttons look identical, all click handlers fire, all sizes/disabled
states preserved. 511+ tests passing.

### Phase 3 — Cards and Surfaces

**Goal:** Migrate `<div className="card pad">` to `<Card>` and metric cards to
`<Card variant="elevated">`.

**Files:**
- `__tests__/Card.contract.test.tsx` (NEW)
- All files touched in Phase 2 that have `.card` containers

**Gate:** Visual identical. Card padding/radius/shadow unchanged. 511+ tests.

### Phase 4 — Form fields

**Goal:** Migrate raw `<input>`/`<select>`/`<textarea>` to Astryx field components
while preserving label/htmlFor wiring (the audit pinned this).

**Mapping:**
| Old | New |
|---|---|
| `<input className="input" type="text">` | `<TextInput />` |
| `<input className="input" type="number">` | `<NumberInput />` |
| `<select className="select">` | `<Selector />` |
| `<textarea className="textarea">` | `<TextArea />` |
| `<div className="field"><label/><input/></div>` | `<Field label="…">…</Field>` |

**Constraint:** `label htmlFor={id}` wiring must remain. We test the wiring in
`a11y.test.tsx` and the existing `tabs.test.tsx` OverviewTab input check.

**Gate:** 511+ tests. a11y.test.tsx green.

### Phase 5 — Tables

**Goal:** Migrate raw `<table>` inside `.table-wrap` to `<Table>` with sticky
header.

**Files:**
- `__tests__/Table.contract.test.tsx` (NEW) — sticky header, hover row, no overflow
- All manager tab tables

**Gate:** Tabular numerals preserved. Sort/filter not regressed. 511+ tests.

### Phase 6 — Tabs (TabList)

**Goal:** Migrate `.tabs`/`.tab` to `<TabList>`.

**Files:**
- `__tests__/TabList.contract.test.tsx` (NEW)
- `CampaignManager.tsx`, `CampaignDetail.tsx`, `BulkOpsPage.tsx`, `ReportsPage.tsx`

**Gate:** 511+ tests.

### Phase 7 — Toolbar (filter bars)

**Goal:** Migrate `.toolbar` to `<Toolbar>`.

**Files:**
- `__tests__/Toolbar.contract.test.tsx` (NEW)
- `CampaignManager.tsx`, `BulkOpsPage.tsx`, `ReportsPage.tsx`

**Gate:** 511+ tests.

### Phase 8 — Wizard Step 1 (SelectableCard grid)

**Goal:** 3 ad-type cards in a `Grid` with `<SelectableCard>` and selection
buttons below (this matches the user's `/aesthetic` request).

**Files:**
- `__tests__/Step1AdType.test.tsx` (NEW) — covers selection state + button click
- `wizard/Step1AdType.tsx`

**Gate:** Selecting a card via button works; visual identical to the existing
`choice-grid` design. 511+ tests.

### Phase 9 — Sidebar (the rebuild)

**Goal:** Replace the custom `.app-sidebar` markup with `<SideNav>` + `<Section>`
+ `<NavItem>`. Keep `resolveSidebarClick`, `isSidebarItemActive`, and
`sidebarSectionForView` as the only place that knows about routes.

**Files:**
- `__tests__/Sidebar.test.tsx` (NEW) — covers all 5 sections, active item,
  action handlers, footer buttons
- `layout/Sidebar.tsx`
- `mobile/MobileNav.tsx` (uses same SideNav, in a Dialog/Drawer)

**Gate:** Visual identical, all routes reachable, all 4 nav groups render, footer
buttons (Run 7-day sim, Reset sandbox) work. 511+ tests.

### Phase 10 — Topbar (TopNav)

**Goal:** Replace `.app-navbar` markup with `<TopNav>` + `<NavItem>`.

**Files:**
- `__tests__/Topbar.test.tsx` (NEW)
- `layout/Topbar.tsx`

**Gate:** Visual identical, all 4 sections, SyncButton + UserMenu still mounted.
511+ tests.

### Phase 11 — AppShell (the layout host)

**Goal:** Wrap the whole app in `<AppShell>` with `TopNav` + `SideNav` slots.

**Files:**
- `__tests__/AppShell.test.tsx` (NEW) — slots render, mobile breakpoint collapses
- `src/app/AdConsole/page.tsx` or `AdConsole.tsx` root

**Gate:** 511+ tests. Mobile/tablet/desktop breakpoints work.

### Phase 12 — Empty states, banners, spinners (the small stuff)

**Goal:** Migrate remaining primitives.

**Files:**
- `__tests__/Banner.contract.test.tsx`
- `__tests__/EmptyState.contract.test.tsx`
- All `.empty` containers → `<EmptyState>`
- All banner/inline alerts → `<Banner status="error|warning|info|success">`
- `.sim-overlay` → `<Dialog>` + `<Spinner>`

**Gate:** 511+ tests.

### Phase 13 — Cleanup (only after all phases merged)

- Remove legacy `.btn` / `.card` / `.tabs` / `.toolbar` / `.table-wrap` /
  `.choice-grid` / `.empty` CSS classes from `globals.css` (and the variables
  they referenced). Anything still using them gets a one-line fix.
- Drop the `feat: complete Astryx Badge migration` work-around (`Badge` was used
  as a temporary substitute for `StatusDot`/`Token` in the previous migration).
- Add a `docs/MIGRATION-NOTES.md` for the team.

**Gate:** No dead CSS rules. `npm test` + `npm run build` green.

---

## TDD conventions

- **Test first, code second.** Every migration PR must include the contract test
  in the same commit that flips the import. No "fix tests later".
- **One test per behaviour, not per component.** A `Button` change is one test file
  that enumerates variants, sizes, states.
- **DOM-level assertions only.** `screen.getByRole`, `screen.getByText`,
  `data-testid` as a last resort. No snapshot tests of CSS.
- **Visual diff is human.** The CI does not check pixel diffs. PR descriptions
  must include a screenshot of the affected page.

---

## SOLID enforcement

The migration touches the Liskov and Interface Segregation boundaries hardest.
The rules:

- **S** — Each new component file owns one render concern. Wrapping `Button`
  inside a `Card` does not mean putting the click handler on the `Card`.
- **O** — Adding a new Astryx variant is a config change, not a refactor.
  No `if (variant === 'foo')` in the wrapper.
- **L** — The new `Sidebar` must accept the same `view` + `setView` props as the
  old one. `isSidebarItemActive` and `resolveSidebarClick` stay the only
  route-aware helpers.
- **I** — Don't pass the whole store to a primitive. `TextInput` gets
  `value` + `onChange` + `label`, never the whole store.
- **D** — Own the data shape in one place: `useCampaignManager`,
  `useCampaignDetail`. View components depend on the hook, not the store.

---

## Rollback

Each phase is a single PR on a single branch (`phase/2-buttons`, `phase/3-cards`).
If a phase regresses, revert the PR and `main` returns to the last green state.
The `main` deploy hook is configured to refuse merges with `vitest` failures.

---

## Phasing rationale

1. **Phase 0** is the safety net — it pins the current behaviour so we can
   migrate against it.
2. **Phase 1** is the theme bridge — without it, Astryx components would look
   off-theme.
3. **Phases 2–7** are the most-used primitives, in order of how often they appear.
4. **Phases 8–10** are the structural rebuilds (wizard step 1, sidebar, topbar).
5. **Phase 11** is the layout host.
6. **Phase 12** is the small stuff.
7. **Phase 13** is the cleanup.

This ordering means **at any point after Phase 4**, the app is at least 60%
migrated and CI is still green if we stop.

---

## Open questions

- **Q1.** Do we keep `theme-neutral` or author a custom theme file that maps to
  our tokens?  (Decision: theme bridge in Phase 1 — we keep `theme-neutral` so we
  inherit any future Astryx fixes, and the bridge maps our variables on top.)
- **Q2.** Do we replace `MetricCard` (our own) with Astryx's, or keep ours? (Decision:
  keep ours — it encodes ACOS tone semantics that aren't in the Astryx API.)
- **Q3.** Astryx's `Selector` doesn't support `aria-current` on a parent group.
  We add a `data-testid` to make testing possible. (Decision: add `data-testid`
  in Phase 4 tests.)
- **Q4.** Does `MobileNav` need a separate redesign? (Decision: Phase 9 reuses the
  same SideNav inside a Dialog/Drawer; no separate design pass.)

---

## Acceptance criteria (whole plan)

- [ ] `main` deploys at every phase boundary.
- [ ] 511+ tests passing at every phase boundary.
- [ ] Zero visual regression compared to the pre-migration screenshots.
- [ ] `npm run build` succeeds at every phase boundary.
- [ ] Phase 0 contract tests are the canonical regression check.
- [ ] All "9 contracts the previous migration broke" remain unbroken
      (verified by a `__tests__/contracts/` smoke test file).
