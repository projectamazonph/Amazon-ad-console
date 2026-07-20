# UI Audit — Live Walkthrough

**Method**: Playwright + Chromium against `npm run dev` (Next.js 16.2.10). Drove every nav item, opened the wizard, tried to break validation, edited bids, ran 7-day simulation, then read the Zustand store from `localStorage` to verify metric math at every level.

> TL;DR: the **seeded scenarios cascade correctly**, but **the simulation engine breaks the cascade** — campaign metrics drift from sum-of-targets by 1–30 units after a single 7-day run, and the **side nav is 100% dead** (6 of 7 advertised feature pages are unreachable from the UI).

---

## 1. Navigation — 6 of 7 advertised features are unreachable

**Topbar** (3 items, all work):
- `Campaign Manager` → h1 "Campaign manager" ✅
- `Portfolios` → h1 "Portfolios" ✅
- `Measurement` → h1 "Advertising dashboard" ✅

**Sidebar** (7 items, **none functional**):
- `Sponsored Products` → h1 "Advertising dashboard" ❌ (should filter to SP)
- `Sponsored Brands` → h1 "Advertising dashboard" ❌
- `Sponsored Display` → h1 "Advertising dashboard" ❌
- `Search catalog` → h1 "Advertising dashboard" ❌
- `Search query performance` → h1 "Advertising dashboard" ❌
- `Run 7-day sim` → h1 "Advertising dashboard" ❌ (does run sim in the background, but the user is left looking at the dashboard)
- `Reset sandbox` → h1 "Advertising dashboard" ❌

**Missing entirely** — these pages are referenced in the code and built into the engine, but **no nav link to any of them**:
- `Drills` — unreachable
- `Missions` — unreachable
- `Reports` — unreachable
- `Bulk` — unreachable
- `Trainer` — unreachable
- `Integrity` — unreachable

Per the handoff doc, these are "core modules" / "training features". From a user's perspective, **half the product is invisible**. The router is reached through the store (`useAdConsoleStore.setView('drills')` etc.), but nothing in the rendered UI ever sets those views.

**Fix**: the `Sidebar` and `Topbar` components in `components/AdConsole/layout/` need to call `setView('drills')` etc. on click. Or replace the dead sidebar items with `onClick={() => setView(...)}` handlers that don't navigate.

---

## 2. Create-Campaign Wizard — accepts garbage and lets you launch

**Step 1 (Ad type)**: works. SP is selected by default; clicking SP/SB/SD toggles `.active`; Next advances. ✅

**Step 2 (Basics) — fields and defaults**:
| # | type | placeholder | default |
|---|------|-------------|---------|
| 0 | (text) | "SP \| Manual \| Training" | "" |
| 1 | (text) | — | "" |
| 2 | number | — | 25 |
| 3 | date | — | 2026-07-20 |
| 4 | date | — | "" |

**Validation issues**:
- **Cleared the campaign name field entirely, clicked Next → advanced to step 3.** ❌ No required-field check on the name.
- **Set daily budget to `-100` → Next → advanced to step 3.** ❌ No min validation; engine has `assertFiniteNonNegative` but it's bypassed here.
- **Set budget to `0` → Next → advanced.** ❌ Amazon's minimum is $1.

**Step 6 (Review & Launch)**:
- Clicked Next blindly through all 6 steps without filling keywords, products, or anything beyond a name. **Launch button is `enabled = true`.** ❌

So the user can:
1. Leave the campaign name blank
2. Set budget to -100
3. Skip keywords/products/creatives entirely
4. Hit Launch

