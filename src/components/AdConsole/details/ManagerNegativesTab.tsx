'use client';

import { Table } from '@astryxdesign/core/Table';
import type { Campaign } from '@/engine/ad-console/types';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
}

export function ManagerNegativesTab({ campaigns }: Props) {
  const rows = campaigns.flatMap((c) => c.negatives.map((n) => ({ c, n })));
  if (!rows.length) {
    return <EmptyState icon="block" title="No negatives" message="Negative keywords prevent your ads from showing for irrelevant searches. Add negatives from the Search terms tab or Campaign detail view." />;
  }

  return (
    <Table>
        <thead><tr><th>Negative</th><th>Campaign</th><th>Type</th></tr></thead>
        <tbody>
          {rows.map(({ c, n }, i) => (
            <tr key={n.id || i}>
              <td><strong>{n.value}</strong></td><td>{c.name}</td><td>{n.type}</td>
            </tr>
          ))}
        </tbody>
      </Table>
  );
}
