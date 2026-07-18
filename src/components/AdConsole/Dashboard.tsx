'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getKpiTiles } from './nav/consoleNav';
import { calc, formatMoney, formatWhole, formatPercent, acosClass } from '@/engine/ad-console/engine';

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

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Advertising Dashboard</h1>
          <p>
            Performance across all enabled campaigns in the Training Account (Coffee Accessories US).
          </p>
        </div>
        <button className="btn primary" onClick={() => setView('create')}>
          Create campaign
        </button>
      </div>

      <div className="kpi-grid">
        {tiles.map((t) => (
          <div className="kpi-tile" key={t.key}>
            <div className="label">{t.label}</div>
            <div className="value">{t.value}</div>
            <div className="delta">
              {t.key === 'acos'
                ? d.acos <= 30
                  ? 'Healthy blended ACOS'
                  : 'Needs optimization'
                : t.key === 'roas'
                  ? 'Sales ÷ ad spend'
                  : t.key === 'ctr'
                    ? `${formatWhole(m.clicks)} clicks`
                    : `${m.orders} orders`}
            </div>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="card pad">
          <div className="card-title">
            <h2>Campaigns</h2>
            <span>{state.campaigns.length} total</span>
          </div>
          {renderCampaignTable(state.campaigns.slice(0, 8), selectCampaign, calc, setView)}
        </div>
        <div>
          <div className="card pad" style={{ marginBottom: 14 }}>
            <div className="card-title">
              <h2>Operator alerts</h2>
              <span>Simulated data</span>
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
          </div>
          <div className="card pad">
            <div className="card-title">
              <h2>Training coverage</h2>
              <span>Core modules</span>
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
          </div>
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

function renderCampaignTable(
  campaigns: any[],
  selectCampaign: (id: string) => void,
  calc: any,
  setView?: (view: any) => void,
) {
  if (!campaigns.length) {
    return (
      <div className="empty">
        <span className="icon">📢</span>
        <h3>No campaigns yet</h3>
        <p>Your advertising journey starts here. Create your first campaign to see performance data.</p>
        <button className="btn primary" onClick={() => setView?.('create')}>Create campaign</button>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
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
          {campaigns.map((c: any) => {
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
      </table>
    </div>
  );
}
