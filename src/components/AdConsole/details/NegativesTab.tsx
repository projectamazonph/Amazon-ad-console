'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Props { campaign: Campaign }

export function NegativesTab({ campaign }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const [negTerm, setNegTerm] = useState('');
  const [negType, setNegType] = useState<'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category'>('Negative exact');
  const c = campaign;

  return (
    <div>
      <div className="card pad" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div className="field" style={{ flex: 2 }}>
            <label>Add negative</label>
            <input className="input full" value={negTerm} onChange={(e) => setNegTerm(e.target.value)} placeholder="Enter term to negate" />
          </div>
          <div className="field" style={{ flex: 1 }}>
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
      </div>
      {c.negatives.length > 0 ? (
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
      ) : <div className="empty"><span className="icon">🚫</span><h3>No negatives added</h3><p>Add negative keywords to prevent wasted spend on irrelevant searches. Use the form above or negate from search terms.</p></div>}
    </div>
  );
}
