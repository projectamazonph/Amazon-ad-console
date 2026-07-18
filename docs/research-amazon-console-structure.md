# Research: Amazon Advertising Console — Entity Model & Navigation

Grounded in the real Amazon Advertising Console (advertising.amazon.com) and
cross-checked against this repo's engine (`src/engine/ad-console/core/types.ts`,
`engine.ts`, `scenarios.ts`). Live scraping of Amazon help pages is blocked by
bot protection, so this reflects the console's stable, well-established structure.

## Real console entity hierarchy (nesting)

```
Account (Training Account)
└── Portfolio            (optional grouping; name only in this sim)
    └── Campaign         (SP | SB | SD)
        ├── settings: name, portfolio, start/end date, daily budget,
        │             bidding strategy, campaign type, placements
        ├── Ad group    (1..n)
        │   ├── settings: name, status, default bid
        │   └── Target / Keyword   (1..n)
        │       ├── SP manual: keyword + match type (Exact/Phrase/Broad) + bid + status
        │       ├── SP auto:   auto targets (close/loose/substitutes/complements)
        │       └── SD:        audiences / products / categories
        ├── Search term (SP only; report rows linked to a target)
        ├── Negative     (negative exact / negative phrase; campaign or ad-group level)
        └── Budget rule  (scheduled / performance-based budget adjustment)
```

## Navigation (real console)

- Global nav: **Campaign Manager**, **Portfolios**, **Measurement**, **Brands**
  (creative assets), **Stores**.
- Campaign Manager → campaign list (filter by type/status/portfolio + date range)
  → click campaign → detail with tabs:
  - **Ad groups** → click an ad group → its keywords/targets (nested drill-down)
  - **Targeting / Keywords**
  - **Search terms** (SP) → Negate / Add-as-exact actions
  - **Negative keywords**
  - **Reach / Placements** (SP: Top of Search / Product pages / Rest of Search)
  - **Budget rules**
  - **Change history**
- Editing is inline (edit pencil) or via **Edit** buttons; save persists.

## Metrics cascade

keyword → ad group → campaign → account
Raw: impressions, clicks, spend, sales, orders, units
Derived: CTR, CPC, ACoS, ROAS, CvR

## Current repo coverage vs. gaps

| Capability | Status in repo |
|------------|----------------|
| Global nav (Campaign Manager / Portfolios / Measurement) | Done (reskin PR #9) |
| Dashboard KPI tiles | Done |
| Campaign list + filter | Done |
| Campaign detail tabs (overview/adgroups/targets/searchTerms/negatives/budgetRules/placements/history) | Done (read-mostly) |
| Edit campaign settings (budget, default bid, bid strategy, status) | Done |
| Edit placements | Done |
| Add/remove/bid/pause target (keyword) | Done |
| Add negative / harvest search term | Done |
| **Ad group CRUD (add/rename/status/default-bid/delete)** | **MISSING** |
| **Add target to a chosen ad group** | **MISSING** (always adGroups[0]) |
| **Ad group detail drill-down (nested targets)** | **MISSING** |
| Portfolio management (create/rename/assign) | Partial (name field only) |
| Simulation (7-day) | Done |

## Conclusion for the build

To let a student "familiarize navigation, edit campaigns, ad groups, down to
target level" with correct nesting, the repo needs:
1. Engine ad-group operations (TDD) + `addTarget(campaign, adGroupId, ...)`.
2. Store wiring for those operations.
3. Editable Ad groups tab + click-to-drill into an ad group's targets.
4. Add-keyword form that picks the target ad group.
5. This map as living documentation.
