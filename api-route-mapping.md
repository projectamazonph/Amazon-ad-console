# API Route Mapping — UI Spec ↔ Prisma Schema

Each row: the UI surface (from `ppc-simulator-ui-ux-spec.md`) → the route → which Prisma model(s)/fields it touches. Routes assume Next.js 15 App Router (`app/api/.../route.ts`), but the same mapping works as server actions if you'd rather skip a formal REST layer — call that out per-route where it matters.

Convention: `[seller]` = `MockSellerAccount.id`, scoped via session/cookie, not re-passed in every body — every route below implicitly filters by the trainee's active seller account.

---

## 1. Global shell

| UI element | Route | Prisma operation |
|---|---|---|
| Account switcher dropdown | `GET /api/accounts` | `prisma.mockSellerAccount.findMany({ where: { traineeId } })` |
| Switch active account | `POST /api/session/active-account` | writes to session/cookie only — no schema mutation |
| Global search | `GET /api/search?q=` | parallel `findMany` across `Campaign`, `AdGroup`, `MockProduct` with `contains` on name/title/asin, `take: 5` each |
| Date range picker | client-side state, passed as `?from=&to=` query param to every metrics route below | — |
| Notifications bell | `GET /api/notifications` | derived, not stored: query for `Ad.sbReviewStatus = PENDING_REVIEW`, `Campaign.isBudgetLimited = true`, recent `AutomationRule` triggers — compute on read rather than a dedicated table unless you want persistence/read-state, in which case add a `Notification` model |

---

## 2. Campaign Manager (home)

| UI element | Route | Prisma operation |
|---|---|---|
| KPI strip | `GET /api/campaigns/summary?from=&to=` | `prisma.performanceMetric.groupBy({ by: [], where: { campaignId: { in: [...] }, date: { gte, lte } }, _sum: { impressions, clicks, spend, sales } })` |
| Campaign table | `GET /api/campaigns?type=&status=&portfolioId=&q=` | `prisma.campaign.findMany({ where: {...}, include: { performanceMetrics: { where: { date: {gte,lte} } } } })` — aggregate metrics in the API layer before returning, don't ship raw daily rows to the table |
| Status toggle | `PATCH /api/campaigns/[id]` `{ status }` | `prisma.campaign.update({ where: { id }, data: { status } })` |
| Inline budget edit | `PATCH /api/campaigns/[id]` `{ budgetAmount }` | same `campaign.update` |
| Bulk pause/enable/archive | `PATCH /api/campaigns/bulk` `{ ids: [], status }` | `prisma.campaign.updateMany({ where: { id: { in: ids } }, data: { status } })` |
| Column customizer | client-side `localStorage` only | not a schema concern |
| "Create campaign" | navigates to `/campaigns/new` | — |

---

## 3. Create Campaign wizard (all three types)

| Step | Route | Prisma operation |
|---|---|---|
| Type selection | none (client routing) | reads `MockSellerAccount.isBrandRegistered`/`hasBrandStore` already fetched on session load, to grey out SB/SD cards |
| Settings step | held in client wizard state until final submit — **don't write partial campaigns per step**, except for SB "Drafts" (see §3a) | — |
| Product search (SP/SB/SD ad group step) | `GET /api/products/search?q=&sellerId=` | `prisma.mockProduct.findMany({ where: { sellerAccountId, OR: [{ title: { contains: q } }, { asin: { contains: q } }] } })` — include `inStock`, `hasBuyBox` so eligibility badge renders without a second call |
| Suggested keywords (mock) | `GET /api/keywords/suggestions?productId=&category=` | not schema-backed — a deterministic mock generator function, seeded by product category, returning `{ text, matchType, suggestedBidLow, suggestedBidHigh }[]` |
| Final "Launch campaign" submit | `POST /api/campaigns` — single payload with nested `adGroups`, `keywords`/`productTargets`/`audienceTargets`, `negativeKeywords` | `prisma.campaign.create({ data: { ..., adGroups: { create: [{ ..., keywords: { create: [...] }, ads: { create: [...] } }] }, negativeKeywords: { create: [...] } } })` — one nested write, since a half-created campaign is a confusing trainee-facing failure mode. Wrap in `prisma.$transaction` if you split it into multiple calls instead. |

