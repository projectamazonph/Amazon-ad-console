'use client';

import { Table } from '@astryxdesign/core/Table';
import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/core/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
}

export function ManagerTargetsTab({ campaigns }: Props) {
  const rows = campaigns.flatMap((c) => c.targets.map((t) => ({ c, t })));
  if (!rows.length) {
    return <EmptyState icon="target" title="No targets" message="Targets are created when you add keywords, products, or audiences to your campaigns." />;
  }

  return (
    <Table>
        <thead>
          <tr>
            <th>Target</th><th>Campaign</th><th>Type</th><th>Match</th><th>Status</th>
            <th>Bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, t }) => {
            const x = calc(t);
            return (
              <tr key={t.id}>
                <td><strong>{t.value}</strong></td>
                <td>{c.name}</td>
                <td>{t.type}</td><td>{t.match}</td>
                <td><span className={`pill ${t.status === 'Enabled' ? 'green' : 'orange'}`}>{t.status}</span></td>
                <td className="money">{t.bid.toFixed(2)}</td>
                <td className="mono">{formatWhole(t.impressions)}</td>
                <td className="mono">{formatWhole(t.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(t.spend)}</td>
                <td className="money">{formatMoney(t.sales)}</td>
                <td className="mono">{formatWhole(t.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{t.sales ? formatPercent(x.acos) : 'No sales'}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
  );
}
