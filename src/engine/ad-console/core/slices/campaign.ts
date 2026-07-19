/**
 * Campaign slice — campaign CRUD, status, duplication.
 */
import type { Campaign, CampaignStatus } from '../types';
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

export const createCampaignSlice = (set: any, ..._rest: any[]): CampaignSlice => ({
  toggleCampaignStatus: (id) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? toggleCampaignStatus(c) : c) } })),
  archiveCampaign: (id) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? archiveCampaign(c) : c), selectedCampaignId: s.state.selectedCampaignId === id ? null : s.state.selectedCampaignId } })),
  duplicateCampaign: (id) => set((s: any) => { const c = s.state.campaigns.find((x: any) => x.id === id); if (!c) return s; return { state: { ...s.state, campaigns: [...s.state.campaigns, duplicateCampaign(c)] } }; }),
  updateCampaignSettings: (id, updates) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? updateCampaignSettings(c, updates) : c) } })),
  savePlacements: (id, placements) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === id ? savePlacements(c, placements) : c) } })),
});