### 3a. SB-specific
| UI element | Route | Prisma operation |
|---|---|---|
| Save as Draft | `POST /api/campaigns/draft` | same shape as above but `status: 'ENABLED'` is withheld — model this as a `isDraft: Boolean` flag on `Campaign` (add to schema) rather than overloading `EntityStatus`, since a draft isn't really "paused" |
| Submit for review | `POST /api/campaigns` then immediately `PATCH /api/ads/[id]` `{ sbReviewStatus: 'PENDING_REVIEW' }` | `prisma.ad.update(...)` — pair with a background job/cron (or a simple "advance simulated time" trainee action) that flips `PENDING_REVIEW → ENABLED` after the mock 72hr window |
| Store sub-page eligibility check | `GET /api/accounts/[id]/store-status` | `prisma.mockSellerAccount.findUnique({ select: { hasBrandStore, storeSubpageCount } })` |

### 3b. SD-specific
| UI element | Route | Prisma operation |
|---|---|---|
| Segment size estimate (mock) | `GET /api/audiences/segment-size?segmentType=` | mock function, not schema-backed — return a pseudo-random but stable number per segment type so it doesn't flicker on re-render |

---

## 4. Campaign detail page

| Tab | Route | Prisma operation |
|---|---|---|
| Page shell / KPI strip | `GET /api/campaigns/[id]` | `prisma.campaign.findUnique({ where: { id }, include: { adGroups: true, placementAdjustments: true } })` + a metrics aggregate call scoped to `campaignId` |
| Ad groups tab | `GET /api/campaigns/[id]/ad-groups` | `prisma.adGroup.findMany({ where: { campaignId }, include: { performanceMetrics: {...} } })` |
| Create ad group | `POST /api/campaigns/[id]/ad-groups` | `prisma.adGroup.create({ data: { campaignId, name, defaultBid } })` |
| Targeting tab | `GET /api/ad-groups/[id]/targeting` | union of `keyword.findMany`, `productTarget.findMany`, `audienceTarget.findMany` filtered by `adGroupId` — return as one normalized array with a `kind` discriminator for the table to render generically |
| Inline bid edit (any targeting row) | `PATCH /api/targeting/[kind]/[id]` `{ bid }` | routes to the matching model's `update` based on `kind` param (`keyword` / `product-target` / `audience-target`) |
| Negative targeting tab | `GET /api/campaigns/[id]/negatives` + `GET /api/ad-groups/[id]/negatives` | `negativeKeyword.findMany` / `negativeProductTarget.findMany`, both filtered by either `campaignId` or `adGroupId` |
| Add negative | `POST /api/negatives` `{ scope: 'campaign'|'adGroup', id, text, matchType }` | `prisma.negativeKeyword.create({ data: { [scope === 'campaign' ? 'campaignId' : 'adGroupId']: id, text, matchType } })` |
| Search terms tab | `GET /api/ad-groups/[id]/search-terms?from=&to=` | `prisma.searchTermReportRow.findMany({ where: { adGroupId, date: { gte, lte } } })` |
| "Add as keyword" action | `POST /api/search-terms/[rowId]/promote` `{ matchType, bid }` | `prisma.$transaction([ prisma.keyword.create({ data: {...} }), prisma.searchTermReportRow.update({ where: { id: rowId }, data: { promotedKeywordId: newKeyword.id } }) ])` |
| "Add as negative" action | `POST /api/search-terms/[rowId]/negate` `{ matchType }` | `prisma.$transaction([ prisma.negativeKeyword.create({...}), prisma.searchTermReportRow.update({ where: { id: rowId }, data: { addedAsNegative: true } }) ])` |
| Placements tab | `GET/PATCH /api/campaigns/[id]/placements` | `placementBidAdjustment.findMany` / `upsert` per placement type |
| Creative tab (SB) | `GET/PATCH /api/ads/[id]` | reads/writes the SB-specific nullable fields on `Ad` |

---

## 5. Keyword/target drawer

| UI element | Route | Prisma operation |
|---|---|---|
| Drawer contents on row click | `GET /api/targeting/[kind]/[id]` | single-row fetch with its `performanceMetrics` relation, date-ranged |
| Trend chart data | same call above, just unaggregated daily rows fed straight into Recharts | `performanceMetric.findMany({ where: { keywordId: id, date: {...} }, orderBy: { date: 'asc' } })` |
| Pause/Archive from drawer | `PATCH /api/targeting/[kind]/[id]` `{ status }` | matching model `update` |

---

## 6. Other pages

