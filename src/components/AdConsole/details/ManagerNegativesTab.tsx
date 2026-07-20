'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
}

export function ManagerNegativesTab({ campaigns }: Props) {
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const toggleNegative = useAdConsoleStore((s) => s.toggleNegative);
  const removeNegative = useAdConsoleStore((s) => s.removeNegative);

  const open = (campaignId: string) => { selectCampaign(campaignId); setTab('negatives'); };

  const rows = campaigns.flatMap((c) => c.negatives.map((n) => ({ c, n })));
  if (!rows.length) {
    return <EmptyState icon="block" title="No negatives" message="Negative keywords prevent your ads from showing for irrelevant searches. Add negatives from the Search terms tab or Campaign detail view." />;
  }

  const linkStyle = { border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', textAlign: 'left' as const, padding: 0 };

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Negative</th><th>Campaign</th><th>Type</th><th>Level</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(({ c, n }, i) => {
            const status = n.status ?? 'Enabled';
            const enabled = status === 'Enabled';
            return (
              <tr key={n.id || i}>
                <td><button className="row-link" style={{ ...linkStyle, fontWeight: 600 }} onClick={() => open(c.id)}>{n.value}</button></td>
                <td><button className="row-link" style={linkStyle} onClick={() => open(c.id)}>{c.name}</button></td>
                <td>{n.type}</td>
                <td><span className="muted">{n.adGroupId ? 'Ad group' : 'Campaign'}</span></td>
                <td><span className={`pill ${enabled ? 'green' : 'orange'}`}>{status}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className={`btn small ${enabled ? '' : 'primary'}`} onClick={() => toggleNegative(c.id, n.id)}>
                    {enabled ? 'Disable' : 'Enable'}
                  </button>{' '}
                  <button className="btn small danger" onClick={() => { if (confirm(`Remove negative "${n.value}"?`)) removeNegative(c.id, n.id); }}>Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
