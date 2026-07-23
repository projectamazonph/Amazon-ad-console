/**
 * Campaign slice — campaign CRUD, status, duplication.
 */
import type { Campaign, AdConsoleState } from '../types';
import {
  toggleCampaignStatus, archiveCampaign, duplicateCampaign,
  updateCampaignSettings, savePlacements,
} from '../engine';

export interface CampaignSlice {
  toggleCampaignStatus: (id: string) => void;
  archiveCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  updateCampaignSettings: (id: string, updates: Partial<Pick<Campaign, 'dailyBudget' | 'defaultBid' | 'bidStrategy' | 'status' | 'creativeStatus' | 'creativeIssue'>>) => void;
  savePlacements: (id: string, placements: { top: number; product: number; rest: number }) => void;
}

type SetFn = (fn: (s: { state: AdConsoleState }) => { state?: AdConsoleState }) => void;

export const createCampaignSlice = (set: SetFn): CampaignSlice => ({
  toggleCampaignStatus: (id) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? toggleCampaignStatus(c) : c) } })),
  archiveCampaign: (id) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? archiveCampaign(c) : c), selectedCampaignId: s.state.selectedCampaignId === id ? null : s.state.selectedCampaignId } })),
  duplicateCampaign: (id) => set((s) => { const c = s.state.campaigns.find((x) => x.id === id); if (!c) return {}; return { state: { ...s.state, campaigns: [...s.state.campaigns, duplicateCampaign(c)] } }; }),
  updateCampaignSettings: (id, updates) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? updateCampaignSettings(c, updates) : c) } })),
  savePlacements: (id, placements) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === id ? savePlacements(c, placements) : c) } })),
});
