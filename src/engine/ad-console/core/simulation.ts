/**
 * Simulation Engine — 7-day performance simulation
 *
 * Uses strategy pattern for search term generation (OCP).
 */
import type { Campaign, Metrics, SearchTerm } from './types';
import { generateId, metricDefaults, isFilteredByNegative, isNegativeActive } from './engine';
import { generateSearchTermsForTarget } from './engine/search-term-generator';

/** Sum a set of metric-bearing rows into a single Metrics total. */
function sumMetrics(rows: Array<{ metrics: Metrics } | Metrics>): Metrics {
  return rows.reduce<Metrics>(
    (s, row) => {
      const m = 'metrics' in row ? row.metrics : row;
      return {
        impressions: s.impressions + m.impressions,
        clicks: s.clicks + m.clicks,
        spend: s.spend + m.spend,
        sales: s.sales + m.sales,
        orders: s.orders + m.orders,
      };
    },
    { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  );
}

/**
 * Distribute an integer total across weighted buckets using the largest-remainder
 * method, so the rounded parts sum back to exactly `total` (no cascade drift).
 */
function distributeInt(total: number, weights: number[], weightSum: number): number[] {
  if (!weights.length) return [];
  const raw = weights.map((w) => total * (w / weightSum));
  const floors = raw.map((r) => Math.floor(r));
  const remaining = total - floors.reduce((a, b) => a + b, 0);
  const byFrac = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remaining && k < byFrac.length; k++) floors[byFrac[k].i] += 1;
  return floors;
}

/** Distribute a float total across weighted buckets; the parts sum back to `total`. */
function distributeFloat(total: number, weights: number[], weightSum: number): number[] {
  return weights.map((w) => total * (w / weightSum));
}

/**
 * Simulate `days` of performance for each Enabled campaign: accrues metrics on
 * campaigns, targets, and ad groups, and generates negative-filtered search
 * terms (SP/SB) via the match-type generators. Paused/Archived campaigns and
 * non-keyword targets are left unchanged. Pure — returns new campaign objects.
 */
