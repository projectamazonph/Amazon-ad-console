/**
 * Ad group slice — CRUD operations.
 */
import type { CampaignStatus } from '../types';
import { addAdGroup, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup } from '../engine';

export interface AdGroupSlice {
  addAdGroup: (campaignId: string, name: string) => void;
  renameAdGroup: (campaignId: string, adGroupId: string, name: string) => void;
  setAdGroupStatus: (campaignId: string, adGroupId: string, status: CampaignStatus) => void;
  setAdGroupDefaultBid: (campaignId: string, adGroupId: string, bid: number) => void;
  removeAdGroup: (campaignId: string, adGroupId: string) => void;
}

export const createAdGroupSlice = (set: any, ..._rest: any[]): AdGroupSlice => ({
  addAdGroup: (cid, name) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addAdGroup(c, name) : c) } })),
  renameAdGroup: (cid, agid, name) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? renameAdGroup(c, agid, name) : c) } })),
  setAdGroupStatus: (cid, agid, status) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setAdGroupStatus(c, agid, status) : c) } })),
  setAdGroupDefaultBid: (cid, agid, bid) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setAdGroupDefaultBid(c, agid, bid) : c) } })),
  removeAdGroup: (cid, agid) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? removeAdGroup(c, agid) : c) } })),
});
