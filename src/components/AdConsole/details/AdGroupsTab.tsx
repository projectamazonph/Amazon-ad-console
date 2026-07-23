'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaign: Campaign;
}

export function AdGroupsTab({ campaign: c }: Props) {
  const addAdGroup = useAdConsoleStore((s) => s.addAdGroup);
  const renameAdGroup = useAdConsoleStore((s) => s.renameAdGroup);
  const setAdGroupStatus = useAdConsoleStore((s) => s.setAdGroupStatus);
  const setAdGroupDefaultBid = useAdConsoleStore((s) => s.setAdGroupDefaultBid);
  const removeAdGroup = useAdConsoleStore((s) => s.removeAdGroup);

  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string | null>(null);
  const [adGroupNameEdits, setAdGroupNameEdits] = useState<Record<string, string>>({});
  const [adGroupBidEdits, setAdGroupBidEdits] = useState<Record<string, string>>({});
  const [newAdGroupName, setNewAdGroupName] = useState('');

  if (!c.adGroups.length) {
    return <EmptyState icon="group" title="No ad groups" message="This campaign has no ad groups. Add one to organize your targets." />;
  }

  const focused = selectedAdGroupId ? c.adGroups.find((ag) => ag.id === selectedAdGroupId) : null;

  if (focused) {
    const agTargets = c.targets.filter((t) => t.adGroupId === focused.id);
    return (
      <div>
        <Button label="← All ad groups" size="sm" style={{ marginBottom: 10 }} onClick={() => setSelectedAdGroupId(null)} />
        <Card variant="default" padding={6} style={{ marginBottom: 12 }}>
          <div className="section-head">
            <h2>{focused.name}</h2>
            <span className="meta">{agTargets.length} targets</span>
          </div>
          <div className="form-grid" style={{ maxWidth: 460 }}>
            <div className="field">
              <label htmlFor={`ag-status-${focused.id}`}>Status</label>
              <select id={`ag-status-${focused.id}`} className="select full" value={focused.status}
                onChange={(e) => setAdGroupStatus(c.id, focused.id, e.target.value as any)}>
                {['Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`ag-bid-${focused.id}`}>Default bid</label>
              <input id={`ag-bid-${focused.id}`} className="input full" type="number" min="0.02" step="0.01"
                value={adGroupBidEdits[focused.id] ?? String(focused.defaultBid)}
                onChange={(e) => setAdGroupBidEdits((p) => ({ ...p, [focused.id]: e.target.value }))} />
            </div>
          </div>
          <Button label="Save default bid" variant="primary" style={{ marginTop: 8 }}
            onClick={() => setAdGroupDefaultBid(c.id, focused.id, Number(adGroupBidEdits[focused.id] ?? focused.defaultBid))} />
        </Card>
        {!agTargets.length ? (
          <EmptyState icon="target" title={`No targets in "${focused.name}" yet`} message="Add keywords or product targets to this ad group from the Targeting tab." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Target</th><th>Type</th><th>Match</th><th>Status</th><th>Bid</th><th>Impr.</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th></tr></thead>
              <tbody>
                {agTargets.map((t) => {
                  const tx = calc(t);
                  return (
                    <tr key={t.id}>
                      <td><strong>{t.value}</strong></td>
                      <td>{t.type}</td><td>{t.match}</td>
                      <td><span className={`pill ${t.status === 'Enabled' ? 'green' : 'orange'}`}>{t.status}</span></td>
                      <td className="money">{formatBid(t.bid)}</td>
                      <td className="mono">{formatWhole(t.impressions)}</td>
                      <td className="mono">{formatWhole(t.clicks)}</td>
                      <td className="money">{formatMoney(t.spend)}</td>
                      <td className="money">{formatMoney(t.sales)}</td>
                      <td className={`mono ${acosClass(tx.acos)}`}>{t.sales ? formatPercent(tx.acos) : 'No sales'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="tab-toolbar">
        <div className="field" style={{ flex: 1, minWidth: 180 }}>
          <label htmlFor="ag-new-name">New ad group name</label>
          <input id="ag-new-name" className="input full" value={newAdGroupName}
            onChange={(e) => setNewAdGroupName(e.target.value)} placeholder="e.g. Branded keywords" />
        </div>
        <Button label="+ Add ad group" variant="primary" onClick={() => { if (newAdGroupName.trim()) { addAdGroup(c.id, newAdGroupName); setNewAdGroupName(''); } }} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ad group</th><th>Status</th><th>Default bid</th><th>Impr.</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th><th>Targets</th><th>Actions</th></tr></thead>
          <tbody>
            {c.adGroups.map((ag) => {
              const m = ag.metrics || { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
              const ax = calc(m);
              const count = c.targets.filter((t) => t.adGroupId === ag.id).length;
              return (
                <tr key={ag.id}>
                  <td>
                    <label htmlFor={`ag-row-name-${ag.id}`} className="visually-hidden">Ad group name</label>
                    <input id={`ag-row-name-${ag.id}`} className="input" style={{ width: 180, fontWeight: 600 }}
                      value={adGroupNameEdits[ag.id] ?? ag.name}
                      onChange={(e) => setAdGroupNameEdits((p) => ({ ...p, [ag.id]: e.target.value }))}
                      onBlur={(e) => { if (e.target.value.trim()) renameAdGroup(c.id, ag.id, e.target.value); }} />
                  </td>
                  <td>
                    <label htmlFor={`ag-row-status-${ag.id}`} className="visually-hidden">Ad group status</label>
                    <select id={`ag-row-status-${ag.id}`} className="select" value={ag.status}
                      onChange={(e) => setAdGroupStatus(c.id, ag.id, e.target.value as any)}>
                      {['Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </td>
                  <td className="money">{formatBid(ag.defaultBid)}</td>
                  <td className="mono">{formatWhole(m.impressions)}</td>
                  <td className="mono">{formatWhole(m.clicks)}</td>
                  <td className="money">{formatMoney(m.spend)}</td>
                  <td className="money">{formatMoney(m.sales)}</td>
                  <td className={`mono ${acosClass(ax.acos)}`}>{ax.acos ? formatPercent(ax.acos) : '-'}</td>
                  <td>
                    <button className="row-link" onClick={() => setSelectedAdGroupId(ag.id)}>
                      {count} {count === 1 ? 'target' : 'targets'} →
                    </button>
                  </td>
                  <td>
                    {c.adGroups.length > 1 && (
                      <Button label="Remove" variant="destructive" size="sm"
                        onClick={() => { if (confirm(`Remove ad group "${ag.name}" and its targets?`)) removeAdGroup(c.id, ag.id); }} />
                    )}
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
