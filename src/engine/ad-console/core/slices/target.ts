/**
 * Target/keyword slice — add, remove, bid, pause.
 * Supports all target types: Keyword, ASIN, Category, Auto, Audience.
 */
import type { StateCreator } from 'zustand/vanilla';
import type { MatchType, CampaignStatus, AdConsoleState } from '../types';
import {
  addKeyword, addAutoTarget, addAsinTarget, addCategoryTarget,
  removeTarget, setTargetBid, adjustTargetBid, pauseTarget, setTargetStatus,
} from '../engine';

export interface TargetSlice {
  addKeyword: (campaignId: string, keyword: string, match: MatchType, bid: number, adGroupId?: string) => void;
  addAutoTarget: (campaignId: string, autoType: 'close match' | 'loose match' | 'substitutes' | 'complements', bid: number, adGroupId?: string) => void;
  addAsinTarget: (campaignId: string, asin: string, bid: number, adGroupId?: string) => void;
  addCategoryTarget: (campaignId: string, categoryPath: string, bid: number, adGroupId?: string) => void;
  removeTarget: (campaignId: string, targetId: string) => void;
  setTargetBid: (campaignId: string, targetId: string, bid: number) => void;
  adjustTargetBid: (campaignId: string, targetId: string, multiplier: number) => void;
  pauseTarget: (campaignId: string, targetId: string) => void;
  setTargetStatus: (campaignId: string, targetId: string, status: CampaignStatus) => void;
}

type SetFn = (fn: (s: { state: AdConsoleState }) => { state?: AdConsoleState }) => void;

export const createTargetSlice = (set: SetFn): TargetSlice => ({
  addKeyword: (cid, keyword, match, bid, adGroupId) => set((s) => {
    const c = s.state.campaigns.find((x) => x.id === cid);
    if (!c) return {};
    const { campaign } = addKeyword(c, keyword, match, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x) => x.id === cid ? campaign : x) } };
  }),
  addAutoTarget: (cid, autoType, bid, adGroupId) => set((s) => {
    const c = s.state.campaigns.find((x) => x.id === cid);
    if (!c) return {};
    const { campaign } = addAutoTarget(c, autoType, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x) => x.id === cid ? campaign : x) } };
  }),
  addAsinTarget: (cid, asin, bid, adGroupId) => set((s) => {
    const c = s.state.campaigns.find((x) => x.id === cid);
    if (!c) return {};
    const { campaign } = addAsinTarget(c, asin, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x) => x.id === cid ? campaign : x) } };
  }),
  addCategoryTarget: (cid, categoryPath, bid, adGroupId) => set((s) => {
    const c = s.state.campaigns.find((x) => x.id === cid);
    if (!c) return {};
    const { campaign } = addCategoryTarget(c, categoryPath, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x) => x.id === cid ? campaign : x) } };
  }),
  removeTarget: (cid, tid) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? removeTarget(c, tid) : c) },
  })),
  setTargetBid: (cid, tid, bid) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? setTargetBid(c, tid, bid) : c) },
  })),
  adjustTargetBid: (cid, tid, mult) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? adjustTargetBid(c, tid, mult) : c) },
  })),
  pauseTarget: (cid, tid) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? pauseTarget(c, tid) : c) },
  })),
  setTargetStatus: (cid, tid, status) => set((s) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c) => c.id === cid ? setTargetStatus(c, tid, status) : c) },
  })),
});
