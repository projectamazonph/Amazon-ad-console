/**
 * Hook: useSearchTerms
 * Returns search terms for a campaign, filtered by negatives (DIP).
 */
import { useMemo } from 'react';
import { isFilteredByNegative } from '@/engine/ad-console/engine';
import type { Campaign } from '@/engine/ad-console/types';

export interface SearchTermsResult {
  terms: string[];
  count: number;
}

export function useSearchTerms(campaign: Campaign): SearchTermsResult {
  return useMemo(() => {
    const terms = (campaign.searchTerms || [])
      .filter((st) => !isFilteredByNegative(st.term, campaign.negatives))
      .map((st) => st.term);
    return { terms, count: terms.length };
  }, [campaign.searchTerms, campaign.negatives]);
}
