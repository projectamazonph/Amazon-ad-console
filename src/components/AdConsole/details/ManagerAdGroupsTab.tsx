'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { EmptyState } from './EmptyState';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';

interface Props {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
}

export function ManagerAdGroupsTab({ campaigns, onSelectCampaign }: Props) {
  const rows = campaigns.flatMap((c) => c.adGroups.map((ag) => ({ c, ag })));
  if (!rows.length) {
    return <EmptyState icon="group" title="No ad groups" message="Ad groups are created automatically when a campaign is launched. Create a campaign to see ad groups." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ad group</th><th>Campaign</th><th>Type</th><th>Status</th>
            <th>Default bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Targets</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, ag }) => {
            const m = ag.metrics || { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
            const x = calc(m);
            return (
              <tr key={ag.id}>
                <td><button className="row-link" onClick={() => onSelectCampaign(c.id)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600, textAlign: 'left', padding: 0 }}>{ag.name}</button></td>
                <td><button className="row-link" onClick={() => onSelectCampaign(c.id)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer' }}>{c.name}</button></td>
                <td><span className={`pill ${c.type === 'SP' ? 'active' : c.type === 'SB' ? 'orange' : 'purple'}`}>{c.type}</span></td>
                <td><span className={`pill ${ag.status === 'Enabled' ? 'green' : 'orange'}`}>{ag.status}</span></td>
                <td className="money">{ag.defaultBid.toFixed(2)}</td>
                <td className="mono">{formatWhole(m.impressions)}</td>
                <td className="mono">{formatWhole(m.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(m.spend)}</td>
                <td className="money">{formatMoney(m.sales)}</td>
                <td className="mono">{formatWhole(m.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{x.acos ? formatPercent(x.acos) : '-'}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
                <td>{c.targets.filter((t) => t.adGroupId === ag.id).length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
