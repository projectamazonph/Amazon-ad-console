'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Stack, HStack } from '@astryxdesign/core/Stack';

interface Props {
  campaign: Campaign;
}

const NEG_TYPES = [
  { value: 'Negative exact', label: 'Negative exact' },
  { value: 'Negative phrase', label: 'Negative phrase' },
  { value: 'Negative ASIN', label: 'Negative ASIN' },
  { value: 'Negative category', label: 'Negative category' },
];

export function NegativesTab({ campaign }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const [negTerm, setNegTerm] = useState('');
  const [negType, setNegType] = useState<
    'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category'
  >('Negative exact');
  const c = campaign;

  return (
    <div>
      <Stack gap={3} style={{ marginBottom: 16 }}>
        <HStack gap={2} wrap>
          <div style={{ flex: 2, minWidth: 200 }}>
            <TextInput
              label="Add negative"
              value={negTerm}
              onChange={(v) => setNegTerm(v)}
              description="Enter term to negate"
              width="100%"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}>
            <label htmlFor="neg-type">Type</label>
            <select
              id="neg-type"
              className="select full"
              value={negType}
              onChange={(e) =>
                setNegType(
                  e.target.value as 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category',
                )
              }
            >
              {NEG_TYPES.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="primary"
            label="Add"
            onClick={() => {
              if (negTerm.trim()) {
                addNegative(c.id, negTerm.trim(), negType);
                setNegTerm('');
              }
            }}
          />
        </HStack>
      </Stack>
      {c.negatives.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Negative</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {c.negatives.map((n, i) => (
                <tr key={n.id || i}>
                  <td>
                    <strong>{n.value}</strong>
                  </td>
                  <td>{n.type}</td>
                </tr>
              ))}
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