| Page | Route | Prisma operation |
|---|---|---|
| Products page | `GET /api/products?sellerId=` | `mockProduct.findMany` + a metrics rollup joined via `Ad.productId` |
| "Add to campaign" from Products | `POST /api/ad-groups/[id]/ads` `{ productId }` | `prisma.ad.create({ data: { adGroupId, productId } })` |
| Targeting page (account-wide) | `GET /api/targeting?sellerId=&from=&to=` | same union query as §4's targeting tab, but unscoped to one ad group — filter by `adGroup.campaign.sellerAccountId` via nested `where` |
| Budgets page | `GET /api/budgets?sellerId=` | reads `Campaign.budgetAmount`, `isBudgetLimited`, and a derived "% time in budget" — this needs either a `BudgetPacingLog` model (add if you want it persisted) or a computed estimate from `PerformanceMetric` spend-vs-budget ratios per day |
| Bulk Operations download | `GET /api/bulk-operations/export?sellerId=` | flattens `Campaign` + `AdGroup` + `Keyword`/`ProductTarget` into one CSV/XLSX via a library like `exceljs`, not a Prisma concern beyond the source query |
| Bulk Operations upload | `POST /api/bulk-operations/import` (multipart) | parses the sheet, validates row-by-row (currency symbols, missing IDs, invalid enum values), then issues a `prisma.$transaction` of creates/updates — **return a structured per-row result array** so the UI's error log (spec §10) has something specific to render, not just a boolean |
| Recommendations | `GET /api/recommendations?sellerId=` | mock generator reading current `PerformanceMetric` aggregates to produce plausible suggestions — not a true ML model, but should reference real numbers from the account so it doesn't feel canned |
| Accept/Dismiss recommendation | `POST /api/recommendations/[id]/respond` `{ action: 'accept'|'dismiss' }` | if "accept" maps to a concrete mutation (e.g. raise a bid), perform that target model's `update`; log the response either way — add a lightweight `RecommendationResponse` model if you want this to persist across sessions |
| Measurement & Reporting — Create report | `POST /api/reports` `{ adProduct, reportType, dateRange }` | routes to the matching query: Search term → `searchTermReportRow.findMany`; Placement → `performanceMetric.findMany({ where: { placement: { not: null } } })`; Targeting → the union query from §4; Search Term Impression Share / Category Benchmark → mock-generated, since these reflect competitive data with no real "other advertisers" in a single-tenant simulator |
| Brand Store builder | `GET/PATCH /api/accounts/[id]/store` | extend schema with a lightweight `BrandStorePage` model (id, sellerAccountId, title, blocks: Json) if you build this beyond the stub described in the spec |
| Settings — Billing/User access | mock-only, no real Prisma writes needed unless you want role-based access control for team accounts | — |

---

## 7. Scenario Mode

| UI element | Route | Prisma operation |
|---|---|---|
| Start a scenario | `POST /api/scenarios/[templateId]/start` | `prisma.scenarioRun.create({ data: { traineeId, templateId } })`, then apply `ScenarioTemplate.seedConfig` (a JSON object) to mutate the trainee's `MockSellerAccount` into the required starting state — e.g. force `hasBrandStore: false` |
| Task panel checklist | `GET /api/scenarios/runs/[id]/checks` | re-evaluates `ScenarioTemplate.successCriteria` (JSON) against current DB state on every poll — this is a server-side function, not a stored boolean, so it stays accurate after every trainee mutation |
| Recommended polling | client polls this endpoint every 3–5s while a run is active, or re-fetches after every mutation response (cheaper than a timer) | — |
| Completion | `POST /api/scenarios/runs/[id]/complete` | `prisma.scenarioRun.update({ data: { completedAt, passed, score } })`, writing the final `ScenarioCheck` rows for audit/review |

---

## 8. Cross-cutting notes for the coder

- **Aggregation belongs in the API layer, not the client.** Every table/KPI strip above expects pre-aggregated numbers; don't ship raw `PerformanceMetric` rows to the browser and sum them in React — it won't scale once mock data engine seeds months of history.
- **Use one shared "targeting" abstraction.** Keywords, product targets, and audience targets are different Prisma models but render through the identical table/drawer UI. Build one `/api/targeting/[kind]/[id]` family of routes with a `kind` discriminator rather than three parallel API surfaces — this mirrors the spec's instruction to build one `<TargetingEditor>` component.
- **Every mutation route should return the updated row(s), not just `{ success: true }`.** The UI's optimistic-update pattern (inline edit, status toggle) needs the server's canonical value back in case of a race or a computed field changing (e.g. `isBudgetLimited` flipping after a budget edit).
- **Scenario validation must be re-run from scratch, not incrementally patched.** Don't try to maintain `ScenarioCheck.passed` as a cache updated by every individual mutation route — that couples every other route to the scenario engine. Keep it as a separate, idempotent "evaluate this template's criteria against current state" function called only by the checks endpoint.
