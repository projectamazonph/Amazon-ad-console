/**
 * Target/keyword slice — add, remove, bid, pause.
 */
import type { MatchType } from '../types';
import { addTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget } from '../engine';

export interface TargetSlice {
  addKeyword: (campaignId: string, value: string, match: MatchType | string, bid: number, adGroupId?: string) => void;
  removeTarget: (campaignId: string, targetId: string) => void;
  setTargetBid: (campaignId: string, targetId: string, bid: number) => void;
  adjustTargetBid: (campaignId: string, targetId: string, multiplier: number) => void;
  pauseTarget: (campaignId: string, targetId: string) => void;
}

export const createTargetSlice = (set: any, ..._rest: any[]): TargetSlice => ({
  addKeyword: (cid, value, match, bid, adGroupId) => set((s: any) => { const c = s.state.campaigns.find((x: any) => x.id === cid); if (!c) return s; const { campaign } = addTarget(c, value, match, bid, adGroupId); return { state: { ...s.state, campaigns: s.state.campaigns.map((x: any) => x.id === cid ? campaign : x) }, showAddKeywordForm: false }; }),
  removeTarget: (cid, tid) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? removeTarget(c, tid) : c) } })),
  setTargetBid: (cid, tid, bid) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setTargetBid(c, tid, bid) : c) } })),
  adjustTargetBid: (cid, tid, mult) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? adjustTargetBid(c, tid, mult) : c) } })),
  pauseTarget: (cid, tid) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? pauseTarget(c, tid) : c) } })),
});
