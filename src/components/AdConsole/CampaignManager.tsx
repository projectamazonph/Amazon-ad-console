'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { useCampaignManager } from './hooks/useCampaignManager';
import { MetricCard } from './metrics/MetricCard';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import type { FilterState } from '@/engine/ad-console/types';
import { ManagerCampaignsTab } from './details/ManagerCampaignsTab';
import { ManagerAdGroupsTab } from './details/ManagerAdGroupsTab';
import { ManagerTargetsTab } from './details/ManagerTargetsTab';
import { ManagerSearchTermsTab } from './details/ManagerSearchTermsTab';
import { ManagerNegativesTab } from './details/ManagerNegativesTab';

export function CampaignManager() {
  const {
    filteredCampaigns, filter, selectedTab, portfolioOptions,
    setFilter, selectCampaign, setTab, toggleCampaignStatus,
    duplicateCampaign, archiveCampaign, runSimulation, setView,
  } = useCampaignManager();

  const [simulating, setSimulating] = useState(false);

  return (
    <div>
      {simulating && (
        <div className="sim-overlay">
          <Card variant="default" className="sim-overlay-card">
            <div className="loading-dots">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <h3>Running simulation…</h3>
            <p>Generating performance data for enabled campaigns.</p>
          </Card>
        </div>
      )}

      <div className="page-title">
        <div>
          <h1>Campaign manager</h1>
          <p>Practice the core ads console flow: filter, inspect, optimize, create, and report.</p>
        </div>
        <Button label="Create campaign" variant="primary" onClick={() => setView('create')} />
      </div>

      <div className="toolbar">
        <div className="search">
          <label htmlFor="cm-search" className="visually-hidden">Search campaigns</label>
          <input
            id="cm-search"
            placeholder="Search campaigns, portfolio, targeting"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
        </div>
        <label htmlFor="cm-filter-type" className="visually-hidden">Campaign type</label>
        <select id="cm-filter-type" className="select" value={filter.type} onChange={(e) => setFilter({ type: e.target.value as FilterState['type'] })}>
          {['All', 'SP', 'SB', 'SD'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label htmlFor="cm-filter-status" className="visually-hidden">Campaign status</label>
        <select id="cm-filter-status" className="select" value={filter.status} onChange={(e) => setFilter({ status: e.target.value as FilterState['status'] })}>
          {['All', 'Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label htmlFor="cm-filter-portfolio" className="visually-hidden">Portfolio filter</label>
        <select id="cm-filter-portfolio" className="select" value={filter.portfolio} onChange={(e) => setFilter({ portfolio: e.target.value })}>
          {portfolioOptions.map((x) => <option key={x}>{x}</option>)}
        </select>
        <Button label="Reset" onClick={() => setFilter({ type: 'All', status: 'All', portfolio: 'All', search: '' })} />
        <Button label="Run 7-day sim" variant="info" onClick={async () => {
              setSimulating(true);
              await new Promise(r => setTimeout(r, 50));
              runSimulation();
              await new Promise(r => setTimeout(r, 600));
              setSimulating(false);
            }} />
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-5)' }}>
        {(() => {
          const m = filteredCampaigns.reduce(
            (acc, c) => {
              acc.impressions += c.metrics.impressions;
              acc.clicks += c.metrics.clicks;
              acc.spend += c.metrics.spend;
              acc.sales += c.metrics.sales;
              acc.orders += c.metrics.orders;
              return acc;
            },
            { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
          );
          const x = calc(m);
          const acosTone = x.acos <= 0 ? '' : x.acos <= 30 ? 'good' : 'bad';
          return (
            <>
              <MetricCard label="Spend" value={formatMoney(m.spend)} delta={`CPC $${x.cpc.toFixed(2)}`} />
              <MetricCard label="Sales" value={formatMoney(m.sales)} delta={`${m.orders} orders`} tone={m.sales > 0 ? 'good' : ''} />
              <MetricCard label="ACOS" value={x.acos > 0 ? formatPercent(x.acos) : '—'} delta={x.acos > 0 ? `ROAS ${x.roas.toFixed(2)}×` : 'No spend yet'} tone={acosTone} />
              <MetricCard label="Clicks" value={formatWhole(m.clicks)} delta={`CTR ${formatPercent(x.ctr)}`} />
            </>
          );
        })()}
      </div>

      <div className="tabs">
        {['campaigns', 'adgroups', 'targets', 'searchTerms', 'negatives'].map((tab) => (
          <button
            key={tab}
            className={`tab ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => setTab(tab)}
          >
            {tab === 'campaigns' ? 'Campaigns' : tab === 'adgroups' ? 'Ad groups' : tab === 'targets' ? 'Targeting' : tab === 'searchTerms' ? 'Search terms' : 'Negatives'}
          </button>
        ))}
      </div>

      {selectedTab === 'campaigns' && (
        <ManagerCampaignsTab
          campaigns={filteredCampaigns}
          onSelect={selectCampaign}
          onToggleStatus={toggleCampaignStatus}
          onDuplicate={duplicateCampaign}
          onArchive={archiveCampaign}
          onCreate={() => setView('create')}
        />
      )}
      {selectedTab === 'adgroups' && <ManagerAdGroupsTab campaigns={filteredCampaigns} onSelectCampaign={selectCampaign} />}
      {selectedTab === 'targets' && <ManagerTargetsTab campaigns={filteredCampaigns} />}
      {selectedTab === 'searchTerms' && <ManagerSearchTermsTab campaigns={filteredCampaigns} />}
      {selectedTab === 'negatives' && <ManagerNegativesTab campaigns={filteredCampaigns} />}
    </div>
  );
}
