/**
 * Negative keyword operations and search term filtering.
 */
import type { Campaign, Negative, Target } from '../types';
import { generateId } from './id';

export function isFilteredByNegative(term: string, negatives: Negative[]): boolean {
  const termLower = term.toLowerCase();
  return negatives.some((n) => {
    const negLower = n.value.toLowerCase();
    if (n.type === 'Negative exact') return termLower === negLower;
    if (n.type === 'Negative phrase') return termLower.includes(negLower);
    return false;
  });
}

export function addNegative(
  c: Campaign,
  term: string,
  type: string = 'Negative exact',
): Campaign {
  const agId = c.adGroups[0]?.id ?? generateId('AG');
  const existing = c.negatives.some(
    (n) => n.value.toLowerCase() === term.toLowerCase() && n.type === type,
  );
  if (existing) return c;
  return {
    ...c,
    negatives: [
      ...c.negatives,
      {
        id: generateId('NEG'),
        campaignId: c.id,
        adGroupId: agId,
        type,
        value: term,
      },
    ],
    history: [...c.history, `Negative "${type}" added for "${term}"`],
  };
}

export function harvestTerm(c: Campaign, term: string, targetValue?: string): Campaign {
  const agId = c.adGroups[0]?.id ?? generateId('AG');
  const existing = c.targets.some(
    (t) => t.value.toLowerCase() === term.toLowerCase() && t.type === 'Keyword',
  );
  if (existing) return c;
  const newTarget: Target = {
    id: generateId('T'),
    campaignId: c.id,
    adGroupId: agId,
    type: 'Keyword',
    value: term,
    match: 'Exact',
    bid: 0.75,
    status: 'Enabled',
    impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
  };
  return {
    ...c,
    targets: [...c.targets, newTarget],
    searchTerms: c.searchTerms.map((st) =>
      st.term.toLowerCase() === term.toLowerCase()
        ? { ...st, targetId: newTarget.id, target: term }
        : st,
    ),
    history: [...c.history, `Search term "${term}" harvested as exact keyword`],
  };
}
