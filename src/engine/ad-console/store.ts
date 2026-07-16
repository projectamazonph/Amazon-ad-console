/**
 * Amazon Ad Console — Zustand store.
 *
 * Wraps the pure engine functions in a reactive store for React.
 * Designed so the engine layer can be swapped out / reused in other projects.
 */

import { create } from 'zustand';
import type { Campaign, CampaignDraft, CampaignStatus, MatchType, FilterState, AdConsoleState } from './types';
import {
  calc, totalMetrics, filteredCampaigns, campaignById,
  toggleCampaignStatus, archiveCampaign, duplicateCampaign,
  addTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget,
  addNegative, harvestTerm, simulateDays,
  updateCampaignSettings, savePlacements,
  normalizeCampaign, portfolioNames,
} from './engine';
import { defaultCampaigns } from './scenarios';

// ---------------------------------------------------------------------------
// Draft helpers
// ---------------------------------------------------------------------------

function makeDraft(): CampaignDraft {
  return {
    type: 'SP',
    name: '',
    portfolio: '',
    status: 'Enabled',
    dailyBudget: 25,
    defaultBid: 0.75,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    targetingMode: 'Automatic',
    adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'],
    creative: {},
    keywords: '',
    asinTargets: '',
    categoryTargets: '',
    audienceTargets: '',
  };
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface AdConsoleStore {
  // State
  state: AdConsoleState;
  draft: CampaignDraft;
  wizardStep: number;
  view: 'dashboard' | 'campaigns' | 'create' | 'detail' | 'portfolio';
  showAddKeywordForm: boolean;

  // Derived
  filtered: () => Campaign[];
  selectedCampaign: () => Campaign | undefined;
  portfolioOptions: () => string[];
  totalMetricsCalc: () => ReturnType<typeof totalMetrics>;
  derivedMetrics: (m: { impressions: number; clicks: number; spend: number; sales: number; orders: number }) => ReturnType<typeof calc>;

  // Campaign operations
  selectCampaign: (id: string | null) => void;
  setView: (view: AdConsoleStore['view']) => void;
  setTab: (tab: string) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  toggleCampaignStatus: (id: string) => void;
  archiveCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;

  // Target operations
  addKeyword: (campaignId: string, value: string, match: MatchType | string, bid: number) => void;
  removeTarget: (campaignId: string, targetId: string) => void;
  setTargetBid: (campaignId: string, targetId: string, bid: number) => void;
  adjustTargetBid: (campaignId: string, targetId: string, multiplier: number) => void;
  pauseTarget: (campaignId: string, targetId: string) => void;

  // Search term operations
  addNegative: (campaignId: string, term: string, type?: string) => void;
  harvestTerm: (campaignId: string, term: string) => void;

  // Simulation
  runSimulation: (days?: number) => void;

  // Campaign settings
  updateCampaignSettings: (id: string, updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status'>>) => void;
  savePlacements: (id: string, placements: { top: number; product: number; rest: number }) => void;

  // Creation wizard
  updateDraft: (field: string, value: any) => void;
  setWizardStep: (step: number) => void;
  resetDraft: () => void;
  launchCampaign: () => void;

  // UI
  toggleAddKeywordForm: () => void;
  setAddKeywordCampaignId: (id: string) => void;

  // Reset
  resetAll: () => void;

  // Logging
  logAction: (type: string, message: string, tone?: 'good' | 'bad' | 'warn') => void;

  // Import/Export
  exportState: () => string;
  importState: (json: string) => boolean;
}

// ---------------------------------------------------------------------------
// Create store
// ---------------------------------------------------------------------------

export const useAdConsoleStore = create<AdConsoleStore>((set, get) => {
  const initialCampaigns = defaultCampaigns();

  const state: AdConsoleState = {
    version: '3.5',
    campaigns: initialCampaigns,
    filter: { type: 'All', status: 'All', portfolio: 'All', search: '' },
    selectedCampaignId: null,
    selectedTab: 'campaigns',
    simulationDays: 0,
    actionLog: [],
  };

  return {
    state,
    draft: makeDraft(),
    wizardStep: 1,
    view: 'dashboard',
    showAddKeywordForm: false,

    // Derived
    filtered: () => filteredCampaigns(get().state),
    selectedCampaign: () => (get().state.selectedCampaignId
      ? campaignById(get().state, get().state.selectedCampaignId)
      : undefined),
    portfolioOptions: () => portfolioNames(get().state.campaigns),
    totalMetricsCalc: () => totalMetrics(get().state.campaigns.filter((c) => c.status === 'Enabled')),
    derivedMetrics: (m) => calc(m),

    // Campaign operations
    selectCampaign: (id) =>
      set((s) => ({
        state: { ...s.state, selectedCampaignId: id, selectedTab: 'overview' },
        view: id ? 'detail' : 'campaigns' as const,
      })),

    setView: (view) => set({ view }),

    setTab: (tab) => set((s) => ({ state: { ...s.state, selectedTab: tab } })),

    setFilter: (filter) =>
      set((s) => ({
        state: {
          ...s.state,
          filter: { ...s.state.filter, ...filter },
        },
      })),

    toggleCampaignStatus: (id) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === id ? toggleCampaignStatus(c) : c,
          ),
        },
      })),

    archiveCampaign: (id) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === id ? archiveCampaign(c) : c,
          ),
          selectedCampaignId:
            s.state.selectedCampaignId === id ? null : s.state.selectedCampaignId,
        },
      })),

    duplicateCampaign: (id) =>
      set((s) => {
        const c = s.state.campaigns.find((x) => x.id === id);
        if (!c) return s;
        const dup = duplicateCampaign(c);
        return {
          state: {
            ...s.state,
            campaigns: [...s.state.campaigns, dup],
          },
        };
      }),

    // Target operations
    addKeyword: (cid, value, match, bid) =>
      set((s) => {
        const c = s.state.campaigns.find((x) => x.id === cid);
        if (!c) return s;
        const { campaign } = addTarget(c, value, match, bid);
        return {
          state: {
            ...s.state,
            campaigns: s.state.campaigns.map((x) => (x.id === cid ? campaign : x)),
          },
          showAddKeywordForm: false,
        };
      }),

    removeTarget: (cid, tid) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? removeTarget(c, tid) : c,
          ),
        },
      })),

    setTargetBid: (cid, tid, bid) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? setTargetBid(c, tid, bid) : c,
          ),
        },
      })),

    adjustTargetBid: (cid, tid, mult) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? adjustTargetBid(c, tid, mult) : c,
          ),
        },
      })),

    pauseTarget: (cid, tid) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? pauseTarget(c, tid) : c,
          ),
        },
      })),

    // Search terms
    addNegative: (cid, term, type) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? addNegative(c, term, type) : c,
          ),
        },
      })),

    harvestTerm: (cid, term) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === cid ? harvestTerm(c, term) : c,
          ),
        },
      })),

    // Simulation
    runSimulation: (days = 7) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: simulateDays(s.state.campaigns, days),
          simulationDays: s.state.simulationDays + days,
        },
      })),

    // Campaign settings
    updateCampaignSettings: (id, updates) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === id ? updateCampaignSettings(c, updates) : c,
          ),
        },
      })),

    savePlacements: (id, placements) =>
      set((s) => ({
        state: {
          ...s.state,
          campaigns: s.state.campaigns.map((c) =>
            c.id === id ? savePlacements(c, placements) : c,
          ),
        },
      })),

    // Wizard
    updateDraft: (field, value) =>
      set((s) => ({ draft: { ...s.draft, [field]: value } })),

    setWizardStep: (step) => set({ wizardStep: step }),

    resetDraft: () => set({ draft: makeDraft(), wizardStep: 1 }),

    launchCampaign: () =>
      set((s) => {
        const d = s.draft;
        if (!d.name.trim()) return s;
        const id = 'C-' + d.type + '-' + Date.now().toString(36);
        const agId = 'AG-' + id;
        const campaign = normalizeCampaign({
          id,
          type: d.type,
          name: d.name,
          portfolio: d.portfolio || 'Training Portfolio',
          status: d.status,
          dailyBudget: d.dailyBudget,
          defaultBid: d.defaultBid,
          startDate: d.startDate,
          endDate: d.endDate || null,
          targetingMode: d.targetingMode,
          adFormat: d.adFormat,
          bidStrategy: d.bidStrategy,
          placements: d.placements,
          products: d.products,
          creative: d.type !== 'SP' ? d.creative : null,
          adGroups: [{ id: agId, name: d.type + ' training ad group', status: d.status, defaultBid: d.defaultBid, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
          targets: [],
          searchTerms: d.type === 'SD' ? [] : [],
          negatives: [],
          budgetRules: [],
          history: ['Campaign launched in simulator'],
        });
        return {
          state: {
            ...s.state,
            campaigns: [campaign, ...s.state.campaigns],
            selectedCampaignId: id,
            selectedTab: 'overview',
          },
          draft: makeDraft(),
          wizardStep: 1,
          view: 'detail' as const,
        };
      }),

    // UI
    toggleAddKeywordForm: () =>
      set((s) => ({ showAddKeywordForm: !s.showAddKeywordForm })),

    setAddKeywordCampaignId: (id) => set({}), // side-effect handled in component

    // Reset
    resetAll: () =>
      set({
        state: {
          ...state,
          campaigns: defaultCampaigns(),
          simulationDays: 0,
          actionLog: [],
        },
        draft: makeDraft(),
        wizardStep: 1,
        view: 'dashboard',
        showAddKeywordForm: false,
      }),

    // Logging
    logAction: (type, message, tone = 'good') =>
      set((s) => ({
        state: {
          ...s.state,
          actionLog: [
            {
              timestamp: new Date().toISOString(),
              type,
              message,
              tone,
            },
            ...s.state.actionLog,
          ],
        },
      })),

    // Export / Import
    exportState: () => JSON.stringify(get().state),

    importState: (json) => {
      try {
        const parsed = JSON.parse(json) as AdConsoleState;
        set({ state: parsed });
        return true;
      } catch {
        return false;
      }
    },
  };
});
