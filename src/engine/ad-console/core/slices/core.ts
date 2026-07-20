/**
 * Core slice — central state, filters, view, simulation.
 */
import type { Campaign, CampaignDraft, CampaignStatus, FilterState, AdConsoleState } from '../types';
import { simulateDays, normalizeCampaign, portfolioNames, generateId, updateCampaignSettings, savePlacements } from '../engine';
import { defaultCampaigns } from '../scenarios';
import { mobileMenuReducer, type MobileMenuState } from '../engine';

export interface CoreSlice {
  state: AdConsoleState;
  view: 'dashboard' | 'campaigns' | 'create' | 'detail' | 'portfolio'
    | 'drills' | 'reports' | 'bulk' | 'trainer' | 'integrity' | 'missions';
  showAddKeywordForm: boolean;
  mobileMenu: MobileMenuState;
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
  mobileMenuAnimationEnd: () => void;
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
  mobileMenu: mobileMenuReducer(undefined, { type: 'INIT' }),

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
    const buildKeywords = (text: string, match: string) =>
      text.split('\n').filter((k: string) => k.trim()).map((k: string) => ({
        id: generateId('T'), campaignId: id, adGroupId: agId,
        type: 'Keyword' as const, value: k.trim(), match: match as any,
        bid: d.defaultBid, status: 'Enabled' as CampaignStatus,
        impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
      }));
    // One keyword box expands into a target per selected match type — but only
    // for keyword targeting modes (SP "Manual keyword" / SB "Keyword"), so
    // stale keyword text can't leak into an Automatic/Product/Category campaign.
    const usesKeywords = d.targetingMode === 'Manual keyword' || d.targetingMode === 'Keyword';
    const matchTypes: string[] = d.keywordMatchTypes.length ? d.keywordMatchTypes : ['Exact'];
    const keywordTargets: any[] = usesKeywords
      ? matchTypes.flatMap((mt: string) => buildKeywords(d.keywords, mt))
      : [];

    // Automatic SP campaigns get an auto-targeting group per enabled bucket,
    // each carrying its own bid.
    const autoGroupDefs = [
      ['closeMatch', 'Auto - close match', 'close match'],
      ['looseMatch', 'Auto - loose match', 'loose match'],
      ['substitutes', 'Auto - substitutes', 'substitutes'],
      ['complements', 'Auto - complements', 'complements'],
    ] as const;
    const autoTargets: any[] = d.type === 'SP' && d.targetingMode === 'Automatic'
      ? autoGroupDefs
          .filter(([key]) => d.autoTargets[key].enabled)
          .map(([key, type, value]) => ({
            id: generateId('T'), campaignId: id, adGroupId: agId,
            type, value, match: '',
            bid: d.autoTargets[key].bid, status: 'Enabled' as CampaignStatus,
            impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
          }))
      : [];

    const targets: any[] = [...keywordTargets, ...autoTargets];
    const campaign = normalizeCampaign({
      id, type: d.type, name: d.name, portfolio: portfolioName,
      status: d.status, dailyBudget: d.dailyBudget, defaultBid: d.defaultBid,
      bidStrategy: d.bidStrategy, targetingMode: d.targetingMode, campaignGoal: d.campaignGoal,
      products: d.products, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      adGroups: [{ id: agId, campaignId: id, name: d.type + ' training ad group', status: d.status, defaultBid: d.defaultBid, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
      targets, searchTerms: [], negatives: [], budgetRules: [], history: ['Campaign launched in simulator'],
    });
    return { state: { ...s.state, campaigns: [campaign, ...s.state.campaigns], portfolios: s.state.portfolios.includes(portfolioName) ? s.state.portfolios : [...s.state.portfolios, portfolioName], selectedCampaignId: id, selectedTab: 'adgroups' }, draft: makeDraft(), wizardStep: 1, view: 'detail' };
  }),

  toggleAddKeywordForm: () => set((s: any) => ({ showAddKeywordForm: !s.showAddKeywordForm })),
  toggleMobileMenu: () => set((s: any) => ({ mobileMenu: mobileMenuReducer(s.mobileMenu, { type: 'TOGGLE' }) })),
  openMobileMenu: () => set((s: any) => ({ mobileMenu: mobileMenuReducer(s.mobileMenu, { type: 'OPEN' }) })),
  closeMobileMenu: () => set((s: any) => ({ mobileMenu: mobileMenuReducer(s.mobileMenu, { type: 'CLOSE' }) })),
  mobileMenuAnimationEnd: () => set((s: any) => ({ mobileMenu: mobileMenuReducer(s.mobileMenu, { type: 'ANIMATION_END' }) })),

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

export function makeDraft(): CampaignDraft {
  return {
    type: 'SP', name: '', portfolio: '', status: 'Enabled',
    dailyBudget: 25, defaultBid: 0.75,
    startDate: new Date().toISOString().slice(0, 10), endDate: '',
    targetingMode: 'Automatic', adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'], creative: {},
    keywords: '',
    keywordMatchTypes: ['Exact'], asinTargets: '', categoryTargets: '', audienceTargets: '',
    audienceLookback: '30',
    autoTargets: {
      closeMatch: { enabled: true, bid: 0.75 },
      looseMatch: { enabled: true, bid: 0.75 },
      substitutes: { enabled: true, bid: 0.75 },
      complements: { enabled: true, bid: 0.75 },
    },
  };
}

function toggleCampaignStatus(c: Campaign): Campaign {
  if (c.status === 'Archived') return c;
  const next: CampaignStatus = c.status === 'Enabled' ? 'Paused' : 'Enabled';
  return {
    ...c,
    status: next,
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: next })),
    targets: c.targets.map((t) => ({ ...t, status: next })),
    history: [...c.history, `Status changed to ${next}`],
  };
}

function archiveCampaign(c: Campaign): Campaign {
  return {
    ...c,
    status: 'Archived',
    adGroups: c.adGroups.map((ag) => ({ ...ag, status: 'Archived' })),
    targets: c.targets.map((t) => ({ ...t, status: 'Archived' })),
    history: [...c.history, 'Campaign archived'],
  };
}

function duplicateCampaign(c: Campaign): Campaign {
  const newId = generateId('C-' + c.type);
  const newAgId = generateId('AG');
  return normalizeCampaign({
    ...c,
    id: newId,
    name: c.name + ' (copy)',
    status: 'Paused' as CampaignStatus,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    history: [],
    adGroups: c.adGroups.map((ag) => ({
      ...ag,
      id: ag.id === c.adGroups[0]?.id ? newAgId : generateId('AG'),
      campaignId: newId,
    })),
    targets: c.targets.map((t) => ({
      ...t,
      id: generateId('T'),
      campaignId: newId,
      adGroupId: newAgId,
      impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
    })),
    searchTerms: [],
    negatives: c.negatives.map((n) => ({
      ...n,
      id: generateId('NEG'),
      campaignId: newId,
      adGroupId: newAgId,
    })),
    budgetRules: c.budgetRules.map((r) => ({
      ...r,
      id: generateId('BR'),
      campaignId: newId,
    })),
  });
}
