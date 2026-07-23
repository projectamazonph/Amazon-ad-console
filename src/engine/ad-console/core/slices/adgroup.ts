/**
 * Ad group slice — CRUD operations.
 */
import type { AdConsoleState, CampaignStatus } from '../types';
import { addAdGroup, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup } from '../engine';

export interface AdGroupSlice {
  addAdGroup: (campaignId: string, name: string) => void;
  renameAdGroup: (campaignId: string, adGroupId: string, name: string) => void;
  setAdGroupStatus: (campaignId: string, adGroupId: string, status: CampaignStatus) => void;
  setAdGroupDefaultBid: (campaignId: string, adGroupId: string, bid: number) => void;
  removeAdGroup: (campaignId: string, adGroupId: string) => void;
}

type SetFn = (fn: (s: { state: AdConsoleState }) => { state?: AdConsoleState }) => void;

export const createAdGroupSlice = (set: SetFn): AdGroupSlice => ({
  addAdGroup: (cid, name) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? addAdGroup(c, name) : c) } })),
  renameAdGroup: (cid, agid, name) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? renameAdGroup(c, agid, name) : c) } })),
  setAdGroupStatus: (cid, agid, status) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? setAdGroupStatus(c, agid, status) : c) } })),
  setAdGroupDefaultBid: (cid, agid, bid) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? setAdGroupDefaultBid(c, agid, bid) : c) } })),
  removeAdGroup: (cid, agid) => set((s) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? removeAdGroup(c, agid) : c) } })),
});
