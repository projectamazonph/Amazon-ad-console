/**
 * Hook: useCampaignManager
 * Encapsulates CampaignManager state and actions (DIP).
 */
import { useMemo } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign, FilterState } from '@/engine/ad-console/types';
import type { CoreSlice } from '@/engine/ad-console/core/slices/core';

export interface CampaignManagerState {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  filter: FilterState;
  selectedTab: string;
  portfolioOptions: string[];
}

export interface CampaignManagerActions {
  setFilter: (filter: Partial<FilterState>) => void;
  selectCampaign: (id: string | null) => void;
  setTab: (tab: string) => void;
  toggleCampaignStatus: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  archiveCampaign: (id: string) => void;
  runSimulation: (days?: number) => void;
  setView: CoreSlice['setView'];
}

export function useCampaignManager(): CampaignManagerState & CampaignManagerActions {
  const state = useAdConsoleStore((s) => s.state);
  const setFilter = useAdConsoleStore((s) => s.setFilter);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const toggleCampaignStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const duplicateCampaign = useAdConsoleStore((s) => s.duplicateCampaign);
  const archiveCampaign = useAdConsoleStore((s) => s.archiveCampaign);
  const setView = useAdConsoleStore((s) => s.setView);

  const portfolioOptions = useMemo(() => {
    const names = new Set(state.campaigns.map((c) => c.portfolio).filter(Boolean));
    return ['All', ...Array.from(names).sort()];
  }, [state.campaigns]);

  const filteredCampaigns = useMemo(() => {
    return state.campaigns.filter((c) => {
      const typeOk = state.filter.type === 'All' || c.type === state.filter.type;
      const statusOk = state.filter.status === 'All' || c.status === state.filter.status;
      const pfOk = state.filter.portfolio === 'All' || c.portfolio === state.filter.portfolio;
      const q = state.filter.search.toLowerCase();
      const text = `${c.name} ${c.type} ${c.targetingMode} ${c.portfolio} ${c.adFormat}`.toLowerCase();
      return typeOk && statusOk && pfOk && (!q || text.includes(q));
    });
  }, [state.campaigns, state.filter]);

  const runSimulation = useMemo(() => {
    return (days?: number) => {
      useAdConsoleStore.getState().runSimulation(days);
    };
  }, []);

  return {
    campaigns: state.campaigns,
    filteredCampaigns,
    filter: state.filter,
    selectedTab: state.selectedTab,
    portfolioOptions,
    setFilter,
    selectCampaign,
    setTab,
    toggleCampaignStatus,
    duplicateCampaign,
    archiveCampaign,
    runSimulation,
    setView,
  };
}
