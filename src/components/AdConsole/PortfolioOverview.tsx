'use client';

import { useState, useMemo } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack } from '@astryxdesign/core/Stack';

export function PortfolioOverview() {
  const state = useAdConsoleStore((s) => s.state);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const createPortfolio = useAdConsoleStore((s) => s.createPortfolio);
  const renamePortfolio = useAdConsoleStore((s) => s.renamePortfolio);
  const deletePortfolio = useAdConsoleStore((s) => s.deletePortfolio);
  const assignCampaignToPortfolio = useAdConsoleStore((s) => s.assignCampaignToPortfolio);

  const [manageMode, setManageMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

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
          <p>Group campaigns into portfolios and manage portfolio structure.</p>
        </div>
        <Button variant={manageMode ? 'primary' : 'secondary'} label={manageMode ? 'Done managing' : 'Manage portfolios'} onClick={() => setManageMode((m) => !m)} />
      </div>

      {manageMode && (
        <Card padding={6} style={{ marginBottom: 14 }}>
          <div className="card-title"><h2>Create portfolio</h2><span>New portfolio group</span></div>
          <Stack gap={2} align="end">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="po-new-name">Portfolio name</label>
              <input id="po-new-name" className="input full" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Holiday Campaigns" />
            </div>
            <Button variant="primary" label="Create" onClick={() => {
              if (newName.trim()) {
                createPortfolio(newName.trim());
                setNewName('');
              }
            }} />
          </Stack>
        </Card>
      )}

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
        <div className="empty"><h3>No portfolios</h3><p>Create a campaign with a portfolio name or use the Manage button above.</p></div>
      ) : (
        portfolios.map((pf) => {
          const x = calc(pf.metrics);
          return (
            <Card key={pf.name} padding={6} style={{ marginBottom: 14 }}>
              <div className="card-title">
                {manageMode ? (
                  <Stack gap={2} align="center" style={{ flex: 1 }}>
                    <label htmlFor={`po-rename-${pf.name}`} className="visually-hidden">Portfolio name</label>
                    <input id={`po-rename-${pf.name}`} className="input" style={{ fontWeight: 600, flex: 1 }}
                      value={renameMap[pf.name] ?? pf.name}
                      onChange={(e) => setRenameMap((m) => ({ ...m, [pf.name]: e.target.value }))}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== pf.name) renamePortfolio(pf.name, v);
                      }} />
                    <span className="muted">{pf.campaigns.length} campaign{pf.campaigns.length !== 1 ? 's' : ''}</span>
                    <Button variant="destructive" size="sm" label="Delete" onClick={() => {
                      if (confirm(`Remove portfolio "${pf.name}"? Campaigns will be unassigned.`)) deletePortfolio(pf.name);
                    }} />
                  </Stack>
                ) : (
                  <>
                    <h2>{pf.name}</h2>
                    <span>{pf.campaigns.length} campaign{pf.campaigns.length !== 1 ? 's' : ''}</span>
                  </>
                )}
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
                      {manageMode && <th>Assign to</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pf.campaigns.map((c) => {
                      const cx = calc(c.metrics);
                      return (
                        <tr key={c.id}>
                          <td>
                            <button className="row-link" onClick={() => selectCampaign(c.id)}>
                              {c.name}
                            </button>
                          </td>
                          <td><Badge variant={c.type === 'SP' ? 'blue' : c.type === 'SB' ? 'orange' : 'purple'} label={c.type} /></td>
                          <td><Badge variant={c.status === 'Enabled' ? 'success' : c.status === 'Paused' ? 'warning' : 'error'} label={c.status} /></td>
                          <td className="money">{formatMoney(c.dailyBudget)}</td>
                          <td className="money">{formatMoney(c.metrics.spend)}</td>
                          <td className="money">{formatMoney(c.metrics.sales)}</td>
                          <td className={`mono ${acosClass(cx.acos)}`}>{formatPercent(cx.acos)}</td>
                          {manageMode && (
                            <td>
                              <select className="select" value={assignMap[c.id] ?? c.portfolio}
                                onChange={(e) => {
                                  assignCampaignToPortfolio(c.id, e.target.value);
                                  setAssignMap((m) => ({ ...m, [c.id]: e.target.value }));
                                }}>
                                {state.portfolios.map((p) => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
