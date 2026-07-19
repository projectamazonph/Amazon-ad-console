'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { OverviewTab } from './details/OverviewTab';
import { AdGroupsTab } from './details/AdGroupsTab';
import { TargetsTab } from './details/TargetsTab';
import { HistoryTab } from './details/HistoryTab';
import { SearchTermsTab } from './details/SearchTermsTab';
import { NegativesTab } from './details/NegativesTab';
import { PlacementsTab } from './details/PlacementsTab';
import { BudgetRulesTab } from './details/BudgetRulesTab';

interface Props {
  campaign: Campaign;
}

export function CampaignDetail({ campaign }: Props) {
  const state = useAdConsoleStore((s) => s.state);
  const setView = useAdConsoleStore((s) => s.setView);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const toggleStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const archiveCampaign = useAdConsoleStore((s) => s.archiveCampaign);
  const duplicateCampaign = useAdConsoleStore((s) => s.duplicateCampaign);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);

  const c = campaign;
  const selectedTab = state.selectedTab;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'adgroups', label: 'Ad groups' },
    { id: 'targets', label: 'Targeting' },
    { id: 'searchTerms', label: 'Search terms' },
    { id: 'negatives', label: 'Negatives' },
    { id: 'budgetRules', label: 'Budget rules' },
    { id: 'placements', label: 'Placements' },
    { id: 'history', label: 'Change history' },
  ];

  return (
    <div>
      <div className="breadcrumb">
        <button onClick={() => setView('campaigns')}>Campaign manager</button> / <span>{c.name}</span>
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{c.name}</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>{c.type} · {c.targetingMode} · {c.portfolio}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => { selectCampaign(null); setView('campaigns'); }}>← Back</button>
            <button className="btn blue" onClick={() => runSimulation()}>Run 7-day sim</button>
            <button className={`btn ${c.status === 'Enabled' ? 'orange' : ''}`} onClick={() => toggleStatus(c.id)}>
              {c.status === 'Enabled' ? 'Pause' : 'Enable'}
            </button>
            <button className="btn" onClick={() => duplicateCampaign(c.id)}>Duplicate</button>
            <button className="btn danger" onClick={() => { if (confirm(`Archive "${c.name}"?`)) archiveCampaign(c.id); }}>Archive</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={`tab ${selectedTab === tab.id ? 'active' : ''}`} onClick={() => setTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'overview' && <OverviewTab campaign={c} />}
      {selectedTab === 'adgroups' && <AdGroupsTab campaign={c} />}
      {selectedTab === 'targets' && <TargetsTab campaign={c} />}
      {selectedTab === 'searchTerms' && <SearchTermsTab campaign={c} />}
      {selectedTab === 'negatives' && <NegativesTab campaign={c} />}
      {selectedTab === 'budgetRules' && <BudgetRulesTab campaign={c} />}
      {selectedTab === 'placements' && <PlacementsTab campaign={c} />}
      {selectedTab === 'history' && <HistoryTab campaign={c} />}
    </div>
  );
}
