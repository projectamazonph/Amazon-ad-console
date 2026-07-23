'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
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
        <Button label="+ Add keyword" variant="primary" onClick={() => toggleAddKeywordForm()} />
      </EmptyState>
    );
  }

  return (
    <div>
      {!showAddKeywordForm && (
        <div className="tab-toolbar center">
          <Button label="+ Add keyword" variant="primary" onClick={() => toggleAddKeywordForm()} />
        </div>
      )}

      {showAddKeywordForm && (
        <Card variant="default" padding={6} style={{ marginBottom: 10, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
            <div className="field" style={{ flex: 2, minWidth: 150 }}>
              <label htmlFor="kw-value">Keyword</label>
              <input id="kw-value" className="input full" value={newKeywordValue} onChange={(e) => setNewKeywordValue(e.target.value)} placeholder="Enter keyword" />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 100 }}>
              <label htmlFor="kw-match">Match type</label>
              <select id="kw-match" className="select full" value={newKeywordMatch} onChange={(e) => setNewKeywordMatch(e.target.value as 'Exact' | 'Phrase' | 'Broad')}>
                <option>Exact</option><option>Phrase</option><option>Broad</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 80 }}>
              <label htmlFor="kw-bid">Bid</label>
              <input id="kw-bid" className="input full" type="number" min="0.02" step="0.01" value={newKeywordBid} onChange={(e) => setNewKeywordBid(Number(e.target.value))} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label htmlFor="kw-adgroup">Ad group</label>
              <select id="kw-adgroup" className="select full" value={newKeywordAdGroup} onChange={(e) => setNewKeywordAdGroup(e.target.value)}>
                {c.adGroups.map((ag) => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button label="Add keyword" variant="primary" onClick={() => {
              if (!newKeywordValue.trim()) return;
              addKeyword(c.id, newKeywordValue.trim(), newKeywordMatch, newKeywordBid, newKeywordAdGroup);
              setNewKeywordValue('');
              setNewKeywordBid(0.75);
            }} />
            <Button label="Cancel" onClick={() => toggleAddKeywordForm()} />
          </div>
        </Card>
      )}

      <Table>
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
                    <label htmlFor={`t-bid-${t.id}`} className="visually-hidden">Bid for {t.value}</label>
                    <input id={`t-bid-${t.id}`} className="input" style={{ width: 72, padding: '4px 6px', fontSize: 12 }}
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
                    <Button label="-10%" size="sm" onClick={() => adjustTargetBid(c.id, t.id, 0.9)} />{' '}
                    <Button label="+10%" size="sm" onClick={() => adjustTargetBid(c.id, t.id, 1.1)} />{' '}
                    <Button label="Set" size="sm" onClick={() => {
                      const bid = Number(bidEdits[t.id]);
                      if (bid && bid > 0) setTargetBid(c.id, t.id, bid);
                    }} />{' '}
                    <Button
                      label={t.status === 'Paused' ? 'Enable' : 'Pause'}
                      variant={t.status === 'Paused' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => toggleStatusTarget(c.id, t.id)}
                    />{' '}
                    <Button label="Remove" variant="destructive" size="sm" onClick={() => {
                      if (confirm(`Remove "${t.value}"?`)) removeTarget(c.id, t.id);
                    }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
    </div>
  );
}
