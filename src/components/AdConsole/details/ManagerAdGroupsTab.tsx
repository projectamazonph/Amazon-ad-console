'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { EmptyState } from './EmptyState';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
}

export function ManagerAdGroupsTab({ campaigns, onSelectCampaign }: Props) {
  const rows = campaigns.flatMap((c) => c.adGroups.map((ag) => ({ c, ag })));
  if (!rows.length) {
    return (
      <EmptyState
        icon="group"
        title="No ad groups"
        message="Ad groups are created automatically when a campaign is launched. Create a campaign to see ad groups."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ad group</th>
            <th>Campaign</th>
            <th>Type</th>
            <th>Status</th>
            <th>Default bid</th>
            <th>Impr.</th>
            <th>Clicks</th>
            <th>CPC</th>
            <th>Spend</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>ACOS</th>
            <th>ROAS</th>
            <th>Targets</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, ag }) => {
            const m = ag.metrics || {
              impressions: 0,
              clicks: 0,
              spend: 0,
              sales: 0,
              orders: 0,
            };
            const x = calc(m);
            return (
              <tr key={ag.id}>
                <td style={{ maxWidth: 200 }}>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                    title={ag.name}
                  >
                    {ag.name}
                  </Text>
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    label={c.name}
                    onClick={() => onSelectCampaign(c.id)}
                    style={{ maxWidth: 200 }}
                  />
                </td>
                <td>
                  <Badge
                    variant={c.type === 'SP' ? 'blue' : c.type === 'SB' ? 'orange' : 'purple'}
                    label={c.type}
                  />
                </td>
                <td>
                  <Badge
                    variant={ag.status === 'Enabled' ? 'success' : 'warning'}
                    label={ag.status}
                  />
                </td>
                <td className="money">{ag.defaultBid.toFixed(2)}</td>
                <td className="mono">{formatWhole(m.impressions)}</td>
                <td className="mono">{formatWhole(m.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(m.spend)}</td>
                <td className="money">{formatMoney(m.sales)}</td>
                <td className="mono">{formatWhole(m.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>
                  {x.acos ? formatPercent(x.acos) : '-'}
                </td>
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
