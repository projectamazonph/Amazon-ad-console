'use client';

import { useState, useMemo } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, totalMetrics as sumMetrics, formatMoney, formatWhole, formatPercent, formatRoas, acosClass } from '@/engine/ad-console/core/engine';

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
      metrics: sumMetrics(camps),
    }));
  }, [state.campaigns]);

  const totalMetrics = useMemo(() => sumMetrics(state.campaigns), [state.campaigns]);

  const totalDerived = calc(totalMetrics);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Portfolios</h1>
          <p>Group campaigns into portfolios and manage portfolio structure.</p>
        </div>
        <button className={`btn ${manageMode ? 'primary' : ''}`} onClick={() => setManageMode((m) => !m)}>
          {manageMode ? 'Done managing' : 'Manage portfolios'}
        </button>
      </div>

      {manageMode && (
        <Card variant="default" padding={6} style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-title"><h2>Create portfolio</h2><span>New portfolio group</span></div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'end' }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="po-new-name">Portfolio name</label>
              <input id="po-new-name" className="input full" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Holiday Campaigns" />
            </div>
            <Button label="Create" variant="primary" onClick={() => {
              if (newName.trim()) {
                createPortfolio(newName.trim());
                setNewName('');
              }
            }} />
          </div>
        </Card>
      )}

      <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
        <Card variant="default" className="metric-card">
          <div className="label">Total portfolios</div>
          <div className="value">{portfolios.length}</div>
        </Card>
        <Card variant="default" className="metric-card">
          <div className="label">Total spend (all)</div>
          <div className="value">{formatMoney(totalMetrics.spend)}</div>
        </Card>
        <Card variant="default" className="metric-card">
          <div className="label">Total sales (all)</div>
          <div className="value">{formatMoney(totalMetrics.sales)}</div>
          <div className="delta good">{formatWhole(totalMetrics.orders)} orders</div>
        </Card>
        <Card variant="default" className="metric-card">
          <div className="label">Blended ACOS</div>
          <div className="value">{formatPercent(totalDerived.acos)}</div>
          <div className={`delta ${totalDerived.acos <= 30 ? 'good' : 'bad'}`}>ROAS {formatRoas(totalDerived.roas)}</div>
        </Card>
      </div>

      {portfolios.length === 0 ? (
        <div className="empty"><h3>No portfolios</h3><p>Create a campaign with a portfolio name or use the Manage button above.</p></div>
      ) : (
        portfolios.map((pf) => {
          const x = calc(pf.metrics);
          return (
            <div key={pf.name} style={{ marginBottom: 'var(--space-4)' }}>
              <Card variant="default" padding={6}>
                <div className="card-title">
                  {manageMode ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                      <label htmlFor={`po-rename-${pf.name}`} className="visually-hidden">Portfolio name</label>
                      <input id={`po-rename-${pf.name}`} className="input" style={{ fontWeight: 600, flex: 1 }}
                        value={renameMap[pf.name] ?? pf.name}
                        onChange={(e) => setRenameMap((m) => ({ ...m, [pf.name]: e.target.value }))}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== pf.name) renamePortfolio(pf.name, v);
                        }} />
                      <span className="muted">{pf.campaigns.length} campaign{pf.campaigns.length !== 1 ? 's' : ''}</span>
                      <Button label="Delete" variant="destructive" size="sm" onClick={() => {
                        if (confirm(`Remove portfolio "${pf.name}"? Campaigns will be unassigned.`)) deletePortfolio(pf.name);
                      }} />
                    </div>
                  ) : (
                    <>
                      <h2>{pf.name}</h2>
                      <span>{pf.campaigns.length} campaign{pf.campaigns.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
                <div className="grid-4">
                  <div><span className="muted">Spend</span><div style={{ fontWeight: 600 }}>{formatMoney(pf.metrics.spend)}</div></div>
                  <div><span className="muted">Sales</span><div style={{ fontWeight: 600 }}>{formatMoney(pf.metrics.sales)}</div></div>
                  <div><span className={`mono ${acosClass(x.acos)}`} style={{ fontWeight: 600 }}>{formatPercent(x.acos)}</span><div className="muted">ACOS</div></div>
                  <div><span style={{ fontWeight: 600 }}>{formatRoas(x.roas)}</span><div className="muted">ROAS</div></div>
                </div>
              </Card>
              <Table>
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
                            <button className="row-link" onClick={() => selectCampaign(c.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                              {c.name}
                            </button>
                          </td>
                          <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                          <td><span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span></td>
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
                </Table>
            </div>
          );
        })
      )}
    </div>
  );
}
