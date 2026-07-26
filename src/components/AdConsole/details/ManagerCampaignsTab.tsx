'use client';

import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/core/engine';
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
        <Button label="Create campaign" variant="primary" onClick={onCreate} />
      </EmptyState>
    );
  }

  return (
    <Table>
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
                  <Button label="Open" size="sm" onClick={() => onSelect(c.id)} />{' '}
                  <Button label={c.status === 'Enabled' ? 'Pause' : 'Enable'} size="sm" onClick={() => onToggleStatus(c.id)} />{' '}
                  <Button label="Dup" size="sm" onClick={() => onDuplicate(c.id)} />{' '}
                  <Button label="Archive" variant="destructive" size="sm" onClick={() => {
                    if (confirm(`Archive "${c.name}"?`)) onArchive(c.id);
                  }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
  );
}
