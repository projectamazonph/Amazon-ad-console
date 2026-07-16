'use client';

import { useMemo } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatRoas, acosClass } from '@/engine/ad-console/engine';

export function PortfolioOverview() {
  const state = useAdConsoleStore((s) => s.state);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);

  const portfolios = useMemo(() => {
    const map = new Map<string, typeof state.campaigns>();
    state.campaigns.forEach((c) => {
      const p = c.portfolio || '(No portfolio)';
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(c);
    });
    return Array.from(map.entries()).map(([name, camps]) => ({
      name,
      campaigns: camps,
      metrics: camps.reduce(
        (acc, c) => {
          acc.impressions += c.metrics.impressions;
          acc.clicks += c.metrics.clicks;
          acc.spend += c.metrics.spend;
          acc.sales += c.metrics.sales;
          acc.orders += c.metrics.orders;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ),
    }));
  }, [state.campaigns]);

  const totalMetrics = useMemo(
    () =>
      state.campaigns.reduce(
        (acc, c) => {
          acc.impressions += c.metrics.impressions;
          acc.clicks += c.metrics.clicks;
          acc.spend += c.metrics.spend;
          acc.sales += c.metrics.sales;
          acc.orders += c.metrics.orders;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ),
    [state.campaigns],
  );

  const totalDerived = calc(totalMetrics);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Portfolios</h1>
          <p>View performance grouped by portfolio.</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="metric-card">
          <div className="label">Total portfolios</div>
          <div className="value">{portfolios.length}</div>
        </div>
        <div className="metric-card">
          <div className="label">Total spend (all)</div>
          <div className="value">{formatMoney(totalMetrics.spend)}</div>
        </div>
        <div className="metric-card">
          <div className="label">Total sales (all)</div>
          <div className="value">{formatMoney(totalMetrics.sales)}</div>
          <div className="delta good">{formatWhole(totalMetrics.orders)} orders</div>
        </div>
        <div className="metric-card">
          <div className="label">Blended ACOS</div>
          <div className="value">{formatPercent(totalDerived.acos)}</div>
          <div className={`delta ${totalDerived.acos <= 30 ? 'good' : 'bad'}`}>ROAS {formatRoas(totalDerived.roas)}</div>
        </div>
      </div>

      {portfolios.length === 0 ? (
        <div className="empty"><h3>No portfolios</h3><p>Create a campaign with a portfolio name to see it here.</p></div>
      ) : (
        portfolios.map((pf) => {
          const x = calc(pf.metrics);
          return (
            <div key={pf.name} className="card pad" style={{ marginBottom: 14 }}>
              <div className="card-title">
                <h2>{pf.name}</h2>
                <span>{pf.campaigns.length} campaign{pf.campaigns.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid-4" style={{ marginBottom: 12 }}>
                <div><span className="muted">Spend</span><div style={{ fontWeight: 600 }}>{formatMoney(pf.metrics.spend)}</div></div>
                <div><span className="muted">Sales</span><div style={{ fontWeight: 600 }}>{formatMoney(pf.metrics.sales)}</div></div>
                <div><span className={`mono ${acosClass(x.acos)}`} style={{ fontWeight: 600 }}>{formatPercent(x.acos)}</span><div className="muted">ACOS</div></div>
                <div><span style={{ fontWeight: 600 }}>{formatRoas(x.roas)}</span><div className="muted">ROAS</div></div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th><th>Type</th><th>Status</th><th>Budget</th><th>Spend</th><th>Sales</th><th>ACOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pf.campaigns.map((c) => {
                      const cx = calc(c.metrics);
                      return (
                        <tr key={c.id}>
                          <td>
                            <button onClick={() => selectCampaign(c.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500 }}>
                              {c.name}
                            </button>
                          </td>
                          <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                          <td><span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span></td>
                          <td className="money">{formatMoney(c.dailyBudget)}</td>
                          <td className="money">{formatMoney(c.metrics.spend)}</td>
                          <td className="money">{formatMoney(c.metrics.sales)}</td>
                          <td className={`mono ${acosClass(cx.acos)}`}>{formatPercent(cx.acos)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
