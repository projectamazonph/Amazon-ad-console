'use client';

import { useMemo, useCallback, useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { MetricCard } from './metrics/MetricCard';
import type { FilterState } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass, isFilteredByNegative } from '@/engine/ad-console/engine';

export function CampaignManager() {
  const state = useAdConsoleStore((s) => s.state);
  const setFilter = useAdConsoleStore((s) => s.setFilter);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const toggleCampaignStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const duplicateCampaign = useAdConsoleStore((s) => s.duplicateCampaign);
  const archiveCampaign = useAdConsoleStore((s) => s.archiveCampaign);
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);

  // Compute portfolio options from all campaigns
  const portfolioOptions = useMemo(() => {
    const names = new Set(state.campaigns.map((c) => c.portfolio).filter(Boolean));
    return ['All', ...Array.from(names).sort()];
  }, [state.campaigns]);

  // Filter campaigns
  const filteredCamps = useMemo(() => {
    return state.campaigns.filter((c) => {
      const typeOk = state.filter.type === 'All' || c.type === state.filter.type;
      const statusOk = state.filter.status === 'All' || c.status === state.filter.status;
      const pfOk = state.filter.portfolio === 'All' || c.portfolio === state.filter.portfolio;
      const q = state.filter.search.toLowerCase();
      const text = `${c.name} ${c.type} ${c.targetingMode} ${c.portfolio} ${c.adFormat}`.toLowerCase();
      return typeOk && statusOk && pfOk && (!q || text.includes(q));
    });
  }, [state.campaigns, state.filter]);

  const selectedTab = state.selectedTab;
  const filter = state.filter;

  // Ad group table
  const renderAdGroups = () => {
    const rows = filteredCamps.flatMap((c) => c.adGroups.map((ag) => ({ c, ag })));
    if (!rows.length) return <div className="empty"><span className="icon">👥</span><h3>No ad groups</h3><p>Ad groups are created automatically when a campaign is launched. Create a campaign to see ad groups.</p></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad group</th><th>Campaign</th><th>Type</th><th>Status</th>
              <th>Default bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Targets</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, ag }) => {
              const m = ag.metrics || { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
              const x = calc(m);
              return (
                <tr key={ag.id}>
                  <td><strong>{ag.name}</strong></td>
                  <td><button className="row-link" onClick={() => selectCampaign(c.id)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer' }}>{c.name}</button></td>
                  <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                  <td><span className={`pill ${ag.status === 'Enabled' ? 'green' : 'orange'}`}>{ag.status}</span></td>
                  <td className="money">{ag.defaultBid.toFixed(2)}</td>
                  <td className="mono">{formatWhole(m.impressions)}</td>
                  <td className="mono">{formatWhole(m.clicks)}</td>
                  <td className="money">{formatBid(x.cpc)}</td>
                  <td className="money">{formatMoney(m.spend)}</td>
                  <td className="money">{formatMoney(m.sales)}</td>
                  <td className="mono">{formatWhole(m.orders)}</td>
                  <td className={`mono ${acosClass(x.acos)}`}>{x.acos ? formatPercent(x.acos) : '-'}</td>
                  <td className="mono">{formatRoas(x.roas)}</td>
                  <td>{c.targets.filter((t) => t.adGroupId === ag.id).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Targets table
  const renderTargets = () => {
    const rows = filteredCamps.flatMap((c) => c.targets.map((t) => ({ c, t })));
    if (!rows.length) return <div className="empty"><span className="icon">🎯</span><h3>No targets</h3><p>Targets are created when you add keywords, products, or audiences to your campaigns.</p></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Target</th><th>Campaign</th><th>Type</th><th>Match</th><th>Status</th>
              <th>Bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, t }) => {
              const x = calc(t);
              return (
                <tr key={t.id}>
                  <td><strong>{t.value}</strong></td>
                  <td>{c.name}</td>
                  <td>{t.type}</td><td>{t.match}</td>
                  <td><span className={`pill ${t.status === 'Enabled' ? 'green' : 'orange'}`}>{t.status}</span></td>
                  <td className="money">{t.bid.toFixed(2)}</td>
                  <td className="mono">{formatWhole(t.impressions)}</td>
                  <td className="mono">{formatWhole(t.clicks)}</td>
                  <td className="money">{formatBid(x.cpc)}</td>
                  <td className="money">{formatMoney(t.spend)}</td>
                  <td className="money">{formatMoney(t.sales)}</td>
                  <td className="mono">{formatWhole(t.orders)}</td>
                  <td className={`mono ${acosClass(x.acos)}`}>{t.sales ? formatPercent(x.acos) : 'No sales'}</td>
                  <td className="mono">{formatRoas(x.roas)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Search terms table
  const renderSearchTerms = () => {
    const rows = filteredCamps.flatMap((c) => 
    (c.searchTerms || [])
      .filter((st) => !isFilteredByNegative(st.term, c.negatives))
      .map((st) => ({ c, st })));
    if (!rows.length) return <div className="empty"><span className="icon">🔎</span><h3>No search terms</h3><p>Search terms appear after running a simulation. They are also filtered by negatives — check the Negatives tab.</p></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Search term</th><th>Campaign</th><th>Matched target</th>
              <th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Rec</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, st }) => {
              const x = calc({ impressions: st.impressions || 0, clicks: st.clicks, spend: st.spend, sales: st.sales, orders: st.orders });
              return (
                <tr key={st.id}>
                  <td><strong>{st.term}</strong></td>
                  <td>{c.name}</td><td>{st.target}</td>
                  <td className="mono">{formatWhole(st.impressions || 0)}</td>
                  <td className="mono">{formatWhole(st.clicks)}</td>
                  <td className="money">{formatBid(x.cpc)}</td>
                  <td className="money">{formatMoney(st.spend)}</td>
                  <td className="money">{formatMoney(st.sales)}</td>
                  <td className="mono">{formatWhole(st.orders)}</td>
                  <td className={`mono ${acosClass(x.acos)}`}>{st.sales ? formatPercent(x.acos) : 'No sales'}</td>
                  <td className="mono">{formatRoas(x.roas)}</td>
                  <td><span className={`pill ${st.recommendation === 'Negate' ? 'bad' : st.recommendation === 'Add as exact keyword' ? 'green' : ''}`}>{st.recommendation}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Negatives table
  const renderNegatives = () => {
    const rows = filteredCamps.flatMap((c) => c.negatives.map((n) => ({ c, n })));
    if (!rows.length) return <div className="empty"><span className="icon">🚫</span><h3>No negatives</h3><p>Negative keywords prevent your ads from showing for irrelevant searches. Add negatives from the Search terms tab or Campaign detail view.</p></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Negative</th><th>Campaign</th><th>Type</th></tr></thead>
          <tbody>
            {rows.map(({ c, n }, i) => (
              <tr key={n.id || i}>
                <td><strong>{n.value}</strong></td><td>{c.name}</td><td>{n.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Campaign table with actions
  const renderCampaigns = () => {
    const hasFilters = filter.type !== 'All' || filter.status !== 'All' || filter.portfolio !== 'All' || filter.search;
    if (!filteredCamps.length) {
      return (
        <div className="empty">
          <span className="icon">{hasFilters ? '🔍' : '📢'}</span>
          <h3>{hasFilters ? 'No matching campaigns' : 'No campaigns yet'}</h3>
          <p>{hasFilters ? 'Try adjusting your filters or resetting them.' : 'Create your first campaign to start training.'}</p>
          {!hasFilters && <button className="btn primary" onClick={() => setView('create')}>Create campaign</button>}
        </div>
      );
    }
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Campaign</th><th>Type</th><th>Creative</th><th>Status</th><th>Budget</th><th>Targeting</th>
              <th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCamps.map((c) => {
              const x = calc(c.metrics);
              return (
                <tr key={c.id}>
                  <td>
                    <button className="row-link" onClick={() => selectCampaign(c.id)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                      {c.name}
                    </button>
                    <div className="muted">{c.portfolio}</div>
                  </td>
                  <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                  <td>{(c.type === 'SB' || c.type === 'SD') && c.creativeStatus ? (
                    <span className={`pill ${c.creativeStatus === 'Approved' ? 'green' : c.creativeStatus === 'Pending' ? '' : 'bad'}`}>{c.creativeStatus}</span>
                  ) : '—'}</td>
                  <td><span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span></td>
                  <td className="money">{formatMoney(c.dailyBudget)}</td>
                  <td><span className="muted">{c.targetingMode}</span></td>
                  <td className="mono">{formatWhole(c.metrics.impressions)}</td>
                  <td className="mono">{formatWhole(c.metrics.clicks)}</td>
                  <td className="money">{formatMoney(c.metrics.spend)}</td>
                  <td className="money">{formatMoney(c.metrics.sales)}</td>
                  <td className="mono">{formatWhole(c.metrics.orders)}</td>
                  <td className="money">{formatBid(x.cpc)}</td>
                  <td className={`mono ${acosClass(x.acos)}`}>{formatPercent(x.acos)}</td>
                  <td className="mono">{formatRoas(x.roas)}</td>
                  <td>
                    <button className="btn small" onClick={() => selectCampaign(c.id)}>Open</button>{' '}
                    <button className="btn small" onClick={() => toggleCampaignStatus(c.id)}>
                      {c.status === 'Enabled' ? 'Pause' : 'Enable'}
                    </button>{' '}
                    <button className="btn small" onClick={() => duplicateCampaign(c.id)}>Dup</button>{' '}
                    <button className="btn small danger" onClick={() => {
                      if (confirm(`Archive "${c.name}"?`)) archiveCampaign(c.id);
                    }}>Archive</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const [simulating, setSimulating] = useState(false);

  return (
    <div>
      {simulating && (
        <div className="sim-overlay">
          <div className="card">
            <div className="loading-dots">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <h3>Running simulation…</h3>
            <p>Generating performance data for enabled campaigns.</p>
          </div>
        </div>
      )}

      <div className="page-title">
        <div>
          <h1>Campaign manager</h1>
          <p>Practice the core ads console flow: filter, inspect, optimize, create, and report.</p>
        </div>
        <button className="btn primary" onClick={() => setView('create')}>Create campaign</button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <input
            placeholder="Search campaigns, portfolio, targeting"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
        </div>
        <select className="select" value={filter.type} onChange={(e) => setFilter({ type: e.target.value as FilterState['type'] })}>
          {['All', 'SP', 'SB', 'SD'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="select" value={filter.status} onChange={(e) => setFilter({ status: e.target.value as FilterState['status'] })}>
          {['All', 'Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="select" value={filter.portfolio} onChange={(e) => setFilter({ portfolio: e.target.value })}>
          {portfolioOptions.map((x) => <option key={x}>{x}</option>)}
        </select>
        <button className="btn" onClick={() => setFilter({ type: 'All', status: 'All', portfolio: 'All', search: '' })}>Reset</button>
        <button className="btn blue" onClick={async () => {
              setSimulating(true);
              await new Promise(r => setTimeout(r, 50));
              useAdConsoleStore.getState().runSimulation();
              await new Promise(r => setTimeout(r, 600));
              setSimulating(false);
            }}>Run 7-day sim</button>
      </div>

      {/* Summary metrics */}
      <div className="grid-4" style={{ marginBottom: 14 }}>
        {(() => {
          const m = filteredCamps.reduce(
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
          return (
            <>
              <MetricCard label="Impressions" value={formatWhole(m.impressions)} delta="Filtered campaigns" />
              <MetricCard label="Clicks" value={formatWhole(m.clicks)} delta={`CTR ${formatPercent(x.ctr)}`} />
              <MetricCard label="Spend" value={formatMoney(m.spend)} delta={`CPC ${x.cpc.toFixed(2)}`} />
              <MetricCard label="ACOS" value={formatPercent(x.acos)} delta={`ROAS ${x.roas.toFixed(2)}`} tone={x.acos <= 30 ? 'good' : 'bad'} />
            </>
          );
        })()}
      </div>

      {/* Tabs */}
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

      {/* Tab content */}
      {selectedTab === 'campaigns' && renderCampaigns()}
      {selectedTab === 'adgroups' && renderAdGroups()}
      {selectedTab === 'targets' && renderTargets()}
      {selectedTab === 'searchTerms' && renderSearchTerms()}
      {selectedTab === 'negatives' && renderNegatives()}
    </div>
  );
}
