'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaigns: Campaign[];
}

export function ManagerTargetsTab({ campaigns }: Props) {
  const allTargets = campaigns.flatMap((c) =>
    c.targets.map((t) => ({ ...t, metrics: t, campaignName: c.name })),
  );

  if (!allTargets.length) {
    return (
      <EmptyState
        icon="target"
        title="No targets"
        message="Add keywords or product targets to campaigns."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Target</th>
            <th>Type</th>
            <th>Match</th>
            <th>Status</th>
            <th>Bid</th>
            <th>Impr.</th>
            <th>Clicks</th>
            <th>Spend</th>
            <th>Sales</th>
            <th>ACOS</th>
          </tr>
        </thead>
        <tbody>
          {allTargets.map((t) => {
            const x = calc(t.metrics);
            return (
              <tr key={t.id}>
                <td style={{ maxWidth: 200 }}>
                  <Text
                    type="body"
                    maxLines={1}
                    hasTruncateTooltip
                  >
                    {t.campaignName}
                  </Text>
                </td>
                <td style={{ maxWidth: 220 }}>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                  >
                    {t.value}
                  </Text>
                </td>
                <td>{t.type}</td>
                <td>{t.match}</td>
                <td>
                  <Badge
                    variant={t.status === 'Enabled' ? 'success' : 'warning'}
                    label={t.status}
                  />
                </td>
                <td className="money">${t.bid.toFixed(2)}</td>
                <td className="mono">{formatWhole(t.metrics.impressions)}</td>
                <td className="mono">{formatWhole(t.metrics.clicks)}</td>
                <td className="money">{formatMoney(t.metrics.spend)}</td>
                <td className="money">{formatMoney(t.metrics.sales)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>
                  {t.metrics.sales ? formatPercent(x.acos) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
