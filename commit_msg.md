feat(phase-5): migrate .table-wrap to Astryx Table (theme-preserving)

Phase 5 of the 13-phase Astryx migration. Every `<div className="table-wrap"><table>...</table></div>` in the codebase is now an Astryx `<Table>` (children mode) with the Amazon platform look preserved via the Phase 1 theme bridge.

### How the migration maps

| Old | New |
|---|---|
| `<div className="table-wrap"><table>...</table></div>` | `<Table>...</Table>` (children mode keeps raw `<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>` JSX intact) |

### Why children mode, not the data-driven API

The existing tables carry a lot of inline content (raw `<input>` for bid edits, Astryx `<Button>` for actions, pills, formatted text). The data-driven API would force every row's `renderCell` to be a closure over local state, which is a much bigger refactor with no functional gain for the look-and-feel migration. Children mode keeps the same DOM output but emits the stable `.astryx-table` and `.astryx-table-scroll-wrapper` classes that we can theme through the bridge.

### Bridge CSS

`src/app/astryx-theme.css` gains a `.astryx-table-scroll-wrapper` block that gives the new wrapper the same card-in-table look the old `.table-wrap` had: `overflow-x: auto`, `--radius-lg` corner, soft border, surface background, plus a `--radius-md` override at 900px for mobile. The existing global `th`/`td`/`tr:hover`/`.mono`/`.money` rules in `globals.css` already style the cells (sticky header, padding, hover rows, tabular-nums) and apply unchanged to the `<th>`/`<td>` inside the Astryx Table.

### globals.css cleanup

The legacy `.table-wrap` rule is removed (the bridge now provides the equivalent styling under the new class name). The `@media (max-width: 900px)` responsive override is updated to target `.astryx-table-scroll-wrapper`.

### A11y contract (preserved)

- All `<th>`/`<td>` elements continue to render with their `htmlFor`/`id` wiring where applicable.
- Inline `<TextInput>`/`<NumberInput>`/`<Selector>` inside table cells (Phases 4 inputs) remain functional and labelled.
- The scroll wrapper exposes `role="group"` and `aria-label="@astryx.table.label"` from Astryx (the default label is fine for plain data tables; it can be overridden per-table later if needed).

### `tables-astryx.test.tsx` (NEW) — 12 contract tests

- `.astryx-table` is rendered inside `.astryx-table-scroll-wrapper`
- No leftover `.table-wrap` class in DOM
- No leftover `.table-wrap` rule in globals.css
- `.astryx-table-scroll-wrapper` has `overflow-x: auto` via bridge CSS
- `.astryx-table-scroll-wrapper` has border + radius
- `<th>` elements exist and are non-empty
- `<th>` sticky positioning is still defined
- `<th>` uppercase + letter-spacing still defined
- `.mono` tabular-nums still defined
- `tr:hover td` background rule still defined
- `td` padding rule still defined
- `tr:last-child td` no-border rule still defined

`tables.test.tsx` (Phase 0) **deleted** — the pre-migration `.table-wrap` contract is obsolete.

### Files changed (19 .tsx + 2 .css + 1 new test)

- `src/components/AdConsole/__tests__/contracts/tables-astryx.test.tsx` (**NEW**) — 12 contract tests
- `src/components/AdConsole/Dashboard.tsx` — 1 table
- `src/components/AdConsole/PortfolioOverview.tsx` — 1 table
- `src/components/AdConsole/details/AdGroupsTab.tsx` — 2 tables
- `src/components/AdConsole/details/BudgetRulesTab.tsx` — 1 table
- `src/components/AdConsole/details/ManagerAdGroupsTab.tsx` — 1 table
- `src/components/AdConsole/details/ManagerCampaignsTab.tsx` — 1 table
- `src/components/AdConsole/details/ManagerNegativesTab.tsx` — 1 table
- `src/components/AdConsole/details/ManagerSearchTermsTab.tsx` — 1 table
- `src/components/AdConsole/details/ManagerTargetsTab.tsx` — 1 table
- `src/components/AdConsole/details/NegativesTab.tsx` — 1 table
- `src/components/AdConsole/details/OverviewTab.tsx` — 1 table
- `src/components/AdConsole/details/SearchTermsTab.tsx` — 1 table
- `src/components/AdConsole/details/TargetsTab.tsx` — 1 table
- `src/components/AdConsole/features/bulk/BulkOpsPage.tsx` — 1 table
- `src/components/AdConsole/features/drills/DrillsPage.tsx` — 1 table
- `src/components/AdConsole/features/reports/ReportsPage.tsx` — 1 table
- `src/components/AdConsole/features/trainer/TrainerPage.tsx` — 1 table
- `src/components/AdConsole/wizard/steps/sb/Step3ProductsCreative.tsx` — 1 table
- `src/app/astryx-theme.css` — added `.astryx-table-scroll-wrapper` bridge block
- `src/app/globals.css` — removed `.table-wrap` rule, updated `@media` override
- `src/components/AdConsole/__tests__/contracts/tables.test.tsx` (**DELETED**)
- `docs/ASTRYX-MIGRATION-PLAN.md` — status bumped to "Phases 0-5 merged"
- `scripts/migrate_tables.py` (NEW) — one-shot migration script

### Test results

- **618 passing** (was 615: +12 new tables-astryx tests, -9 from deleted `tables.test.tsx`)
- 0 TS errors
- `npm run build` succeeds — 9 routes prerender cleanly

### Migration plan reference

`docs/ASTRYX-MIGRATION-PLAN.md` Phase 5 of 13. Next: Phase 6 — Tabs (TabList).
