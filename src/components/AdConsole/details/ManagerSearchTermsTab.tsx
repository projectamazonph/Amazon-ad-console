'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Props {
  campaigns: Campaign[];
}

export function ManagerSearchTermsTab({ campaigns }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const harvestTerm = useAdConsoleStore((s) => s.harvestTerm);

  const allSearchTerms = campaigns.flatMap((c) =>
    c.searchTerms.map((st) => ({
      ...st,
      campaignName: c.name,
      campaignId: c.id,
      metrics: st,
    })),
  );

  if (!allSearchTerms.length) {
    return (
      <EmptyState
        icon="search"
        title="No search terms"
        message="Run a simulation to generate search terms."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Search term</th>
            <th>Impr.</th>
            <th>Clicks</th>
            <th>Spend</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>ACOS</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allSearchTerms.map((st) => {
            const x = calc(st.metrics);
            return (
              <tr key={st.id}>
                <td style={{ maxWidth: 180 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    label={st.campaignName}
                    onClick={() => {
                      /* navigation handled by store */
                    }}
                    style={{ maxWidth: 160 }}
                  />
                </td>
                <td style={{ maxWidth: 240 }}>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                  >
                    {st.term}
                  </Text>
                </td>
                <td className="mono">{formatWhole(st.metrics.impressions)}</td>
                <td className="mono">{formatWhole(st.metrics.clicks)}</td>
                <td className="money">{formatMoney(st.metrics.spend)}</td>
                <td className="money">{formatMoney(st.metrics.sales)}</td>
                <td className="mono">{formatWhole(st.metrics.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>
                  {st.metrics.sales ? formatPercent(x.acos) : '-'}
                </td>
                <td>
                  <HStack gap={1} wrap="wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      label="Harvest"
                      onClick={() => harvestTerm(st.campaignId, st.term)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      label="Negate"
                      onClick={() => addNegative(st.campaignId, st.term, 'Negative exact')}
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
