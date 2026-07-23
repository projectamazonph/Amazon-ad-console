/**
 * Portfolio slice — portfolio operations and campaign querying.
 */
import type { Campaign, AdConsoleState } from '../types';
import {
  createPortfolio, renamePortfolio, deletePortfolio, assignCampaignToPortfolio,
  filteredCampaigns, portfolioNames,
} from '../engine';

export interface PortfolioSlice {
  createPortfolio: (name: string) => void;
  renamePortfolio: (oldName: string, newName: string) => void;
  deletePortfolio: (name: string) => void;
  assignCampaignToPortfolio: (campaignId: string, portfolioName: string) => void;
}

export interface QuerySlice {
  campaignById: (id: string) => Campaign | undefined;
  filteredCampaigns: () => Campaign[];
  portfolioOptions: () => string[];
}

type SetFn = (fn: (s: { state: AdConsoleState }) => { state?: AdConsoleState }) => void;

export const createPortfolioSlice = (set: SetFn): PortfolioSlice => ({
  createPortfolio: (Name) => set((s) => ({ state: { ...s.state, portfolios: createPortfolio(s.state.portfolios, Name) } })),
  renamePortfolio: (oldName, newName) => set((s) => {
    const { portfolios, campaigns } = renamePortfolio(s.state.portfolios, s.state.campaigns, oldName, newName);
    return { state: { ...s.state, portfolios, campaigns } };
  }),
  deletePortfolio: (name) => set((s) => {
    const { portfolios, campaigns } = deletePortfolio(s.state.portfolios, s.state.campaigns, name);
    return { state: { ...s.state, portfolios, campaigns } };
  }),
  assignCampaignToPortfolio: (cid, pname) => set((s) => ({ state: { ...s.state, campaigns: assignCampaignToPortfolio(s.state.campaigns, cid, pname) } })),
});

export const createQuerySlice = (_set: SetFn, _get: () => { state: AdConsoleState }): QuerySlice => ({
  campaignById: (id) => _get().state.campaigns.find((c) => c.id === id),
  filteredCampaigns: () => filteredCampaigns(_get().state),
  portfolioOptions: () => portfolioNames(_get().state.campaigns),
});
