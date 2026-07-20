/**
 * Portfolio slice — portfolio operations and campaign querying.
 */
import type { Campaign } from '../types';
import {
  createPortfolio, renamePortfolio, deletePortfolio, assignCampaignToPortfolio,
  campaignById, filteredCampaigns, portfolioNames,
} from '../engine';

export interface PortfolioSlice {
  createPortfolio: (name: string) => void;
  renamePortfolio: (oldName: string, newName: string) => void;
  deletePortfolio: (name: string) => void;
  assignCampaignToPortfolio: (campaignId: string, portfolioName: string) => void;
}

export const createPortfolioSlice = (set: any, ..._rest: any[]): PortfolioSlice => ({
  createPortfolio: (name) => set((s: any) => ({ state: { ...s.state, portfolios: createPortfolio(s.state.portfolios, name) } })),
  renamePortfolio: (oldName, newName) => set((s: any) => {
    const { portfolios, campaigns } = renamePortfolio(s.state.portfolios, s.state.campaigns, oldName, newName);
    return { state: { ...s.state, portfolios, campaigns } };
  }),
  deletePortfolio: (name) => set((s: any) => {
    const { portfolios, campaigns } = deletePortfolio(s.state.portfolios, s.state.campaigns, name);
    return { state: { ...s.state, portfolios, campaigns } };
  }),
  assignCampaignToPortfolio: (cid, pname) => set((s: any) => ({ state: { ...s.state, campaigns: assignCampaignToPortfolio(s.state.campaigns, cid, pname) } })),
});

export interface QuerySlice {
  campaignById: (id: string) => Campaign | undefined;
  filteredCampaigns: () => Campaign[];
  portfolioOptions: () => string[];
}

export const createQuerySlice = (_set: any, get: any, ..._rest: any[]): QuerySlice => ({
  campaignById: (id) => get().state.campaigns.find((c: any) => c.id === id),
  filteredCampaigns: () => filteredCampaigns(get().state),
  portfolioOptions: () => portfolioNames(get().state.campaigns),
});
