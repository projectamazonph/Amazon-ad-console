'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';

interface Props { campaign: Campaign }

export function NegativesTab({ campaign }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const [negTerm, setNegTerm] = useState('');
  const [negType, setNegType] = useState<'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category'>('Negative exact');
  const c = campaign;

  return (
    <div>
      <div className="tab-toolbar">
        <div style={{ flex: 2, minWidth: 200 }}>
          <TextInput
            id="neg-term"
            label="Add negative"
            value={negTerm}
            onChange={(v) => setNegTerm(v)}
            placeholder="Enter term to negate"
          />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Selector
            id="neg-type"
            label="Type"
            value={negType}
            onChange={(v) => setNegType(v as 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category')}
            options={['Negative exact', 'Negative phrase', 'Negative ASIN', 'Negative category'].map((x) => ({ value: x, label: x }))}
          />
        </div>
        <Button label="Add" variant="primary" onClick={() => {
          if (negTerm.trim()) {
            addNegative(c.id, negTerm.trim(), negType);
            setNegTerm('');
          }
        }} />
      </div>
      {c.negatives.length > 0 ? (
        <Table>
            <thead><tr><th>Negative</th><th>Type</th></tr></thead>
            <tbody>
              {c.negatives.map((n, i) => (
                <tr key={n.id || i}>
                  <td><strong>{n.value}</strong></td><td>{n.type}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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
