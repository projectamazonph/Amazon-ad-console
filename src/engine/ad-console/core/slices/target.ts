/**
 * Target/keyword slice — add, remove, bid, pause.
 * Supports all target types: Keyword, ASIN, Category, Auto, Audience.
 */
import type { TargetType, MatchType, CampaignStatus } from '../types';
import {
  addTarget, addKeyword, addAutoTarget, addAsinTarget, addCategoryTarget,
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

export const createTargetSlice = (set: any, ..._rest: any[]): TargetSlice => ({
  addKeyword: (cid, keyword, match, bid, adGroupId) => set((s: any) => {
    const c = s.state.campaigns.find((x: any) => x.id === cid);
    if (!c) return s;
    const { campaign } = addKeyword(c, keyword, match, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x: any) => x.id === cid ? campaign : x) } };
  }),
  addAutoTarget: (cid, autoType, bid, adGroupId) => set((s: any) => {
    const c = s.state.campaigns.find((x: any) => x.id === cid);
    if (!c) return s;
    const { campaign } = addAutoTarget(c, autoType, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x: any) => x.id === cid ? campaign : x) } };
  }),
  addAsinTarget: (cid, asin, bid, adGroupId) => set((s: any) => {
    const c = s.state.campaigns.find((x: any) => x.id === cid);
    if (!c) return s;
    const { campaign } = addAsinTarget(c, asin, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x: any) => x.id === cid ? campaign : x) } };
  }),
  addCategoryTarget: (cid, categoryPath, bid, adGroupId) => set((s: any) => {
    const c = s.state.campaigns.find((x: any) => x.id === cid);
    if (!c) return s;
    const { campaign } = addCategoryTarget(c, categoryPath, bid, adGroupId);
    return { state: { ...s.state, campaigns: s.state.campaigns.map((x: any) => x.id === cid ? campaign : x) } };
  }),
  removeTarget: (cid, tid) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? removeTarget(c, tid) : c) },
  })),
  setTargetBid: (cid, tid, bid) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setTargetBid(c, tid, bid) : c) },
  })),
  adjustTargetBid: (cid, tid, mult) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? adjustTargetBid(c, tid, mult) : c) },
  })),
  pauseTarget: (cid, tid) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? pauseTarget(c, tid) : c) },
  })),
  setTargetStatus: (cid, tid, status) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? setTargetStatus(c, tid, status) : c) },
  })),
});