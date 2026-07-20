/**
 * Simulation Engine — 7-day performance simulation
 *
 * Uses strategy pattern for search term generation (OCP).
 */
import type { Campaign, Metrics, SearchTerm } from './types';
import { generateId, metricDefaults, isFilteredByNegative, isNegativeActive } from './engine';
import { generateSearchTermsForTarget } from './engine/search-term-generator';

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

    const newMetrics: Metrics = {
      impressions: c.metrics.impressions + impressions,
      clicks: c.metrics.clicks + clicks,
      spend: c.metrics.spend + spend,
      sales: c.metrics.sales + Math.max(0, sales),
      orders: c.metrics.orders + orders,
    };

    const enabledTargets = c.targets.filter((t) => t.status === 'Enabled');
    const share = 1 / Math.max(1, enabledTargets.length);
    const newTargets = c.targets.map((t) => {
      if (t.status !== 'Enabled') return t;
      return {
        ...t,
        impressions: t.impressions + Math.round(impressions * share),
        clicks: t.clicks + Math.round(clicks * share),
        spend: t.spend + spend * share,
        sales: t.sales + Math.max(0, sales * share * (0.8 + Math.random() * 0.4)),
        orders: t.orders + Math.round(orders * share),
      };
    });

    const newAdGroups = c.adGroups.map((ag) => {
      const tgts = newTargets.filter((t) => t.adGroupId === ag.id);
      if (tgts.length) {
        const agMetrics = tgts.reduce(
          (s, t) => ({
            impressions: s.impressions + t.impressions,
            clicks: s.clicks + t.clicks,
            spend: s.spend + t.spend,
            sales: s.sales + t.sales,
            orders: s.orders + t.orders,
          }),
          { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
        );
        return { ...ag, metrics: agMetrics };
      }
      return { ...ag, metrics: metricDefaults({}) };
    });

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
    return {
      ...c,
      metrics: newMetrics,
      targets: newTargets,
      adGroups: newAdGroups,
      searchTerms: allSearchTerms,
      history: [...c.history, `${days}-day simulation: $${spend.toFixed(2)} spend, ${orders} orders`],
    };
  });
}
