# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This file starts at 3.6.0 — earlier releases were not retroactively documented.

## [3.6.0] - 2026-08-03

### Fixed

- **Sidebar navigation was never mounted.** The `Sidebar` component and its
  `getLeftRail`/training-rail nav model (`nav/consoleNav.ts`) were fully
  built and unit-tested but never rendered into `AdConsole.tsx` — Missions,
  Reports, Bulk ops, Trainer, and Integrity were unreachable from the
  desktop UI. `MobileNav` had the same gap from a different angle (its
  section resolution only ever returned `campaigns`/`portfolio`). Both are
  now wired through the shared `sidebarSectionForView`/`isSidebarItemActive`/
  `resolveSidebarClick` helpers.
- **Every Astryx `Card`'s `padding` prop silently rendered as `0px`
  sitewide.** Root cause: Astryx ships component styles inside
  `@layer astryx-base`/`@layer astryx-theme`, and per the CSS
  cascade-layers spec an unlayered declaration always beats a layered one
  regardless of specificity. This app's global reset
  (`*, *::before, *::after { ...; padding: 0; }`) was unlayered, so it
  unconditionally zeroed every Astryx padding prop — this is why content
  (buttons, headings, form fields) so often sat flush against card edges.
  Scoped the reset down to just `ul`/`ol` (the only elements relying on it).
- Campaign creation wizard's Review & Launch step showed a "Lookback: 30
  days" row on every campaign, including plain Sponsored Products, because
  `audienceLookback` defaults to `'30'` regardless of type. Gated it on the
  campaign's targeting mode actually being an audience mode. Also added
  missing review rows for ASIN/category/audience targets and SB/SD creative
  fields (headline, brand, destination) that were entered earlier in the
  wizard but never shown before launch.
- `.split`'s `2fr 1fr` grid (dashboard "Operator alerts"/"Training
  coverage" cards) didn't shrink to fit once the sidebar took up real
  width, clipping content past the viewport edge. Fixed with
  `minmax(0, ...)` tracks.
- `adjustTargetBid` (the "-10%"/"+10%" bid buttons) threw an uncaught
  error when decrementing an already-cheap bid below the platform
  minimum, instead of flooring it — a regression from the bid
  fail-fast change below.
- `setTargetBid`/`setAdGroupDefaultBid` no longer silently substitute a
  bid below the real $0.02 minimum; they fail fast via a new
  `assertValidBid`/`MIN_BID` (`src/lib/validation.ts`), matching this
  codebase's existing fail-fast convention. Creation/normalization paths
  (`addTarget`, `normalizeCampaign`) still clamp, since those fill in
  defaults for incomplete data rather than acting on explicit user intent.
- Campaign Manager's empty state no longer says "No campaigns yet" when a
  search/filter simply matched nothing — it now shows a distinct "no
  matches" state with a "Clear filters" action.
- Fixed a campaign-ID collision risk in `launchCampaign` (two campaigns of
  the same type launched within the same millisecond could get the same
  ID) by switching to the shared `generateId` helper, and deduplicated the
  same ad-hoc ID-generation pattern across the `profiles`/`reports`/
  `trainer`/`integrity` feature engines.
- Fixed literal mojibake (`ΓÇö`, `ΓåÆ`) in the landing page copy and a
  missing `.object-cover` rule that left two landing-page images without
  `object-fit` applied.
- Replaced dead Tailwind sizing classes (`w-6 h-6`, `w-4 h-4`) on landing
  page icons with explicit SVG dimensions — this repo has no Tailwind
  compiler wired up, so the classes were doing nothing.

### Added

- Contract tests pinning the sidebar fix (renders, drives navigation to
  the previously-unreachable views) and the wizard review-step fix.
- Regression tests for `isVideoFormat`, the shared `generateId` migration
  (same-millisecond uniqueness across all four feature engines), and the
  simulation's search-term dedup across repeated `simulateDays` calls.

### Changed

- Deduplicated hand-rolled metrics/formatter logic in `PortfolioOverview`,
  `Dashboard`, and `CampaignManager` onto the shared `totalMetrics`/
  `formatMoney`/`formatWhole`/`formatPercent` engine functions.
- Un-Card-wrapped dense tables in `PortfolioOverview`, `Dashboard`,
  `OverviewTab`, `BulkOpsPage`, and `ReportsPage` per this repo's own
  convention (dense data renders edge-to-edge, `Card` is for dashboard
  widgets/settings groups only).
- Fixed an O(n·m) duplicate-detection loop in the search-term simulator
  (now O(1) via a `Set`) and memoized a few expensive per-render
  aggregations (`Dashboard`, `ManagerSearchTermsTab`).
- Removed 13 dead `useState` hooks and unused imports from
  `CreateCampaignWizard`.
