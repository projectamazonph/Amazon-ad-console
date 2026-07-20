'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';

interface Props { campaign: Campaign }

export function NegativesTab({ campaign }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const removeNegative = useAdConsoleStore((s) => s.removeNegative);
  const toggleNegative = useAdConsoleStore((s) => s.toggleNegative);
  const [negTerm, setNegTerm] = useState('');
  const [negType, setNegType] = useState<'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category'>('Negative exact');
  const c = campaign;

  return (
    <div>
      <div className="tab-toolbar">
        <div className="field" style={{ flex: 2, minWidth: 200 }}>
          <label>Add negative</label>
          <input className="input full" value={negTerm} onChange={(e) => setNegTerm(e.target.value)} placeholder="Enter term to negate"
            onKeyDown={(e) => { if (e.key === 'Enter' && negTerm.trim()) { addNegative(c.id, negTerm.trim(), negType); setNegTerm(''); } }} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 150 }}>
          <label>Type</label>
          <select className="select full" value={negType} onChange={(e) => setNegType(e.target.value as 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category')}>
            <option>Negative exact</option>
            <option>Negative phrase</option>
            <option>Negative ASIN</option>
            <option>Negative category</option>
          </select>
        </div>
        <button className="btn primary" onClick={() => {
          if (negTerm.trim()) {
            addNegative(c.id, negTerm.trim(), negType);
            setNegTerm('');
          }
        }}>Add</button>
      </div>
      {c.negatives.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Negative</th><th>Type</th><th>Level</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {c.negatives.map((n, i) => {
                const status = n.status ?? 'Enabled';
                const enabled = status === 'Enabled';
                return (
                  <tr key={n.id || i}>
                    <td><strong>{n.value}</strong></td>
                    <td>{n.type}</td>
                    <td><span className="muted">{n.adGroupId ? 'Ad group' : 'Campaign'}</span></td>
                    <td><span className={`pill ${enabled ? 'green' : 'orange'}`}>{status}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className={`btn small ${enabled ? '' : 'primary'}`} onClick={() => toggleNegative(c.id, n.id)}>
                        {enabled ? 'Disable' : 'Enable'}
                      </button>{' '}
                      <button className="btn small danger" onClick={() => {
                        if (confirm(`Remove negative "${n.value}"?`)) removeNegative(c.id, n.id);
                      }}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="block"
          title="No negatives added"
          message="Add negative keywords to prevent wasted spend on irrelevant searches. Use the form above or negate from search terms."
        />
      )}
    </div>
  );
}
