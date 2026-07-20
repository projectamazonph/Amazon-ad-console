/**
 * TDD tests for campaign detail hooks.
 * These define the public seams — components depend on hooks, not store directly.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCampaignDetail } from '../hooks/useCampaignDetail';
import { useSearchTerms } from '../hooks/useSearchTerms';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/types';

function resetStore() {
  act(() => {
    useAdConsoleStore.getState().resetAll();
  });
}

function getFirstCampaign(): Campaign {
  return useAdConsoleStore.getState().state.campaigns[0]!;
}

describe('useCampaignDetail', () => {
  beforeEach(() => resetStore());

  it('returns campaign actions bound to the given campaign', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useCampaignDetail(campaign));

    expect(typeof result.current.toggleStatus).toBe('function');
    expect(typeof result.current.archiveCampaign).toBe('function');
    expect(typeof result.current.duplicateCampaign).toBe('function');
    expect(typeof result.current.addNegative).toBe('function');
    expect(typeof result.current.harvestTerm).toBe('function');
    expect(typeof result.current.runSimulation).toBe('function');
  });

  it('toggleStatus changes campaign status', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useCampaignDetail(campaign));

    const originalStatus = campaign.status;
    act(() => result.current.toggleStatus());

    const updated = useAdConsoleStore.getState().state.campaigns.find((c) => c.id === campaign.id)!;
    expect(updated.status).not.toBe(originalStatus);
  });

  it('archiveCampaign sets status to Archived', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useCampaignDetail(campaign));

    act(() => result.current.archiveCampaign());

    const updated = useAdConsoleStore.getState().state.campaigns.find((c) => c.id === campaign.id)!;
    expect(updated.status).toBe('Archived');
  });

  it('addNegative adds a negative keyword to the campaign', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useCampaignDetail(campaign));
    const before = campaign.negatives.length;

    act(() => result.current.addNegative('test negative'));

    const updated = useAdConsoleStore.getState().state.campaigns.find((c) => c.id === campaign.id)!;
    expect(updated.negatives.length).toBe(before + 1);
  });
});

describe('useSearchTerms', () => {
  beforeEach(() => resetStore());

  it('returns filtered search terms excluding negatives', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useSearchTerms(campaign));

    expect(Array.isArray(result.current.terms)).toBe(true);
    // Terms should be filtered by negatives
    result.current.terms.forEach((term) => {
      expect(typeof term).toBe('string');
    });
  });

  it('filters out terms matching negative phrase', () => {
    const campaign = getFirstCampaign();
    // Add a negative
    act(() => {
      useAdConsoleStore.getState().addNegative(campaign.id, 'cheap', 'Negative phrase');
    });

    const updated = useAdConsoleStore.getState().state.campaigns.find((c) => c.id === campaign.id)!;
    const { result } = renderHook(() => useSearchTerms(updated));

    result.current.terms.forEach((term) => {
      expect(term.toLowerCase()).not.toContain('cheap');
    });
  });

  it('returns term count', () => {
    const campaign = getFirstCampaign();
    const { result } = renderHook(() => useSearchTerms(campaign));

    expect(typeof result.current.count).toBe('number');
    expect(result.current.count).toBe(result.current.terms.length);
  });
});
