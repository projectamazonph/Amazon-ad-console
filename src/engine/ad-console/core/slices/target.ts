/**
 * Target/keyword slice — add, remove, bid, pause.
 * Supports all target types: Keyword, ASIN, Category, Auto, Audience.
 * Uses campaignMutator/campaignMutatorObj helpers.
 */
import type { TargetType, MatchType, CampaignStatus } from '../types';
import {
  addKeyword, addAutoTarget, addAsinTarget, addCategoryTarget,
  removeTarget, setTargetBid, adjustTargetBid, pauseTarget, setTargetStatus,
} from '../engine';
import { campaignMutator, campaignMutatorObj } from './helpers';

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
  addKeyword: campaignMutatorObj<[string, MatchType, number, string?]>(set, addKeyword),
  addAutoTarget: campaignMutatorObj<['close match' | 'loose match' | 'substitutes' | 'complements', number, string?]>(set, addAutoTarget),
  addAsinTarget: campaignMutatorObj<[string, number, string?]>(set, addAsinTarget),
  addCategoryTarget: campaignMutatorObj<[string, number, string?]>(set, addCategoryTarget),
  removeTarget: campaignMutator<[string]>(set, removeTarget),
  setTargetBid: campaignMutator<[string, number]>(set, setTargetBid),
  adjustTargetBid: campaignMutator<[string, number]>(set, adjustTargetBid),
  pauseTarget: campaignMutator<[string]>(set, pauseTarget),
  setTargetStatus: campaignMutator<[string, CampaignStatus]>(set, setTargetStatus),
});
