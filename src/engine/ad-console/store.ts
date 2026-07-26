/**
 * Amazon Ad Console — Composed Root Store.
 *
 * Combines core simulator state with all feature slices (drills, profiles,
 * trainer, bulk, reports, missions, integrity) into a single Zustand store.
 *
 * Each slice is independent with focused types and actions (SOLID).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Campaign, CampaignDraft, CampaignStatus, MatchType, FilterState, AdConsoleState, Creative, Target,
} from './core/types';
import {
  calc, totalMetrics, filteredCampaigns, campaignById, generateId,
  toggleCampaignStatus, archiveCampaign, duplicateCampaign,
  addTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget,
  addAdGroup, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup,
  addNegative, harvestTerm, simulateDays,
  updateCampaignSettings, savePlacements,
  createPortfolio, renamePortfolio, deletePortfolio, assignCampaignToPortfolio,
  addBudgetRule, removeBudgetRule, updateBudgetRule,
  normalizeCampaign, portfolioNames, selectProduct, removeProduct, parseKeywords,
} from './core/engine';
import { defaultCampaigns } from './core/scenarios';
import type { DrillsSlice } from './features/drills/store';
import { createDrillsSlice } from './features/drills/store';
import type { ProfilesSlice } from './features/profiles/store';
import { createProfilesSlice } from './features/profiles/store';
import type { TrainerSlice } from './features/trainer/store';
import { createTrainerSlice } from './features/trainer/store';
import type { BulkSlice } from './features/bulk/store';
import { createBulkSlice } from './features/bulk/store';
import type { ReportsSlice } from './features/reports/store';
import { createReportsSlice } from './features/reports/store';
import type { MissionsSlice } from './features/missions/store';
import { createMissionsSlice } from './features/missions/store';
import type { IntegritySlice } from './features/integrity/store';
import { createIntegritySlice } from './features/integrity/store';
import {
  createCoreSlice, type CoreSlice,
} from './core/slices/core';
import {
  createTargetSlice, type TargetSlice,
} from './core/slices/target';
import {
  createAdGroupSlice, type AdGroupSlice,
} from './core/slices/adgroup';
import {
  createNegativeSlice, type NegativeSlice,
} from './core/slices/negative';
import {
  createBudgetSlice, type BudgetSlice,
} from './core/slices/budget';
import {
  createPortfolioSlice, type PortfolioSlice,
  createQuerySlice, type QuerySlice,
} from './core/slices/portfolio';
import {
  createDraftSlice, type DraftSlice,
} from './core/slices/draft';
import { makeDraft } from './core/slices/draft';

// ---------------------------------------------------------------------------
// Combined store type
// ---------------------------------------------------------------------------
export type AppStore = CoreSlice & TargetSlice & AdGroupSlice & NegativeSlice & BudgetSlice & PortfolioSlice & QuerySlice & DraftSlice & DrillsSlice & ProfilesSlice & TrainerSlice & BulkSlice & ReportsSlice & MissionsSlice & IntegritySlice & {
  // Metric helpers
  filtered: () => Campaign[];
  selectedCampaign: () => Campaign | undefined;
  portfolioOptions: () => string[];
  totalMetricsCalc: () => { impressions: number; clicks: number; spend: number; sales: number; orders: number };
  derivedMetrics: (m: { impressions: number; clicks: number; spend: number; sales: number; orders: number }) => { ctr: number; cpc: number; acos: number; roas: number; cvr: number };
  
  // Campaign products
  addCampaignProduct: (campaignId: string, asin: string) => void;
  removeCampaignProduct: (campaignId: string, asin: string) => void;
};

// ---------------------------------------------------------------------------
const PERSIST_KEY = 'ad-console-storage';

export const useAdConsoleStore = create<AppStore>()(
  persist(
    (...a) => {
      const [set, get] = a;
      return {
        // Core slice
        ...createCoreSlice(...a),
        // Domain slices
        ...createTargetSlice(...a),
        ...createAdGroupSlice(...a),
        ...createNegativeSlice(...a),
        ...createBudgetSlice(...a),
        ...createPortfolioSlice(...a),
        ...createQuerySlice(...a),
        ...createDraftSlice(...a),
        // Feature slices
        ...createDrillsSlice(...a),
        ...createProfilesSlice(...a),
        ...createTrainerSlice(...a),
        ...createBulkSlice(...a),
        ...createReportsSlice(...a),
        ...createMissionsSlice(...a),
        ...createIntegritySlice(...a),

        // Metric helpers
        filtered: () => filteredCampaigns(get().state),
        selectedCampaign: () => get().state.selectedCampaignId ? campaignById(get().state, get().state.selectedCampaignId as string) : undefined,
        portfolioOptions: () => portfolioNames(get().state.campaigns),
        totalMetricsCalc: () => totalMetrics(get().state.campaigns.filter((c) => c.status === 'Enabled')),
        derivedMetrics: (m) => calc(m),

        // Campaign products
        addCampaignProduct: (campaignId, asin) => set((s) => ({
          state: { ...s.state, campaigns: s.state.campaigns.map((c) =>
            c.id === campaignId && !c.products.includes(asin)
              ? { ...c, products: [...c.products, asin] }
              : c
          )},
        })),

        removeCampaignProduct: (campaignId, asin) => set((s) => ({
          state: { ...s.state, campaigns: s.state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, products: c.products.filter((p) => p !== asin) }
              : c
          )},
        })),
      };
    },
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        state: state.state,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AppStore>),
      }),
    },
  ),
);

export { makeDraft };
