/**
 * Negative keyword/target slice.
 */
import type { CampaignStatus } from '../types';
import { addNegative, harvestTerm, addNegativeKeyword, addNegativeAsin, addNegativeCategory, removeNegative, setNegativeStatus, toggleNegative } from '../engine';

export interface NegativeSlice {
  addNegative: (campaignId: string, value: string, type: 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category', adGroupId?: string) => void;
  addNegativeKeyword: (campaignId: string, keyword: string, matchType: 'Negative exact' | 'Negative phrase', adGroupId?: string) => void;
  addNegativeAsin: (campaignId: string, asin: string, adGroupId?: string) => void;
  addNegativeCategory: (campaignId: string, categoryId: string, adGroupId?: string) => void;
  removeNegative: (campaignId: string, negativeId: string) => void;
  setNegativeStatus: (campaignId: string, negativeId: string, status: CampaignStatus) => void;
  toggleNegative: (campaignId: string, negativeId: string) => void;
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
  removeNegative: (cid, nid) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? removeNegative(c, nid) : c) },
  })),
  setNegativeStatus: (cid, nid, status) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setNegativeStatus(c, nid, status) : c) },
  })),
  toggleNegative: (cid, nid) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? toggleNegative(c, nid) : c) },
  })),
  harvestTerm: (cid, term) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? harvestTerm(c, term) : c) },
  })),
});