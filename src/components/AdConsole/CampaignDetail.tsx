'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, acosClass } from '@/engine/ad-console/engine';

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
  const toggleStatusTarget = useAdConsoleStore((s) => s.pauseTarget);
  const removeTarget = useAdConsoleStore((s) => s.removeTarget);
  const setTargetBid = useAdConsoleStore((s) => s.setTargetBid);
  const adjustTargetBid = useAdConsoleStore((s) => s.adjustTargetBid);
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const harvestTerm = useAdConsoleStore((s) => s.harvestTerm);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const toggleAddKeywordForm = useAdConsoleStore((s) => s.toggleAddKeywordForm);
  const showAddKeywordForm = useAdConsoleStore((s) => s.showAddKeywordForm);
  const addKeyword = useAdConsoleStore((s) => s.addKeyword);

  const [newKeywordValue, setNewKeywordValue] = useState('');
  const [newKeywordMatch, setNewKeywordMatch] = useState('Exact');
  const [newKeywordBid, setNewKeywordBid] = useState(0.75);
  const [bidEdits, setBidEdits] = useState<Record<string, string>>({});
  const [budgetInput, setBudgetInput] = useState(String(campaign.dailyBudget));
  const [defaultBidInput, setDefaultBidInput] = useState(String(campaign.defaultBid));

  const c = campaign;
  const x = calc(c.metrics);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <h2>{c.name}</h2>
            <div className="detail-meta">
              <span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span>
              <span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span>
              <span className="pill">{c.targetingMode}</span>
              <span className="pill">{c.adFormat}</span>
              <span className="pill">Budget {formatMoney(c.dailyBudget)}</span>
              <span className="pill">{c.bidStrategy}</span>
            </div>
          </div>
          <div className="pill-row">
            <button className="btn" onClick={() => toggleStatus(c.id)}>{c.status === 'Enabled' ? 'Pause' : 'Enable'}</button>
            <button className="btn" onClick={() => duplicateCampaign(c.id)}>Duplicate</button>
            <button className="btn danger" onClick={() => { if (confirm('Archive this campaign?')) archiveCampaign(c.id); }}>Archive</button>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="metric-card">
          <div className="label">Spend</div>
          <div className="value">{formatMoney(c.metrics.spend)}</div>
          <div className="delta">CPC {formatBid(x.cpc)}</div>
        </div>
        <div className="metric-card">
          <div className="label">Sales</div>
          <div className="value">{formatMoney(c.metrics.sales)}</div>
          <div className="delta good">{formatWhole(c.metrics.orders)} orders</div>
        </div>
        <div className="metric-card">
          <div className="label">ACOS</div>
          <div className="value">{formatPercent(x.acos)}</div>
          <div className={`delta ${x.acos <= 30 ? 'good' : 'bad'}`}>Target: 30%</div>
        </div>
        <div className="metric-card">
          <div className="label">CTR</div>
          <div className="value">{formatPercent(x.ctr)}</div>
          <div className="delta">CVR {formatPercent(x.cvr)}</div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={`tab ${selectedTab === tab.id ? 'active' : ''}`} onClick={() => setTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {selectedTab === 'overview' && renderOverview(c)}
      {selectedTab === 'adgroups' && renderAdGroups(c)}
      {selectedTab === 'targets' && renderTargets(c)}
      {selectedTab === 'searchTerms' && renderSearchTerms(c)}
      {selectedTab === 'negatives' && renderNegatives(c)}
      {selectedTab === 'budgetRules' && renderBudgetRules(c)}
      {selectedTab === 'placements' && renderPlacements(c)}
      {selectedTab === 'history' && renderHistory(c)}
    </div>
  );

  function renderOverview(c: Campaign) {
    return (
      <div className="split">
        <div className="card pad">
          <div className="card-title"><h2>Campaign settings</h2><span>Editable training controls</span></div>
          <div className="form-grid">
            <div className="field">
              <label>Daily budget</label>
              <input className="input full" type="number" min="1" value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)} />
            </div>
            <div className="field">
              <label>Default bid</label>
              <input className="input full" type="number" min="0.02" step="0.01" value={defaultBidInput}
                onChange={(e) => setDefaultBidInput(e.target.value)} />
            </div>
            <div className="field">
              <label>Bid strategy</label>
              <select className="select full" value={c.bidStrategy}
                onChange={(e) => useAdConsoleStore.getState().updateCampaignSettings(c.id, { bidStrategy: e.target.value as any })}>
                {['Dynamic bids - down only', 'Dynamic bids - up and down', 'Fixed bids', 'Cost per click', 'Cost per thousand impressions'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select className="select full" value={c.status}
                onChange={(e) => toggleStatus(c.id)}>
                {['Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <button className="btn primary" style={{ marginTop: 12 }}
            onClick={() => {
              useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                dailyBudget: Number(budgetInput),
                defaultBid: Number(defaultBidInput),
              });
            }}>Save settings</button>
        </div>
        <div className="card pad">
          <div className="card-title"><h2>Products</h2><span>{c.type}</span></div>
          {c.products.map((p) => <div key={p} className="pill" style={{ marginBottom: 4 }}>{p}</div>)}
          {c.creative && (
            <div style={{ marginTop: 10 }}>
              <div className="review-box">
                <div className="review-row"><span>Brand</span><strong>{c.creative.brandName || 'N/A'}</strong></div>
                <div className="review-row"><span>Headline</span><strong>{c.creative.headline || 'N/A'}</strong></div>
              </div>
              {c.creativeStatus === 'Rejected' && (
                <div className="coach-tip" style={{ marginTop: 8 }}>Creative rejected: {c.creativeIssue}</div>
              )}
            </div>
          )}
        </div>
        <div className="card pad" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title"><h2>Top targets by profit signal</h2><span>Use to train bid optimization</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Target</th><th>Bid</th><th>Spend</th><th>Sales</th><th>ACOS</th></tr></thead>
              <tbody>
                {c.targets.slice(0, 4).map((t) => {
                  const tx = calc(t);
                  return (
                    <tr key={t.id}>
                      <td><strong>{t.value}</strong></td>
                      <td className="money">{formatBid(t.bid)}</td>
                      <td className="money">{formatMoney(t.spend)}</td>
                      <td className="money">{formatMoney(t.sales)}</td>
                      <td className={`mono ${acosClass(tx.acos)}`}>{t.sales ? formatPercent(tx.acos) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderAdGroups(c: Campaign) {
    if (!c.adGroups.length) return <div className="empty"><h3>No ad groups</h3></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ad group</th><th>Status</th><th>Default bid</th><th>Impr.</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th><th>Targets</th></tr></thead>
          <tbody>
            {c.adGroups.map((ag) => {
              const m = ag.metrics || { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
              const ax = calc(m);
              return (
                <tr key={ag.id}>
                  <td><strong>{ag.name}</strong></td>
                  <td><span className={`pill ${ag.status === 'Enabled' ? 'green' : 'orange'}`}>{ag.status}</span></td>
                  <td className="money">{formatBid(ag.defaultBid)}</td>
                  <td className="mono">{formatWhole(m.impressions)}</td>
                  <td className="mono">{formatWhole(m.clicks)}</td>
                  <td className="money">{formatMoney(m.spend)}</td>
                  <td className="money">{formatMoney(m.sales)}</td>
                  <td className={`mono ${acosClass(ax.acos)}`}>{ax.acos ? formatPercent(ax.acos) : '-'}</td>
                  <td>{c.targets.filter((t) => t.adGroupId === ag.id).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTargets(c: Campaign) {
    if (!c.targets.length && !showAddKeywordForm) return <div className="empty"><h3>No targets</h3></div>;

    return (
      <div>
        <div style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          {!showAddKeywordForm && (
            <button className="btn primary" onClick={() => toggleAddKeywordForm()}>+ Add keyword</button>
          )}
        </div>

        {showAddKeywordForm && (
          <div className="card pad" style={{ marginBottom: 10, background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
              <div className="field" style={{ flex: 2, minWidth: 150 }}>
                <label>Keyword</label>
                <input className="input full" value={newKeywordValue} onChange={(e) => setNewKeywordValue(e.target.value)} placeholder="Enter keyword" />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 100 }}>
                <label>Match type</label>
                <select className="select full" value={newKeywordMatch} onChange={(e) => setNewKeywordMatch(e.target.value)}>
                  <option>Exact</option><option>Phrase</option><option>Broad</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1, minWidth: 80 }}>
                <label>Bid</label>
                <input className="input full" type="number" min="0.02" step="0.01" value={newKeywordBid} onChange={(e) => setNewKeywordBid(Number(e.target.value))} />
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={() => {
                if (!newKeywordValue.trim()) return;
                addKeyword(c.id, newKeywordValue.trim(), newKeywordMatch, newKeywordBid);
                setNewKeywordValue('');
                setNewKeywordBid(0.75);
              }}>Add keyword</button>
              <button className="btn" onClick={() => toggleAddKeywordForm()}>Cancel</button>
            </div>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Target</th><th>Type</th><th>Match</th><th>Status</th><th>Bid</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th><th>Actions</th></tr></thead>
            <tbody>
              {c.targets.map((t) => {
                const tx = calc(t);
                return (
                  <tr key={t.id}>
                    <td><strong>{t.value}</strong></td>
                    <td>{t.type}</td><td>{t.match}</td>
                    <td><span className={`pill ${t.status === 'Enabled' ? 'green' : 'orange'}`}>{t.status}</span></td>
                    <td>
                      <input className="input" style={{ width: 72, padding: '4px 6px', fontSize: 12 }}
                        type="number" min="0.02" step="0.01" value={bidEdits[t.id] ?? t.bid}
                        onChange={(e) => setBidEdits({ ...bidEdits, [t.id]: e.target.value })} />
                    </td>
                    <td className="mono">{formatWhole(t.clicks)}</td>
                    <td className="money">{formatMoney(t.spend)}</td>
                    <td className="money">{formatMoney(t.sales)}</td>
                    <td className={`mono ${acosClass(tx.acos)}`}>{t.sales ? formatPercent(tx.acos) : 'No sales'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn small" onClick={() => adjustTargetBid(c.id, t.id, 0.9)}>-10%</button>{' '}
                      <button className="btn small" onClick={() => adjustTargetBid(c.id, t.id, 1.1)}>+10%</button>{' '}
                      <button className="btn small" onClick={() => {
                        const bid = Number(bidEdits[t.id]);
                        if (bid && bid > 0) setTargetBid(c.id, t.id, bid);
                      }}>Set</button>{' '}
                      <button className={`btn small ${t.status === 'Paused' ? 'primary' : ''}`}
                        onClick={() => toggleStatusTarget(c.id, t.id)}>
                        {t.status === 'Paused' ? 'Enable' : 'Pause'}
                      </button>{' '}
                      <button className="btn small danger" onClick={() => {
                        if (confirm(`Remove "${t.value}"?`)) removeTarget(c.id, t.id);
                      }}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderSearchTerms(c: Campaign) {
    if (!c.searchTerms.length) return <div className="empty"><h3>No search term rows</h3></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Search term</th><th>Matched target</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th><th>Rec</th><th>Actions</th></tr></thead>
          <tbody>
            {c.searchTerms.map((st) => {
              const sx = calc({ impressions: 0, clicks: st.clicks, spend: st.spend, sales: st.sales, orders: st.orders });
              return (
                <tr key={st.id}>
                  <td><strong>{st.term}</strong></td><td>{st.target}</td>
                  <td className="mono">{formatWhole(st.clicks)}</td>
                  <td className="money">{formatMoney(st.spend)}</td>
                  <td className="money">{formatMoney(st.sales)}</td>
                  <td className={`mono ${st.sales ? acosClass(sx.acos) : 'bad'}`}>{st.sales ? formatPercent(sx.acos) : 'No sales'}</td>
                  <td><span className={`pill ${st.recommendation === 'Negate' ? 'bad' : st.recommendation === 'Add as exact keyword' ? 'green' : ''}`}>{st.recommendation}</span></td>
                  <td>
                    <button className="btn small" onClick={() => harvestTerm(c.id, st.term)}>Harvest exact</button>{' '}
                    <button className="btn small danger" onClick={() => addNegative(c.id, st.term)}>Negative exact</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderNegatives(c: Campaign) {
    if (!c.negatives.length) return <div className="empty"><h3>No negatives added</h3></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Negative</th><th>Type</th></tr></thead>
          <tbody>
            {c.negatives.map((n, i) => (
              <tr key={n.id || i}>
                <td><strong>{n.value}</strong></td><td>{n.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderBudgetRules(c: Campaign) {
    if (!c.budgetRules.length) return <div className="empty"><h3>No budget rules</h3></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Increase</th><th>Condition</th></tr></thead>
          <tbody>
            {c.budgetRules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td><td>{r.type}</td>
                <td>{r.increase}x</td><td className="muted">{r.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPlacements(c: Campaign) {
    const [top, setTop] = useState(String(c.placements.top));
    const [prod, setProd] = useState(String(c.placements.product));
    const [rest, setRest] = useState(String(c.placements.rest));

    return (
      <div className="card pad">
        <div className="card-title"><h2>Placement adjustments</h2><span>Percentage modifiers</span></div>
        <div className="form-grid" style={{ maxWidth: 400 }}>
          <div className="field">
            <label>Top of Search (%)</label>
            <input className="input full" type="number" min="0" max="900" value={top} onChange={(e) => setTop(e.target.value)} />
          </div>
          <div className="field">
            <label>Product pages (%)</label>
            <input className="input full" type="number" min="0" max="900" value={prod} onChange={(e) => setProd(e.target.value)} />
          </div>
          <div className="field">
            <label>Rest of Search (%)</label>
            <input className="input full" type="number" min="0" max="900" value={rest} onChange={(e) => setRest(e.target.value)} />
          </div>
        </div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={() => {
          useAdConsoleStore.getState().savePlacements(c.id, {
            top: Number(top),
            product: Number(prod),
            rest: Number(rest),
          });
        }}>Save placements</button>
      </div>
    );
  }

  function renderHistory(c: Campaign) {
    if (!c.history.length) return <div className="empty"><h3>No history</h3></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Event</th></tr></thead>
          <tbody>
            {c.history.map((h, i) => (
              <tr key={i}><td><span className="muted">{h}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
