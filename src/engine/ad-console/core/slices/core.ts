/**
 * Core slice — central state, filters, view, simulation.
 */
import type { Campaign, CampaignStatus, FilterState, AdConsoleState } from '../types';
import { simulateDays, normalizeCampaign, portfolioNames, generateId, updateCampaignSettings, savePlacements, toggleCampaignStatus, archiveCampaign, duplicateCampaign, parseKeywords } from '../engine';
import { defaultCampaigns } from '../scenarios';
import { makeDraft } from './draft';

export interface CoreSlice {
  state: AdConsoleState;
  view: 'dashboard' | 'campaigns' | 'create' | 'detail' | 'portfolio'
    | 'drills' | 'reports' | 'bulk' | 'trainer' | 'integrity' | 'missions';
  showAddKeywordForm: boolean;
  mobileMenuOpen: boolean;
  selectCampaign: (id: string | null) => void;
  setView: (view: CoreSlice['view']) => void;
  setTab: (tab: string) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  toggleCampaignStatus: (id: string) => void;
  archiveCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  runSimulation: (days?: number) => void;
  launchCampaign: () => void;
  toggleAddKeywordForm: () => void;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  resetAll: () => void;
  updateCampaignSettings: (id: string, updates: Record<string, unknown>) => void;
  savePlacements: (id: string, placements: { top: number; product: number; rest: number }) => void;
  exportState: () => string;
  importState: (json: string) => boolean;
}

const coreState: AdConsoleState = {
  version: '3.6',
  campaigns: defaultCampaigns(),
  filter: { type: 'All', status: 'All', portfolio: 'All', search: '' },
  selectedCampaignId: null,
  selectedTab: 'campaigns',
  simulationDays: 0,
  actionLog: [],
  portfolios: portfolioNames(defaultCampaigns()).filter((n: string) => n !== 'All'),
};

export const createCoreSlice = (set: any, get: any, ..._rest: any[]): CoreSlice => ({
  state: coreState,
  view: 'dashboard',
  showAddKeywordForm: false,
  mobileMenuOpen: false,

  selectCampaign: (id) =>
    set((s: any) => ({ state: { ...s.state, selectedCampaignId: id, selectedTab: 'adgroups' }, view: id ? 'detail' : 'campaigns' })),
  setView: (view) => set({ view }),
  setTab: (tab) => set((s: any) => ({ state: { ...s.state, selectedTab: tab } })),
  setFilter: (filter) => set((s: any) => ({ state: { ...s.state, filter: { ...s.state.filter, ...filter } } })),

  toggleCampaignStatus: (id) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? toggleCampaignStatus(c) : c) } })),
  archiveCampaign: (id) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? archiveCampaign(c) : c), selectedCampaignId: s.state.selectedCampaignId === id ? null : s.state.selectedCampaignId } })),
  duplicateCampaign: (id) => set((s: any) => { const c = s.state.campaigns.find((x: any) => x.id === id); if (!c) return s; return { state: { ...s.state, campaigns: [...s.state.campaigns, duplicateCampaign(c)] } }; }),

  runSimulation: (days = 7) => set((s: any) => ({ state: { ...s.state, campaigns: simulateDays(s.state.campaigns, days), simulationDays: s.state.simulationDays + days } })),

  launchCampaign: () => set((s: any) => {
    const d = s.draft;
    if (!d.name.trim()) return s;
    const id = 'C-' + d.type + '-' + Date.now().toString(36);
    const agId = 'AG-' + id;
    const portfolioName = d.portfolio || 'Training Portfolio';
    const buildTargets = (raw: string, type: 'Keyword' | 'ASIN' | 'Category' | 'Audience - views remarketing', match?: any) =>
      parseKeywords(raw).map((value: string) => ({
        id: generateId('T'), campaignId: id, adGroupId: agId,
        type, value, ...(match ? { match } : {}),
        bid: d.defaultBid, status: 'Enabled' as CampaignStatus,
        impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
      }));
    const targets: any[] = [
      ...buildTargets(d.exactKeywords, 'Keyword', 'Exact'),
      ...buildTargets(d.phraseKeywords, 'Keyword', 'Phrase'),
      ...buildTargets(d.broadKeywords, 'Keyword', 'Broad'),
      ...buildTargets(d.asinTargets, 'ASIN'),
      ...buildTargets(d.categoryTargets, 'Category'),
      ...buildTargets(d.audienceTargets, 'Audience - views remarketing'),
    ];
    const endDate: string | null = d.endDate && d.endDate.trim() ? d.endDate : null;
    const campaign = normalizeCampaign({
      id, type: d.type, name: d.name, portfolio: portfolioName,
      status: d.status, dailyBudget: d.dailyBudget, defaultBid: d.defaultBid,
      startDate: d.startDate, endDate,
      adFormat: d.adFormat,
      bidStrategy: d.bidStrategy, targetingMode: d.targetingMode, campaignGoal: d.campaignGoal,
      placements: d.placements,
      products: d.products, creative: d.type === 'SP' ? null : d.creative,
      metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      adGroups: [{ id: agId, campaignId: id, name: d.type + ' training ad group', status: d.status, defaultBid: d.defaultBid, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
      targets, searchTerms: [], negatives: [], budgetRules: [], history: ['Campaign launched in simulator'],
    });
    return { state: { ...s.state, campaigns: [campaign, ...s.state.campaigns], portfolios: s.state.portfolios.includes(portfolioName) ? s.state.portfolios : [...s.state.portfolios, portfolioName], selectedCampaignId: id, selectedTab: 'adgroups' }, draft: makeDraft(), wizardStep: 1, view: 'detail' };
  }),

  toggleAddKeywordForm: () => set((s: any) => ({ showAddKeywordForm: !s.showAddKeywordForm })),
  toggleMobileMenu: () => set((s: any) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openMobileMenu: () => set((s: any) => ({ mobileMenuOpen: true })),
  closeMobileMenu: () => set((s: any) => ({ mobileMenuOpen: false })),

  resetAll: () => set({
    state: { ...coreState, campaigns: defaultCampaigns(), portfolios: portfolioNames(defaultCampaigns()).filter((n: string) => n !== 'All') },
    draft: makeDraft(), wizardStep: 1, view: 'dashboard', showAddKeywordForm: false,
  }),

  updateCampaignSettings: (id, updates) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? updateCampaignSettings(c, updates) : c) },
  })),
  savePlacements: (id, placements) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? savePlacements(c, placements) : c) },
  })),
  exportState: () => JSON.stringify(get().state),
  importState: (json) => { try { if (!json || !json.trim()) return false; const parsed = JSON.parse(json); if (!parsed || typeof parsed !== 'object') return false; set({ state: parsed }); return true; } catch { return false; } },
});
