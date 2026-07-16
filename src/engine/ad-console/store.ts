/**
 * Amazon Ad Console — Composed Root Store.
 *
 * Combines core simulator state with all feature slices (drills, profiles,
 * trainer, bulk, reports, missions, integrity) into a single Zustand store.
 *
 * Each slice is independent with focused types and actions (SOLID).
 */
import { create } from 'zustand';
import type { Campaign, CampaignDraft, CampaignStatus, MatchType, FilterState, AdConsoleState, Creative } from './core/types';
import {
  calc, totalMetrics, filteredCampaigns, campaignById,
  toggleCampaignStatus, archiveCampaign, duplicateCampaign,
  addTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget,
  addNegative, harvestTerm, simulateDays,
  updateCampaignSettings, savePlacements,
  normalizeCampaign, portfolioNames,
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

// ---------------------------------------------------------------------------
// Core store state
// ---------------------------------------------------------------------------
export interface CoreSlice {
  state: AdConsoleState;
  draft: CampaignDraft;
  wizardStep: number;
  view: 'dashboard' | 'campaigns' | 'create' | 'detail' | 'portfolio'
    | 'drills' | 'reports' | 'bulk' | 'trainer' | 'integrity' | 'missions';
  showAddKeywordForm: boolean;
}

// ---------------------------------------------------------------------------
// Draft helper
// ---------------------------------------------------------------------------
function makeDraft(): CampaignDraft {
  return {
    type: 'SP', name: '', portfolio: '', status: 'Enabled',
    dailyBudget: 25, defaultBid: 0.75,
    startDate: new Date().toISOString().slice(0, 10), endDate: '',
    targetingMode: 'Automatic', adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'], creative: {},
    keywords: '', asinTargets: '', categoryTargets: '', audienceTargets: '',
  };
}

// ---------------------------------------------------------------------------
// Combined store type
// ---------------------------------------------------------------------------
export type AppStore = CoreSlice & DrillsSlice & ProfilesSlice & TrainerSlice & BulkSlice & ReportsSlice & MissionsSlice & IntegritySlice & {
  // Core actions
  selectCampaign: (id: string | null) => void;
  setView: (view: AppStore['view']) => void;
  setTab: (tab: string) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  toggleCampaignStatus: (id: string) => void;
  archiveCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  addKeyword: (campaignId: string, value: string, match: MatchType | string, bid: number) => void;
  removeTarget: (campaignId: string, targetId: string) => void;
  setTargetBid: (campaignId: string, targetId: string, bid: number) => void;
  adjustTargetBid: (campaignId: string, targetId: string, multiplier: number) => void;
  pauseTarget: (campaignId: string, targetId: string) => void;
  addNegative: (campaignId: string, term: string, type?: string) => void;
  harvestTerm: (campaignId: string, term: string) => void;
  runSimulation: (days?: number) => void;
  updateCampaignSettings: (id: string, updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status'>>) => void;
  savePlacements: (id: string, placements: { top: number; product: number; rest: number }) => void;
  updateDraft: (field: string, value: any) => void;
  setWizardStep: (step: number) => void;
  resetDraft: () => void;
  launchCampaign: () => void;
  toggleAddKeywordForm: () => void;
  resetAll: () => void;
  // Derived
  filtered: () => Campaign[];
  selectedCampaign: () => Campaign | undefined;
  portfolioOptions: () => string[];
  totalMetricsCalc: () => ReturnType<typeof totalMetrics>;
  derivedMetrics: (m: { impressions: number; clicks: number; spend: number; sales: number; orders: number }) => ReturnType<typeof calc>;
  // Export/Import
  exportState: () => string;
  importState: (json: string) => boolean;
};

// ---------------------------------------------------------------------------
// Create the composed store
// ---------------------------------------------------------------------------
const initialCampaigns = defaultCampaigns();
const coreState: AdConsoleState = {
  version: '3.6',
  campaigns: initialCampaigns,
  filter: { type: 'All', status: 'All', portfolio: 'All', search: '' },
  selectedCampaignId: null,
  selectedTab: 'campaigns',
  simulationDays: 0,
  actionLog: [],
};

export const useAdConsoleStore = create<AppStore>()((...a) => {
  const [set, get] = a;
  return {
    // Core state
    state: coreState,
    draft: makeDraft(),
    wizardStep: 1,
    view: 'dashboard',
    showAddKeywordForm: false,

    // Feature slices
    ...createDrillsSlice(...a),
    ...createProfilesSlice(...a),
    ...createTrainerSlice(...a),
    ...createBulkSlice(...a),
    ...createReportsSlice(...a),
    ...createMissionsSlice(...a),
    ...createIntegritySlice(...a),

    // Core actions
    filtered: () => filteredCampaigns(get().state),
    selectedCampaign: () => get().state.selectedCampaignId ? campaignById(get().state, get().state.selectedCampaignId as string) : undefined,
    portfolioOptions: () => portfolioNames(get().state.campaigns),
    totalMetricsCalc: () => totalMetrics(get().state.campaigns.filter((c) => c.status === 'Enabled')),
    derivedMetrics: (m) => calc(m),

    selectCampaign: (id) =>
      set((s) => ({ state: { ...s.state, selectedCampaignId: id, selectedTab: 'overview' }, view: id ? 'detail' : ('campaigns' as any) })),
    setView: (view) => set({ view }),
    setTab: (tab) => set((s) => ({ state: { ...s.state, selectedTab: tab } })),
    setFilter: (filter) => set((s) => ({ state: { ...s.state, filter: { ...s.state.filter, ...filter } } })),

    toggleCampaignStatus: (id) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? toggleCampaignStatus(c) : c) } })),
    archiveCampaign: (id) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? archiveCampaign(c) : c), selectedCampaignId: s.state.selectedCampaignId === id ? null : s.state.selectedCampaignId } })),
    duplicateCampaign: (id) => set((s) => { const c = s.state.campaigns.find((x) => x.id === id); if (!c) return s; return { state: { ...s.state, campaigns: [...s.state.campaigns, duplicateCampaign(c)] } }; }),

    addKeyword: (cid, value, match, bid) => set((s) => { const c = s.state.campaigns.find((x) => x.id === cid); if (!c) return s; const { campaign } = addTarget(c, value, match, bid); return { state: { ...s.state, campaigns: s.state.campaigns.map((x) => x.id === cid ? campaign : x) }, showAddKeywordForm: false }; }),
    removeTarget: (cid, tid) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? removeTarget(c, tid) : c) } })),
    setTargetBid: (cid, tid, bid) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? (setTargetBid as any)(c, tid, bid) : c) } })),
    adjustTargetBid: (cid, tid, mult) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? adjustTargetBid(c, tid, mult) : c) } })),
    pauseTarget: (cid, tid) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? pauseTarget(c, tid) : c) } })),
    addNegative: (cid, term, type) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addNegative(c, term, type) : c) } })),
    harvestTerm: (cid, term) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? harvestTerm(c, term) : c) } })),
    runSimulation: (days = 7) => set((s) => ({ state: { ...s.state, campaigns: simulateDays(s.state.campaigns, days), simulationDays: s.state.simulationDays + days } })),
    updateCampaignSettings: (id, updates) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? updateCampaignSettings(c, updates) : c) } })),
    savePlacements: (id, placements) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? savePlacements(c, placements) : c) } })),

    updateDraft: (field, value) => set((s) => ({ draft: { ...s.draft, [field]: value } })),
    setWizardStep: (step) => set({ wizardStep: step }),
    resetDraft: () => set({ draft: makeDraft(), wizardStep: 1 }),

    launchCampaign: () => set((s) => {
      const d = s.draft;
      if (!d.name.trim()) return s;
      const id = 'C-' + d.type + '-' + Date.now().toString(36);
      const agId = 'AG-' + id;
      const campaign = normalizeCampaign({
        id, type: d.type, name: d.name, portfolio: d.portfolio || 'Training Portfolio',
        status: d.status, dailyBudget: d.dailyBudget, defaultBid: d.defaultBid,
        startDate: d.startDate, endDate: d.endDate || null,
        targetingMode: d.targetingMode, adFormat: d.adFormat, bidStrategy: d.bidStrategy,
        placements: d.placements, products: d.products, creative: d.type !== 'SP' ? d.creative as Creative : null,
        adGroups: [{ id: agId, campaignId: id, name: d.type + ' training ad group', status: d.status, defaultBid: d.defaultBid, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
        targets: [], searchTerms: d.type === 'SD' ? [] : [], negatives: [], budgetRules: [], history: ['Campaign launched in simulator'],
      });
      return { state: { ...s.state, campaigns: [campaign, ...s.state.campaigns], selectedCampaignId: id, selectedTab: 'overview' }, draft: makeDraft(), wizardStep: 1, view: 'detail' as any };
    }),

    toggleAddKeywordForm: () => set((s) => ({ showAddKeywordForm: !s.showAddKeywordForm })),

    resetAll: () => set({
      state: { ...coreState, campaigns: defaultCampaigns() },
      draft: makeDraft(), wizardStep: 1, view: 'dashboard', showAddKeywordForm: false,
    }),

    exportState: () => JSON.stringify(get().state),
    importState: (json) => { try { set({ state: JSON.parse(json) }); return true; } catch { return false; } },
  };
});
