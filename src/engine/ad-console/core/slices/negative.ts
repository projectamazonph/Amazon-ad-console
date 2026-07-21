/**
 * Negative keyword/target slice.
 */
import { addNegative, harvestTerm, addNegativeKeyword, addNegativeAsin, addNegativeCategory } from '../engine';

export interface NegativeSlice {
  addNegative: (campaignId: string, value: string, type: 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category', adGroupId?: string) => void;
  addNegativeKeyword: (campaignId: string, keyword: string, matchType: 'Negative exact' | 'Negative phrase', adGroupId?: string) => void;
  addNegativeAsin: (campaignId: string, asin: string, adGroupId?: string) => void;
  addNegativeCategory: (campaignId: string, categoryId: string, adGroupId?: string) => void;
  harvestTerm: (campaignId: string, term: string) => void;
}

export const createNegativeSlice = (set: any, ..._rest: any[]): NegativeSlice => ({
  addNegative: (cid, value, type, adGroupId) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addNegative({ campaign: c, value, type, adGroupId }) : c) },
  })),
  addNegativeKeyword: (cid, keyword, matchType, adGroupId) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addNegativeKeyword(c, keyword, matchType, adGroupId) : c) },
  })),
  addNegativeAsin: (cid, asin, adGroupId) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addNegativeAsin(c, asin, adGroupId) : c) },
  })),
  addNegativeCategory: (cid, categoryId, adGroupId) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addNegativeCategory(c, categoryId, adGroupId) : c) },
  })),
  harvestTerm: (cid, term) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? harvestTerm(c, term) : c) },
  })),
});