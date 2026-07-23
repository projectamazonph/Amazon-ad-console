'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaigns: Campaign[];
  onSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onCreate: () => void;
}

export function ManagerCampaignsTab({
  campaigns,
  onSelect,
  onToggleStatus,
  onDuplicate,
  onArchive,
  onCreate,
}: Props) {
  if (!campaigns.length) {
    return (
      <EmptyState
        icon="chart"
        title="No campaigns yet"
        message="Create your first campaign to start training."
      >
        <Button variant="primary" label="Create campaign" onClick={onCreate} />
      </EmptyState>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Type</th>
            <th>Creative</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Targeting</th>
            <th>Impr.</th>
            <th>Clicks</th>
            <th>CPC</th>
            <th>Spend</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>ACOS</th>
            <th>ROAS</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const x = calc(c.metrics);
            return (
              <tr key={c.id}>
                <td style={{ maxWidth: 220 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    label={c.name}
                    onClick={() => onSelect(c.id)}
                    style={{
                      fontWeight: 500,
                      textAlign: 'left',
                      maxWidth: 200,
                    }}
                  />
                  <Text type="supporting" size="sm" maxLines={1} hasTruncateTooltip>
                    {c.portfolio}
                  </Text>
                </td>
                <td>
                  <Badge
                    variant={c.type === 'SP' ? 'blue' : c.type === 'SB' ? 'orange' : 'purple'}
                    label={c.type}
                  />
                </td>
                <td>
                  {(c.type === 'SB' || c.type === 'SD') && c.creativeStatus ? (
                    <Badge
                      variant={
                        c.creativeStatus === 'Approved'
                          ? 'success'
                          : c.creativeStatus === 'Pending'
                            ? 'info'
                            : 'error'
                      }
                      label={c.creativeStatus}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <Badge
                    variant={
                      c.status === 'Enabled'
                        ? 'success'
                        : c.status === 'Paused'
                          ? 'warning'
                          : 'error'
                    }
                    label={c.status}
                  />
                </td>
                <td className="money">{formatMoney(c.dailyBudget)}</td>
                <td>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {c.targetingMode}
                  </Text>
                </td>
                <td className="mono">{formatWhole(c.metrics.impressions)}</td>
                <td className="mono">{formatWhole(c.metrics.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(c.metrics.spend)}</td>
                <td className="money">{formatMoney(c.metrics.sales)}</td>
                <td className="mono">{formatWhole(c.metrics.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{formatPercent(x.acos)}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
                <td>
                  <HStack gap={1} wrap>
                    <Button
                      variant="secondary"
                      size="sm"
                      label="Open"
                      onClick={() => onSelect(c.id)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      label={c.status === 'Enabled' ? 'Pause' : 'Enable'}
                      onClick={() => onToggleStatus(c.id)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      label="Dup"
                      onClick={() => onDuplicate(c.id)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      label="Archive"
                      onClick={() => {
                        if (confirm(`Archive "${c.name}"?`)) onArchive(c.id);
                      }}
                    />
                  </HStack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