export function simulateDays(campaigns: Campaign[], days: number = 7): Campaign[] {
  const avgPrice = 29.99;
  return campaigns.map((c) => {
    if (c.status !== 'Enabled') return c;

    const activeNegatives = c.negatives.filter(isNegativeActive);
    const quality =
      activeNegatives.length * 0.03 +
      c.budgetRules.length * 0.02 +
      (c.placements.top > 30 ? 0.04 : 0) +
      (c.type === 'SD' && c.targetingMode.includes('Remarketing') ? 0.05 : 0) +
      (c.campaignGoal === 'Conversions' ? 0.05 : c.campaignGoal === 'Consideration' ? 0.02 : 0);
    const spend = Math.min(
      c.dailyBudget * days * (0.72 + Math.random() * 0.25),
      c.dailyBudget * days,
    );
    const roasBase = c.type === 'SP' ? 3.2 : c.type === 'SB' ? 2.7 : 3.5;
    const sales = spend * (roasBase + quality + (Math.random() - 0.4));
    const clicks = Math.round(spend / Math.max(0.35, c.defaultBid * (0.85 + Math.random() * 0.35)));
    const impressions = Math.round(clicks / (0.006 + Math.random() * 0.012));
    const orders = Math.max(0, Math.round(sales / avgPrice));

    // ── Cascade-preserving distribution ──────────────────────────────────
    // When a campaign has enabled targets, this run's activity is distributed
    // evenly across them so the totals always reconcile: per-target deltas sum
    // exactly to each ad group, and ad groups sum to the campaign. Integer
    // metrics use largest-remainder rounding and the campaign total is derived
    // from the targets, so there's no rounding drift and no independent
    // per-target randomness to diverge. A campaign with no enabled targets has
    // nothing to distribute to, so it accrues at the campaign level directly.
    const enabledTargets = c.targets.filter((t) => t.status === 'Enabled');
    const weights = enabledTargets.map(() => 1);
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    const imprDelta = distributeInt(impressions, weights, weightSum);
    const clickDelta = distributeInt(clicks, weights, weightSum);
    const orderDelta = distributeInt(orders, weights, weightSum);
    const spendDelta = distributeFloat(spend, weights, weightSum);
    const salesDelta = distributeFloat(Math.max(0, sales), weights, weightSum);

    let ti = 0;
    const newTargets = c.targets.map((t) => {
      if (t.status !== 'Enabled') return t;
      const k = ti++;
      return {
        ...t,
        impressions: t.impressions + imprDelta[k],
        clicks: t.clicks + clickDelta[k],
        spend: t.spend + spendDelta[k],
        sales: t.sales + salesDelta[k],
        orders: t.orders + orderDelta[k],
      };
    });

    const hasTargets = enabledTargets.length > 0;

    // Ad group metrics = sum of its targets (enabled + paused carry history).
    // Ad groups with no targets keep their existing metrics.
    const newAdGroups = c.adGroups.map((ag) => {
      const tgts = newTargets.filter((t) => t.adGroupId === ag.id);
      return tgts.length ? { ...ag, metrics: sumMetrics(tgts) } : ag;
    });

    // Campaign metrics: when there are targets, derive from them so
    // campaign == sum(targets) == sum(ad groups) at every level, every run.
    // Otherwise accrue this run's activity at the campaign level.
    const newMetrics: Metrics = hasTargets
      ? sumMetrics(newTargets)
      : {
          impressions: c.metrics.impressions + impressions,
          clicks: c.metrics.clicks + clicks,
          spend: c.metrics.spend + spend,
          sales: c.metrics.sales + Math.max(0, sales),
          orders: c.metrics.orders + orders,
        };

    // Generate search terms for keyword targets using strategy pattern
    // Supports SP and SB campaigns (SD doesn't have search terms by design)
    const generatedST: SearchTerm[] = [];
    const shouldGenerateSearchTerms = c.type === 'SP' || c.type === 'SB';
    
    if (shouldGenerateSearchTerms) {
      for (let si = 0; si < enabledTargets.length; si++) {
        const tgt = enabledTargets[si];
        if (tgt.type !== 'Keyword') continue;
        
        // Use the new generator with negative filtering during generation.
        // Only enabled negatives block terms (disabled ones are kept but inactive).
        const generatedTerms = generateSearchTermsForTarget(
          tgt.value,
          tgt.match as 'Exact' | 'Phrase' | 'Broad',
          c.negatives
            .filter(isNegativeActive)
            .map(n => ({ value: n.value, type: n.type }))
        );
        
        for (let gi = 0; gi < generatedTerms.length; gi++) {
          const gt = generatedTerms[gi];
          // Check if already exists in campaign search terms (avoid duplicates)
          let exists = false;
          for (let ei = 0; ei < c.searchTerms.length; ei++) {
            if (c.searchTerms[ei].term === gt) { exists = true; break; }
          }
          for (let ei = 0; ei < generatedST.length; ei++) {
            if (generatedST[ei].term === gt) { exists = true; break; }
          }
          if (exists) continue;
          
          const termShare = 0.15 + Math.random() * 0.1;
          const termClicks = Math.max(1, Math.round(tgt.clicks * termShare));
          const termSpend = tgt.spend * termShare;
          const roasAdj = tgt.match === 'Exact' ? 4.0 : tgt.match === 'Phrase' ? 2.5 : 1.5;
          const termSales = termSpend * (roasAdj * (0.8 + Math.random() * 0.4));
          const rec = termSales > termSpend * 3 ? 'Add as exact keyword' : termSales < termSpend ? 'Negate' : 'Review';
          const termImpressions = Math.round(termClicks / (0.006 + Math.random() * 0.012));
          generatedST.push({
            id: generateId('ST'),
            campaignId: c.id,
            adGroupId: tgt.adGroupId,
            term: gt,
            targetId: tgt.id,
            targetValue: tgt.value,
            targetType: tgt.type,
            matchType: tgt.match,
            recommendation: rec,
            impressions: termImpressions,
            clicks: termClicks,
            spend: parseFloat(termSpend.toFixed(2)),
            sales: parseFloat(termSales.toFixed(2)),
            orders: Math.max(0, Math.round(termSales / 29.99)),
          });
        }
      }
    }
    const allSearchTerms = c.searchTerms.concat(generatedST);
    // Log the activity actually applied this run.
    const appliedSpend = hasTargets ? spendDelta.reduce((a, b) => a + b, 0) : spend;
    const appliedOrders = hasTargets ? orderDelta.reduce((a, b) => a + b, 0) : orders;
    return {
      ...c,
      metrics: newMetrics,
      targets: newTargets,
      adGroups: newAdGroups,
      searchTerms: allSearchTerms,
      history: [...c.history, `${days}-day simulation: $${appliedSpend.toFixed(2)} spend, ${appliedOrders} orders`],
    };
  });
}
