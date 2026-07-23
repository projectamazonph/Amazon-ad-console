'use client';

import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getKpiTiles } from './nav/consoleNav';
import { calc, formatMoney, formatWhole, formatPercent, acosClass } from '@/engine/ad-console/engine';
import type { Campaign, DerivedMetrics, ConsoleView, Metrics } from '@/engine/ad-console/types';

export function Dashboard() {
  const state = useAdConsoleStore((s) => s.state);
  const setView = useAdConsoleStore((s) => s.setView);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const totalMetrics = useAdConsoleStore((s) => s.totalMetricsCalc);

  const m = totalMetrics();
  const d = calc(m);
  const tiles = getKpiTiles({
    impressions: m.impressions,
    clicks: m.clicks,
    spend: m.spend,
    sales: m.sales,
    orders: m.orders,
    units: m.orders,
  });

  const enabledCount = state.campaigns.filter((c) => c.status === 'Enabled').length;
  const acosHealthy = d.acos > 0 && d.acos <= 30;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Advertising dashboard</h1>
          <p>
            Performance across all enabled campaigns · Coffee Accessories US
          </p>
        </div>
        <Button label="Create campaign" variant="primary" onClick={() => setView('create')} />
      </div>

      <div className="kpi-grid">
        {tiles.map((t) => {
          const isPrimary = t.key === 'sales' || t.key === 'spend' || t.key === 'acos';
          const delta = kpiDelta(t.key, m, d, formatWhole);
          return (
            <div className={`kpi-tile ${isPrimary ? 'primary' : ''}`} key={t.key}>
              <div className="label">{t.label}</div>
              <div className="value">{t.value}</div>
              {delta && (
                <div className={`delta ${delta.tone}`}>
                  {delta.tone !== '' && (
                    <span className={`kpi-trend ${delta.tone}`}>
                      {delta.tone === 'good' ? '↑' : delta.tone === 'bad' ? '↓' : '·'}
                    </span>
                  )}
                  {delta.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="split">
        <Card variant="default" padding={6}>
          <div className="section-head">
            <h2>Campaigns</h2>
            <span className="meta">{enabledCount} enabled · {state.campaigns.length} total</span>
          </div>
          {renderCampaignTable(state.campaigns.slice(0, 8), selectCampaign, calc, setView)}
        </Card>
        <div>
          <Card variant="default" padding={6} style={{ marginBottom: 'var(--space-4)' }}>
            <div className="section-head">
              <h2>Operator alerts</h2>
              <span className="meta">{acosHealthy ? 'On track' : 'Action needed'}</span>
            </div>
            <div className="insight-list">
              <div className="insight red">
                <strong>Waste detected</strong>
                SP Auto has search terms with spend and zero orders. Open Search terms and add negatives.
              </div>
              <div className="insight orange">
                <strong>SB creative review</strong>
                Paused SB Video campaign is ready for a relaunch exercise after a creative check.
              </div>
              <div className="insight green">
                <strong>Remarketing winner</strong>
                SD Views Remarketing has strong ROAS. Good campaign for budget rule practice.
              </div>
            </div>
          </Card>
          <Card variant="default" padding={6}>
            <div className="section-head">
              <h2>Training coverage</h2>
              <span className="meta">Core modules</span>
            </div>
            <div className="pill-row">
              <span className="pill active">Sponsored Products</span>
              <span className="pill active">Sponsored Brands</span>
              <span className="pill active">Sponsored Display</span>
              <span className="pill orange">Search term harvesting</span>
              <span className="pill orange">Negatives</span>
              <span className="pill orange">Budget rules</span>
              <span className="pill green">Placement controls</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function fmtMoney(n: number) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtWhole(n: number) {
  return n.toLocaleString();
}
function fmtPercent(n: number) {
  return n.toFixed(2) + '%';
}

type Tone = '' | 'good' | 'bad';

function kpiDelta(
  key: string,
  m: Metrics,
  d: DerivedMetrics,
  whole: (n: number) => string,
): { text: string; tone: Tone } | null {
  switch (key) {
    case 'acos':
      return d.acos <= 0
        ? { text: 'No spend yet', tone: '' }
        : d.acos <= 30
          ? { text: 'Healthy ACoS', tone: 'good' }
          : { text: 'Above target', tone: 'bad' };
    case 'roas':
      return d.roas <= 0
        ? { text: 'Sales ÷ spend', tone: '' }
        : d.roas >= 3
          ? { text: 'Strong return', tone: 'good' }
          : { text: 'Below 3× target', tone: 'bad' };
    case 'ctr':
      return { text: `${whole(m.clicks)} clicks`, tone: '' };
    case 'sales':
      return { text: `${m.orders} orders`, tone: m.orders > 0 ? 'good' : '' };
    case 'spend':
      return { text: `CPC $${d.cpc.toFixed(2)}`, tone: '' };
    default:
      return { text: `${m.orders} orders`, tone: '' };
  }
}

function renderCampaignTable(
  campaigns: Campaign[],
  selectCampaign: (id: string) => void,
  calc: (m: Metrics) => DerivedMetrics,
  setView?: (view: ConsoleView) => void,
) {
  if (!campaigns.length) {
    return (
      <div className="empty">
        <div className="empty-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <rect x="7" y="12" width="3" height="5" rx="0.5" />
            <rect x="12" y="8" width="3" height="9" rx="0.5" />
            <rect x="17" y="5" width="3" height="12" rx="0.5" />
          </svg>
        </div>
        <h3>No campaigns yet</h3>
        <p>Your advertising journey starts here. Create your first campaign to see performance data.</p>
        <Button label="Create campaign" variant="primary" onClick={() => setView?.('create')} />
      </div>
    );
  }

  return (
    <Table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Type</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Targeting</th>
            <th>Impr.</th>
            <th>Clicks</th>
            <th>Spend</th>
            <th>Sales</th>
            <th>ACOS</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c: Campaign) => {
            const x = calc(c.metrics);
            return (
              <tr key={c.id}>
                <td>
                  <button
                    className="row-link"
                    onClick={() => selectCampaign(c.id)}
                  >
                    {c.name}
                  </button>
                  <div className="muted">{c.portfolio}</div>
                </td>
                <td>
                  <span
                    className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}
                  >
                    {c.type}
                  </span>
                </td>
                <td>
                  <span
                    className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="money">{fmtMoney(c.dailyBudget)}</td>
                <td>
                  <span className="muted">{c.targetingMode}</span>
                </td>
                <td className="mono">{fmtWhole(c.metrics.impressions)}</td>
                <td className="mono">{fmtWhole(c.metrics.clicks)}</td>
                <td className="money">{fmtMoney(c.metrics.spend)}</td>
                <td className="money">{fmtMoney(c.metrics.sales)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{fmtPercent(x.acos)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
  );
}
