/**
 * Negative keyword/target slice.
 */
import type { AdConsoleState, NegativeType } from '../types';
import { addNegative, harvestTerm, addNegativeKeyword, addNegativeAsin, addNegativeCategory } from '../engine';

export interface NegativeSlice {
  addNegative: (campaignId: string, value: string, type: NegativeType, adGroupId?: string) => void;
  addNegativeKeyword: (campaignId: string, keyword: string, matchType: 'Negative exact' | 'Negative phrase', adGroupId?: string) => void;
  addNegativeAsin: (campaignId: string, asin: string, adGroupId?: string) => void;
  addNegativeCategory: (campaignId: string, categoryId: string, adGroupId?: string) => void;
  harvestTerm: (campaignId: string, term: string) => void;
}

type SetFn = (fn: (s: { state: AdConsoleState }) => { state?: AdConsoleState }) => void;

export const createNegativeSlice = (set: SetFn): NegativeSlice => ({
  addNegative: (cid, value, type, adGroupId) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addNegative({ campaign: c, value, type, adGroupId }) : c) },
  })),
  addNegativeKeyword: (cid, keyword, matchType, adGroupId) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addNegativeKeyword(c, keyword, matchType, adGroupId) : c) },
  })),
  addNegativeAsin: (cid, asin, adGroupId) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addNegativeAsin(c, asin, adGroupId) : c) },
  })),
  addNegativeCategory: (cid, categoryId, adGroupId) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addNegativeCategory(c, categoryId, adGroupId) : c) },
  })),
  harvestTerm: (cid, term) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? harvestTerm(c, term) : c) },
  })),
});
