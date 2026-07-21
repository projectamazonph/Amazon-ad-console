'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
  onSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onCreate: () => void;
}

export function ManagerCampaignsTab({ campaigns, onSelect, onToggleStatus, onDuplicate, onArchive, onCreate }: Props) {
  if (!campaigns.length) {
    return (
      <EmptyState icon="chart" title="No campaigns yet" message="Create your first campaign to start training.">
        <button className="btn primary" onClick={onCreate}>Create campaign</button>
      </EmptyState>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th><th>Type</th><th>Creative</th><th>Status</th><th>Budget</th><th>Targeting</th>
            <th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const x = calc(c.metrics);
            return (
              <tr key={c.id}>
                <td>
                  <button className="row-link" onClick={() => onSelect(c.id)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                    {c.name}
                  </button>
                  <div className="muted">{c.portfolio}</div>
                </td>
                <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                <td>{(c.type === 'SB' || c.type === 'SD') && c.creativeStatus ? (
                  <span className={`pill ${c.creativeStatus === 'Approved' ? 'green' : c.creativeStatus === 'Pending' ? '' : 'bad'}`}>{c.creativeStatus}</span>
                ) : 'N/A'}</td>
                <td><span className={`pill ${c.status === 'Enabled' ? 'green' : c.status === 'Paused' ? 'orange' : 'bad'}`}>{c.status}</span></td>
                <td className="money">{formatMoney(c.dailyBudget)}</td>
                <td><span className="muted">{c.targetingMode}</span></td>
                <td className="mono">{formatWhole(c.metrics.impressions)}</td>
                <td className="mono">{formatWhole(c.metrics.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(c.metrics.spend)}</td>
                <td className="money">{formatMoney(c.metrics.sales)}</td>
                <td className="mono">{formatWhole(c.metrics.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{formatPercent(x.acos)}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
                <td>
                  <button className="btn small" onClick={() => onSelect(c.id)}>Open</button>{' '}
                  <button className="btn small" onClick={() => onToggleStatus(c.id)}>
                    {c.status === 'Enabled' ? 'Pause' : 'Enable'}
                  </button>{' '}
                  <button className="btn small" onClick={() => onDuplicate(c.id)}>Dup</button>{' '}
                  <button className="btn small danger" onClick={() => {
                    if (confirm(`Archive "${c.name}"?`)) onArchive(c.id);
                  }}>Archive</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
