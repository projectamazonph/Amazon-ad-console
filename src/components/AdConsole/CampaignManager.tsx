'use client';

import { useState } from 'react';
import { useCampaignManager } from './hooks/useCampaignManager';
import { MetricCard } from './metrics/MetricCard';
import { calc, formatMoney, formatWhole, formatPercent } from '@/engine/ad-console/engine';
import type { FilterState } from '@/engine/ad-console/types';
import { ManagerCampaignsTab } from './details/ManagerCampaignsTab';
import { ManagerAdGroupsTab } from './details/ManagerAdGroupsTab';
import { ManagerTargetsTab } from './details/ManagerTargetsTab';
import { ManagerSearchTermsTab } from './details/ManagerSearchTermsTab';
import { ManagerNegativesTab } from './details/ManagerNegativesTab';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from '@astryxdesign/core/Text';

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
          <div className="card">
            <div className="loading-dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <h3>Running simulation…</h3>
            <p>Generating performance data for enabled campaigns.</p>
          </div>
        </div>
      )}

      <div className="page-title">
        <div style={{ minWidth: 0 }}>
          <Text type="display-3" size="lg" weight="semibold" maxLines={1} hasTruncateTooltip as="h1">
            Campaign manager
          </Text>
          <Text type="body" color="secondary" maxLines={2} hasTruncateTooltip>
            Practice the core ads console flow: filter, inspect, optimize, create, and report.
          </Text>
        </div>
        <Button
          variant="primary"
          label="Create campaign"
          onClick={() => setView('create')}
        />
      </div>

      <div className="toolbar">
        <HStack gap={2} wrap style={{ flex: 1 }}>
          <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
            <TextInput
              label="Search"
              value={filter.search}
              onChange={(v) => setFilter({ search: v })}
              description="Search campaigns, portfolio, targeting"
              width="100%"
            />
          </div>
          <div className="field" style={{ minWidth: 0 }}>
            <label htmlFor="cm-filter-type">Type</label>
            <select
              id="cm-filter-type"
              className="select"
              value={filter.type}
              onChange={(e) =>
                setFilter({ type: e.target.value as FilterState['type'] })
              }
              style={{ width: 100 }}
            >
              {['All', 'SP', 'SB', 'SD'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 0 }}>
            <label htmlFor="cm-filter-status">Status</label>
            <select
              id="cm-filter-status"
              className="select"
              value={filter.status}
              onChange={(e) =>
                setFilter({ status: e.target.value as FilterState['status'] })
              }
              style={{ width: 120 }}
            >
              {['All', 'Enabled', 'Paused', 'Archived'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 0 }}>
            <label htmlFor="cm-filter-portfolio">Portfolio</label>
            <select
              id="cm-filter-portfolio"
              className="select"
              value={filter.portfolio}
              onChange={(e) => setFilter({ portfolio: e.target.value })}
              style={{ width: 140 }}
            >
              {portfolioOptions.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            label="Reset"
            onClick={() =>
              setFilter({ type: 'All', status: 'All', portfolio: 'All', search: '' })
            }
          />
          <Button
            variant="primary"
            size="sm"
            label="Run 7-day sim"
            onClick={async () => {
              setSimulating(true);
              await new Promise((r) => setTimeout(r, 50));
              runSimulation();
              await new Promise((r) => setTimeout(r, 600));
              setSimulating(false);
            }}
          />
        </HStack>
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
              <MetricCard
                label="Spend"
                value={formatMoney(m.spend)}
                delta={`CPC $${x.cpc.toFixed(2)}`}
              />
              <MetricCard
                label="Sales"
                value={formatMoney(m.sales)}
                delta={`${m.orders} orders`}
                tone={m.sales > 0 ? 'good' : ''}
              />
              <MetricCard
                label="ACOS"
                value={x.acos > 0 ? formatPercent(x.acos) : '—'}
                delta={x.acos > 0 ? `ROAS ${x.roas.toFixed(2)}×` : 'No spend yet'}
                tone={acosTone}
              />
              <MetricCard
                label="Clicks"
                value={formatWhole(m.clicks)}
                delta={`CTR ${formatPercent(x.ctr)}`}
              />
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
            type="button"
          >
            {tab === 'campaigns'
              ? 'Campaigns'
              : tab === 'adgroups'
                ? 'Ad groups'
                : tab === 'targets'
                  ? 'Targeting'
                  : tab === 'searchTerms'
                    ? 'Search terms'
                    : 'Negatives'}
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
      {selectedTab === 'adgroups' && (
        <ManagerAdGroupsTab
          campaigns={filteredCampaigns}
          onSelectCampaign={selectCampaign}
        />
      )}
      {selectedTab === 'targets' && <ManagerTargetsTab campaigns={filteredCampaigns} />}
      {selectedTab === 'searchTerms' && (
        <ManagerSearchTermsTab campaigns={filteredCampaigns} />
      )}
      {selectedTab === 'negatives' && <ManagerNegativesTab campaigns={filteredCampaigns} />}
    </div>
  );
}
