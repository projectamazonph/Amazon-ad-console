'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { MetricCard } from './metrics/MetricCard';

export function Dashboard() {
  const state = useAdConsoleStore((s) => s.state);
  const setView = useAdConsoleStore((s) => s.setView);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);

  const enabledCampaigns = state.campaigns.filter((c) => c.status === 'Enabled');
  const totalMetrics = useAdConsoleStore((s) => s.totalMetricsCalc());
  const calc = useAdConsoleStore((s) => s.derivedMetrics);
  const d = calc(totalMetrics);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Home dashboard</h1>
          <p>Train VAs on campaign navigation, setup, and daily management without giving live account access.</p>
        </div>
        <button className="btn primary" onClick={() => setView('create')}>Create campaign</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <MetricCard label="Spend" value={fmtMoney(totalMetrics.spend)} delta="Training account, enabled campaigns" />
        <MetricCard label="Sales" value={fmtMoney(totalMetrics.sales)} delta={`${fmtWhole(totalMetrics.orders)} orders`} tone="good" />
        <MetricCard label="ACOS" value={fmtPercent(d.acos)} delta={d.acos <= 30 ? 'Healthy blended ACOS' : 'Needs optimization'} tone={d.acos <= 30 ? 'good' : 'bad'} />
        <MetricCard label="ROAS" value={fmtRoas(d.roas)} delta="Sales divided by ad spend" />
      </div>

      <div className="split">
        <div className="card pad">
          <div className="card-title">
            <h2>Campaign snapshot</h2>
            <span>{state.campaigns.length} campaigns</span>
          </div>
          {renderCampaignTable(state.campaigns.slice(0, 7), selectCampaign, calc)}
        </div>
        <div>
          <div className="card pad" style={{ marginBottom: 14 }}>
            <div className="card-title"><h2>Operator alerts</h2><span>Simulated data</span></div>
            <div className="insight-list">
              <div className="insight red">
                <strong>Waste detected</strong>
                SP Auto has search terms with spend and zero orders. Open Search terms and add negatives.
              </div>
              <div className="insight orange">
                <strong>SB creative review</strong>
                Paused SB Video campaign is ready for a relaunch exercise after creative check.
              </div>
              <div className="insight green">
                <strong>Remarketing winner</strong>
                SD Views Remarketing has strong ROAS. Good campaign for budget rule practice.
              </div>
            </div>
          </div>
          <div className="card pad">
            <div className="card-title"><h2>Training coverage</h2><span>Core modules</span></div>
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

function fmtMoney(n: number) { return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtWhole(n: number) { return n.toLocaleString(); }
function fmtPercent(n: number) { return n.toFixed(2) + '%'; }
function fmtRoas(n: number) { return n.toFixed(2); }

function acosClass(acos: number) {
  if (acos <= 30) return 'good';
  if (acos <= 50) return 'warn';
  return 'bad';
}

function renderCampaignTable(
  campaigns: any[],
  selectCampaign: (id: string) => void,
  calc: any,
) {
  if (!campaigns.length) {
    return <div className="empty"><h3>No campaigns found</h3><p>Create a campaign to get started.</p></div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th><th>Type</th><th>Status</th><th>Budget</th><th>Targeting</th>
            <th>Impr.</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c: any) => {
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
                <td><span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span></td>
                <td className="money">{fmtMoney(c.dailyBudget)}</td>
                <td><span className="muted">{c.targetingMode}</span></td>
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
