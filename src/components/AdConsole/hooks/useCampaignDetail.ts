/**
 * Hook: useCampaignDetail
 * Encapsulates all CampaignDetail actions behind a clean interface.
 * Components depend on this, not the store directly (DIP).
 */
import { useCallback } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign, CampaignStatus } from '@/engine/ad-console/types';

export interface CampaignDetailActions {
  toggleStatus: () => void;
  archiveCampaign: () => void;
  duplicateCampaign: () => void;
  addNegative: (term: string, type?: 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category', adGroupId?: string) => void;
  harvestTerm: (term: string) => void;
  runSimulation: (days?: number) => void;
  addAdGroup: (name: string) => void;
  renameAdGroup: (adGroupId: string, name: string) => void;
  setAdGroupStatus: (adGroupId: string, status: CampaignStatus) => void;
  setAdGroupDefaultBid: (adGroupId: string, bid: number) => void;
  removeAdGroup: (adGroupId: string) => void;
  addKeyword: (value: string, match: 'Exact' | 'Phrase' | 'Broad', bid: number, adGroupId?: string) => void;
  removeTarget: (targetId: string) => void;
  setTargetBid: (targetId: string, bid: number) => void;
  adjustTargetBid: (targetId: string, multiplier: number) => void;
  pauseTarget: (targetId: string) => void;
  addBudgetRule: (name: string, type: 'Schedule' | 'Performance', increase: number, condition: string) => void;
  removeBudgetRule: (ruleId: string) => void;
  updateBudgetRule: (ruleId: string, updates: Record<string, unknown>) => void;
}

export function useCampaignDetail(campaign: Campaign): CampaignDetailActions {
  const store = useAdConsoleStore;

  const toggleStatus = useCallback(() => {
    store.getState().toggleCampaignStatus(campaign.id);
  }, [campaign.id]);

  const archive = useCallback(() => {
    store.getState().archiveCampaign(campaign.id);
  }, [campaign.id]);

  const duplicate = useCallback(() => {
    store.getState().duplicateCampaign(campaign.id);
  }, [campaign.id]);

  const addNeg = useCallback((term: string, type: 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category' = 'Negative exact', adGroupId?: string) => {
    store.getState().addNegative(campaign.id, term, type, adGroupId);
  }, [campaign.id]);

  const harvest = useCallback((term: string) => {
    store.getState().harvestTerm(campaign.id, term);
  }, [campaign.id]);

  const simulate = useCallback((days?: number) => {
    store.getState().runSimulation(days);
  }, []);

  const addAg = useCallback((name: string) => {
    store.getState().addAdGroup(campaign.id, name);
  }, [campaign.id]);

  const renameAg = useCallback((agId: string, name: string) => {
    store.getState().renameAdGroup(campaign.id, agId, name);
  }, [campaign.id]);

  const setAgStatus = useCallback((agId: string, status: CampaignStatus) => {
    store.getState().setAdGroupStatus(campaign.id, agId, status);
  }, [campaign.id]);

  const setAgBid = useCallback((agId: string, bid: number) => {
    store.getState().setAdGroupDefaultBid(campaign.id, agId, bid);
  }, [campaign.id]);

  const removeAg = useCallback((agId: string) => {
    store.getState().removeAdGroup(campaign.id, agId);
  }, [campaign.id]);

  const addKw = useCallback((value: string, match: 'Exact' | 'Phrase' | 'Broad', bid: number, adGroupId?: string) => {
    store.getState().addKeyword(campaign.id, value, match, bid, adGroupId);
  }, [campaign.id]);

  const removeTgt = useCallback((targetId: string) => {
    store.getState().removeTarget(campaign.id, targetId);
  }, [campaign.id]);

  const setTgtBid = useCallback((targetId: string, bid: number) => {
    store.getState().setTargetBid(campaign.id, targetId, bid);
  }, [campaign.id]);

  const adjTgtBid = useCallback((targetId: string, multiplier: number) => {
    store.getState().adjustTargetBid(campaign.id, targetId, multiplier);
  }, [campaign.id]);

  const pauseTgt = useCallback((targetId: string) => {
    store.getState().pauseTarget(campaign.id, targetId);
  }, [campaign.id]);

  const addBr = useCallback((name: string, type: 'Schedule' | 'Performance', increase: number, condition: string) => {
    store.getState().addBudgetRule(campaign.id, name, type, increase, condition);
  }, [campaign.id]);

  const removeBr = useCallback((ruleId: string) => {
    store.getState().removeBudgetRule(campaign.id, ruleId);
  }, [campaign.id]);

  const updateBr = useCallback((ruleId: string, updates: Record<string, unknown>) => {
    store.getState().updateBudgetRule(campaign.id, ruleId, updates);
  }, [campaign.id]);

  return {
    toggleStatus, archiveCampaign: archive, duplicateCampaign: duplicate,
    addNegative: addNeg, harvestTerm: harvest, runSimulation: simulate,
    addAdGroup: addAg, renameAdGroup: renameAg, setAdGroupStatus: setAgStatus,
    setAdGroupDefaultBid: setAgBid, removeAdGroup: removeAg,
    addKeyword: addKw, removeTarget: removeTgt, setTargetBid: setTgtBid,
    adjustTargetBid: adjTgtBid, pauseTarget: pauseTgt,
    addBudgetRule: addBr, removeBudgetRule: removeBr, updateBudgetRule: updateBr,
  };
}
