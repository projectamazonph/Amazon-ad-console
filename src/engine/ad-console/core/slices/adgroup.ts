/**
 * Ad group slice — CRUD operations, using campaignMutator helper.
 */
import type { CampaignStatus } from '../types';
import { addAdGroup, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup } from '../engine';
import { campaignMutator } from './helpers';

export interface AdGroupSlice {
  addAdGroup: (campaignId: string, name: string) => void;
  renameAdGroup: (campaignId: string, adGroupId: string, name: string) => void;
  setAdGroupStatus: (campaignId: string, adGroupId: string, status: CampaignStatus) => void;
  setAdGroupDefaultBid: (campaignId: string, adGroupId: string, bid: number) => void;
  removeAdGroup: (campaignId: string, adGroupId: string) => void;
}

export const createAdGroupSlice = (set: any, ..._rest: any[]): AdGroupSlice => ({
  addAdGroup: campaignMutator<[string]>(set, addAdGroup),
  renameAdGroup: campaignMutator<[string, string]>(set, renameAdGroup),
  setAdGroupStatus: campaignMutator<[string, CampaignStatus]>(set, setAdGroupStatus),
  setAdGroupDefaultBid: campaignMutator<[string, number]>(set, setAdGroupDefaultBid),
  removeAdGroup: campaignMutator<[string]>(set, removeAdGroup),
});
