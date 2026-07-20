'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaign: Campaign;
}

export function TargetsTab({ campaign: c }: Props) {
  const addKeyword = useAdConsoleStore((s) => s.addKeyword);
  const removeTarget = useAdConsoleStore((s) => s.removeTarget);
  const setTargetBid = useAdConsoleStore((s) => s.setTargetBid);
  const adjustTargetBid = useAdConsoleStore((s) => s.adjustTargetBid);
  const toggleStatusTarget = useAdConsoleStore((s) => s.pauseTarget);
  const toggleAddKeywordForm = useAdConsoleStore((s) => s.toggleAddKeywordForm);
  const showAddKeywordForm = useAdConsoleStore((s) => s.showAddKeywordForm);

  const [newKeywordValue, setNewKeywordValue] = useState('');
  const [newKeywordMatch, setNewKeywordMatch] = useState<'Exact' | 'Phrase' | 'Broad'>('Exact');
  const [newKeywordBid, setNewKeywordBid] = useState(0.75);
  const [newKeywordAdGroup, setNewKeywordAdGroup] = useState(c.adGroups[0]?.id ?? '');
  const [bidEdits, setBidEdits] = useState<Record<string, string>>({});

  if (!c.targets.length && !showAddKeywordForm) {
    return (
      <EmptyState icon="target" title="No targets" message="Add keywords, products, or audience targets to start targeting shoppers.">
        <button className="btn primary" onClick={() => toggleAddKeywordForm()}>+ Add keyword</button>
      </EmptyState>
    );
  }

  return (
    <div>
      {!showAddKeywordForm && (
        <div className="tab-toolbar center">
          <button className="btn primary" onClick={() => toggleAddKeywordForm()}>+ Add keyword</button>
        </div>
      )}

      {showAddKeywordForm && (
        <div className="card pad" style={{ marginBottom: 10, background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
            <div className="field" style={{ flex: 2, minWidth: 150 }}>
              <label>Keyword</label>
              <input className="input full" value={newKeywordValue} onChange={(e) => setNewKeywordValue(e.target.value)} placeholder="Enter keyword" />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 100 }}>
              <label>Match type</label>
              <select className="select full" value={newKeywordMatch} onChange={(e) => setNewKeywordMatch(e.target.value as 'Exact' | 'Phrase' | 'Broad')}>
                <option>Exact</option><option>Phrase</option><option>Broad</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 80 }}>
              <label>Bid</label>
              <input className="input full" type="number" min="0.02" step="0.01" value={newKeywordBid} onChange={(e) => setNewKeywordBid(Number(e.target.value))} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>Ad group</label>
              <select className="select full" value={newKeywordAdGroup} onChange={(e) => setNewKeywordAdGroup(e.target.value)}>
                {c.adGroups.map((ag) => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={() => {
              if (!newKeywordValue.trim()) return;
              addKeyword(c.id, newKeywordValue.trim(), newKeywordMatch, newKeywordBid, newKeywordAdGroup);
              setNewKeywordValue('');
              setNewKeywordBid(0.75);
            }}>Add keyword</button>
            <button className="btn" onClick={() => toggleAddKeywordForm()}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Target</th><th>Type</th><th>Match</th><th>Status</th><th>Bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Actions</th></tr></thead>
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
                  <td className="mono">{formatWhole(t.impressions)}</td>
                  <td className="mono">{formatWhole(t.clicks)}</td>
                  <td className="money">{formatBid(tx.cpc)}</td>
                  <td className="money">{formatMoney(t.spend)}</td>
                  <td className="money">{formatMoney(t.sales)}</td>
                  <td className="mono">{formatWhole(t.orders)}</td>
                  <td className={`mono ${acosClass(tx.acos)}`}>{t.sales ? formatPercent(tx.acos) : 'No sales'}</td>
                  <td className="mono">{formatRoas(tx.roas)}</td>
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