…and it launches. (Whether the engine throws later is a separate question, but the UI doesn't gate it.)

**Fix**: gate the Next button per-step with a `isStepValid` derived from the draft; gate Launch on `isStepValid(1..6) && keywords.length > 0 && products.length > 0`. The validation helpers in `src/lib/validation.ts` already do the heavy lifting — wire them in.

---

## 3. Bid editing — no upper bound, no lower bound, accepts anything

Opened "SP | Auto | Coffee Filter | Discovery" → Targeting tab. Found 4 number inputs.

| Input value | Result | Amazon spec |
|-------------|--------|-------------|
| `-5` | Accepted | min $0.02 ❌ |
| `0` | Accepted | min $0.02 ❌ |
| `0.01` | Accepted (HTML `min="0.02"` exists but is not enforced) | min $0.02 ❌ |
| `99999` | Accepted | max varies by ad type, but $999.99 is the practical ceiling ❌ |
| `abc` | Browser blocks at the input level (good — `type="number"`) | n/a ✅ |

**Fix**: in the bid save handler, call the existing `assertFiniteNonNegative` and add `assertMinBid(0.02)` + `assertMaxBid(999.99)`. The "set programmatically" path bypasses the HTML `min`/`step` attributes, so the constraint must live in the engine or form layer.

---

## 4. Metric cascading — the cascade is **broken by the simulation**

This was the core of the question. The answer is:
- **Seeded data cascades perfectly** (campaign == sum(targets) == sum(adGroups) == AG metrics)
- **After one 7-day simulation run, the cascade breaks**

### Before simulation (initial state)

All 5 enabled campaigns show:
```
campaign.metrics  ==  sum(targets)  ==  sum(adGroups)  ==  AG.metrics
```

For example, "SP | Auto | Coffee Filter | Discovery":
```
campaign:  {impressions: 43800, clicks: 285, spend: 205.20, sales: 684, orders: 28}
sum tgt:   {impressions: 43800, clicks: 285, spend: 205.20, sales: 684, orders: 28}
sum ag:    {impressions: 43800, clicks: 285, spend: 205.20, sales: 684, orders: 28}
adGroup:   {impressions: 43800, clicks: 285, spend: 205.20, sales: 684, orders: 28}
```
✅

### After one 7-day simulation

| Campaign | metric | Campaign | Sum(targets) | Δ |
|----------|--------|----------|--------------|---|
| SP \| Auto \| Discovery | impressions | 62,873 | 62,872 | **+1** |
| SP \| Auto \| Discovery | clicks | 594 | 593 | **+1** |
| SP \| Auto \| Discovery | sales | 1,267.82 | 1,296.07 | **−28.25 (2.2%)** |
| SP \| Manual \| Exact Winners | impressions | 57,370 | 57,369 | **+1** |
| SP \| Manual \| Exact Winners | clicks | 766 | 767 | **−1** |
| SP \| Manual \| Exact Winners | sales | 2,649.58 | 2,761.04 | **−111.46 (4.2%)** |
| SB \| Video \| Brand Awareness | impressions | 54,435 | 54,436 | **−1** |
| SB \| Video \| Brand Awareness | sales | 1,743.76 | 1,644.60 | **+99.16 (5.7%)** |
| SD \| Views Remarketing | sales | 2,132.67 | 2,279.04 | **−146.36 (6.9%)** |
| SD \| Contextual | sales | 1,010.88 | 1,150.01 | **−139.13 (13.7%)** |

> The 1-unit impression/click drift grows with the number of targets and runs (≈ ±N for N targets). Sales drift is **far worse** — typically 2–14% off — and **compounds on every simulation** because target sales are computed with a different random multiplier than campaign sales, so the divergence doesn't self-correct.

### Why (look at `src/engine/ad-console/core/simulation.ts`)

```typescript
// 1) Compute aggregate campaign metrics (unrounded):
const newMetrics = {
  impressions: c.metrics.impressions + impressions,
  clicks: c.metrics.clicks + clicks,
  spend: c.metrics.spend + spend,
  sales: c.metrics.sales + Math.max(0, sales),
  orders: c.metrics.orders + orders,
};

// 2) Distribute to targets (rounded + per-target randomness):
const newTargets = c.targets.map((t) => ({
  ...t,
  impressions: t.impressions + Math.round(impressions * share),  // ROUNDED
  clicks: t.clicks + Math.round(clicks * share),                  // ROUNDED
  spend: t.spend + spend * share,
  sales: t.sales + Math.max(0, sales * share * (0.8 + Math.random() * 0.4)),  // ← DIFFERENT random than campaign
  orders: t.orders + Math.round(orders * share),
}));

// 3) Ad group = sum of (rounded) targets:
const newAdGroups = c.adGroups.map((ag) => ({
  ...ag,
  metrics: tgts.reduce((s, t) => ({  // sum of rounded
    impressions: s.impressions + t.impressions,
    ...
  }), {...}),
}));
```

**Three bugs in one block:**

1. **`Math.round` at target level but not at campaign level** — impression/click totals diverge by up to N (N = number of targets).
2. **Independent random multiplier per target** (`(0.8 + Math.random() * 0.4)`) is applied to `sales`, but the campaign-level `sales` was computed once at the top. So per-target `sales` ≠ `campaign.sales / N` in expectation. After many runs, the targets collectively drift.
3. **Ad-group metrics are derived from the already-rounded target metrics**, not from a separate distribution, which means ad-group totals inherit the rounding error of the target layer rather than being independently computed and reconciled.

### Fix (recommended)

Two-step reconciliation, computed bottom-up from targets:

```typescript
// Compute the full new metrics per target
const newTargets = c.targets.map(t => ({ ...t, ...distribute(t) }));

// Ad group = sum of targets (no rounding at AG level)
const newAdGroups = c.adGroups.map(ag => {
  const tgts = newTargets.filter(t => t.adGroupId === ag.id);
  return { ...ag, metrics: sumMetrics(tgts) };
});

// Campaign = sum of ad groups (single source of truth)
const newMetrics = sumMetrics(newAdGroups.map(ag => ag.metrics));

// Single rounding pass: round each AG's metrics, round the campaign's metrics
// Targets stay unrounded to avoid cascade rounding error
```

This guarantees `sum(targets) == adGroup.metrics == campaign.metrics` at every level, every time, and rolls back the random multiplier per target so aggregate sales is preserved.

---

## 5. Console / runtime errors

None captured during the walkthrough — the app runs cleanly. No `pageerror`, no `console.error`, no failed requests.

---

## 6. What works (don't touch)

- **Initial seeded data is mathematically consistent** at every level. Whoever wrote `scenarios.ts` did the math right; the bug is purely in the simulation step.
- **Ad-group → target cascade is correct** for ad-group metrics that come from the seed. The bug only manifests on `simulateDays()`.
- **Wizard step 1** choice selection + transition.
- **Bid input's HTML `min="0.02"`** is a good first line of defense — only fails because programmatic fills bypass it.
- **Engine has the validation primitives** (`assertFiniteNonNegative`, `assertNonEmpty`, `assertCampaignType`, `assertCampaignStatus`) — they're just not wired into the wizard or the bid save path.
- **localStorage persistence** works and round-trips.

---

## 7. Severity-ranked fix list

1. **Simulation cascade bug** — biggest one. ~2 hr to fix in `simulation.ts` (refactor to bottom-up reconciliation, single rounding pass at the AG/campaign level).
2. **Sidebar dead links** — ~1 hr to wire `onClick={() => setView(...)}` on each item, plus add a "Tools" section linking to the 6 unreachable feature pages.
3. **Wizard step 2 validation** — ~1 hr to add `isStepValid` derived state and disable Next/Launch when invalid.
4. **Bid bounds** — ~30 min in the bid save handler to call `assertMinBid(0.02)` + `assertMaxBid`.
5. **Engine: cascade drift compensation** — once #1 is fixed, also persist the cascade in `useAdConsoleStore` to make sure the persisted state is the reconciled one.

---

## Screenshots

| File | What it shows |
|------|---------------|
| `_audit-wizard-end.png` | Wizard step 6 with Launch enabled, no data filled in |
| `_audit-bids.png` | Targeting tab with multiple bid inputs in invalid states |
| `_audit-after-sim.png` | Dashboard after one 7-day sim — the metrics that now don't add up |
