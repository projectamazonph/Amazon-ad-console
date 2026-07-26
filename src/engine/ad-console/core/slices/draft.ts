/**
 * Draft slice — wizard draft state and actions.
 */
import type { StateCreator } from 'zustand';
import type { CampaignDraft, CampaignStatus, MatchType, AdFormat, BidStrategy, TargetingMode, CampaignType } from '../types';
import { selectProduct, removeProduct, parseKeywords } from '../engine';

export interface DraftSlice {
  draft: CampaignDraft;
  wizardStep: number;
  updateDraft: <K extends keyof CampaignDraft>(field: K, value: CampaignDraft[K] | string) => void;
  setWizardStep: (step: number) => void;
  resetDraft: () => void;
  selectProduct: (asin: string) => void;
  removeProduct: (asin: string) => void;
}

export function makeDraft(): CampaignDraft {
  return {
    type: 'SP', name: '', portfolio: '', status: 'Enabled',
    dailyBudget: 25, defaultBid: 0.75,
    startDate: new Date().toISOString().slice(0, 10), endDate: '',
    targetingMode: 'Automatic', adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'], creative: {},
    exactKeywords: '',
    phraseKeywords: '',
    broadKeywords: '', asinTargets: '', categoryTargets: '', audienceTargets: '',
    audienceLookback: '30',
  };
}

export const createDraftSlice: StateCreator<DraftSlice> = (set) => ({
  draft: makeDraft(),
  wizardStep: 1,
  updateDraft: (field, value) => set((s) => ({ draft: { ...s.draft, [field]: value } })),
  setWizardStep: (step) => set({ wizardStep: step }),
  resetDraft: () => set({ draft: makeDraft(), wizardStep: 1 }),
  selectProduct: (asin) => set((s) => ({ draft: selectProduct(s.draft, asin) })),
  removeProduct: (asin) => set((s) => ({ draft: removeProduct(s.draft, asin) })),
});
