'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaign: Campaign;
}

const BID_STRATEGIES = [
  'Dynamic bids - down only',
  'Dynamic bids - up and down',
  'Fixed bids',
  'Cost per click',
  'Cost per thousand impressions',
];

const STATUS_OPTIONS = ['Enabled', 'Paused', 'Archived'];

export function OverviewTab({ campaign: c }: Props) {
  const toggleStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const removeCampaignProduct = useAdConsoleStore((s) => s.removeCampaignProduct);
  const [budgetInput, setBudgetInput] = useState(String(c.dailyBudget));
  const [defaultBidInput, setDefaultBidInput] = useState(String(c.defaultBid));

  return (
    <div className="split">
      <Card padding={5} variant="default">
        <Stack gap={4}>
          <div className="section-head">
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip>
              Campaign settings
            </Text>
            <Text type="supporting" size="sm" maxLines={1}>
              Editable training controls
            </Text>
          </div>
          <HStack gap={3} wrap>
            <div className="field" style={{ minWidth: 0 }}>
              <label htmlFor="ot-budget">Daily budget</label>
              <input
                id="ot-budget"
                className="input full"
                type="number"
                min={1}
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                style={{
                  borderColor: budgetInput && Number(budgetInput) < 1 ? 'var(--danger)' : undefined,
                }}
              />
            </div>
            <div className="field" style={{ minWidth: 0 }}>
              <label htmlFor="ot-bid">Default bid</label>
              <input
                id="ot-bid"
                className="input full"
                type="number"
                min={0.02}
                step={0.01}
                value={defaultBidInput}
                onChange={(e) => setDefaultBidInput(e.target.value)}
                style={{
                  borderColor: defaultBidInput && Number(defaultBidInput) < 0.02 ? 'var(--danger)' : undefined,
                }}
              />
            </div>
            <div className="field" style={{ minWidth: 0 }}>
              <label htmlFor="ot-strategy">Bid strategy</label>
              <select
                id="ot-strategy"
                className="select full"
                value={c.bidStrategy}
                onChange={(e) =>
                  useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                    bidStrategy: e.target.value as any,
                  })
                }
              >
                {BID_STRATEGIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 0 }}>
              <label htmlFor="ot-status">Status</label>
              <select
                id="ot-status"
                className="select full"
                value={c.status}
                onChange={() => toggleStatus(c.id)}
              >
                {STATUS_OPTIONS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          </HStack>
          <div>
            <Button
              variant="primary"
              size="md"
              label="Save settings"
              onClick={() => {
                useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                  dailyBudget: Number(budgetInput),
                  defaultBid: Number(defaultBidInput),
                });
              }}
            />
          </div>
        </Stack>
      </Card>

      <Card padding={5} variant="default">
        <Stack gap={3}>
          <div className="section-head">
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip>
              Products
            </Text>
            <Badge label={c.type} variant="neutral" />
          </div>
          <Stack gap={2}>
            {c.products.map((asin) => {
              const p = PRODUCTS.find((x) => x.asin === asin);
              const fullLabel = p ? `${p.image} ${p.title} (${p.asin})` : asin;
              return (
                <HStack key={asin} gap={2} vAlign="center" style={{ minWidth: 0 }}>
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Text
                      type="body"
                      maxLines={1}
                      hasTruncateTooltip
                      title={fullLabel}
                    >
                      {fullLabel}
                    </Text>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    label="×"
                    onClick={() => removeCampaignProduct(c.id, asin)}
                    width="32px"
                  />
                </HStack>
              );
            })}
          </Stack>
          {c.creative && (
            <Stack gap={2} style={{ marginTop: 8 }}>
              {c.creative.brandName && (
                <div className="review-row">
                  <Text type="supporting" size="sm">Brand</Text>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                    title={c.creative.brandName}
                  >
                    {c.creative.brandName || 'N/A'}
                  </Text>
                </div>
              )}
              {c.creative.headline && (
                <div className="review-row">
                  <Text type="supporting" size="sm">Headline</Text>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={2}
                    hasTruncateTooltip
                    title={c.creative.headline}
                  >
                    {c.creative.headline || 'N/A'}
                  </Text>
                </div>
              )}
              {c.creativeStatus === 'Rejected' && (
                <Card padding={3} variant="red">
                  <HStack gap={2} vAlign="center" style={{ minWidth: 0 }}>
                    <Text
                      type="body"
                      maxLines={3}
                      hasTruncateTooltip
                      title={`Creative rejected: ${c.creativeIssue}`}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      Creative rejected: {c.creativeIssue}
                    </Text>
                    <Button
                      variant="primary"
                      size="sm"
                      label="Resubmit"
                      onClick={() =>
                        useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                          creativeStatus: 'Pending',
                          creativeIssue: '',
                        } as any)
                      }
                    />
                  </HStack>
                </Card>
              )}
              {((c.type === 'SB' || c.type === 'SD') &&
                ((c.type === 'SB' && c.adFormat === 'Video') ||
                  (c.type === 'SD' && c.adFormat === 'Video creative'))) &&
                c.creative?.video && (
                  <Card padding={3} variant="default">
                    <HStack gap={2} vAlign="center" style={{ minWidth: 0 }}>
                      <Text type="body">▶</Text>
                      <Text
                        type="body"
                        weight="medium"
                        maxLines={1}
                        hasTruncateTooltip
                        title={c.creative.video}
                        style={{ minWidth: 0, flex: 1 }}
                      >
                        Video: {c.creative.video}
                      </Text>
                    </HStack>
                  </Card>
                )}
              {c.creative?.logo && (
                <div className="review-row">
                  <Text type="supporting" size="sm">Logo</Text>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                    title={c.creative.logo}
                  >
                    {c.creative.logo}
                  </Text>
                </div>
              )}
              {c.creative?.destination && (
                <div className="review-row">
                  <Text type="supporting" size="sm">Destination</Text>
                  <Text
                    type="body"
                    weight="medium"
                    maxLines={1}
                    hasTruncateTooltip
                    title={c.creative.destination}
                  >
                    {c.creative.destination}
                  </Text>
                </div>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      <Card padding={5} variant="default" style={{ gridColumn: '1 / -1' }}>
        <Stack gap={4}>
          <div className="section-head">
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip>
              Top targets by profit signal
            </Text>
            <Text type="supporting" size="sm" maxLines={1}>
              Use to train bid optimization
            </Text>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Bid</th>
                  <th>Impr.</th>
                  <th>Clicks</th>
                  <th>CPC</th>
                  <th>Spend</th>
                  <th>Sales</th>
                  <th>Orders</th>
                  <th>ACOS</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {c.targets.slice(0, 4).map((t) => {
                  const tx = calc(t);
                  return (
                    <tr key={t.id}>
                      <td style={{ maxWidth: 220 }}>
                        <Text
                          type="body"
                          weight="medium"
                          maxLines={1}
                          hasTruncateTooltip
                          title={t.value}
                        >
                          {t.value}
                        </Text>
                      </td>
                      <td className="money">{formatBid(t.bid)}</td>
                      <td className="mono">{formatWhole(t.impressions)}</td>
                      <td className="mono">{formatWhole(t.clicks)}</td>
                      <td className="money">{formatBid(tx.cpc)}</td>
                      <td className="money">{formatMoney(t.spend)}</td>
                      <td className="money">{formatMoney(t.sales)}</td>
                      <td className="mono">{formatWhole(t.orders)}</td>
                      <td className={`mono ${acosClass(tx.acos)}`}>
                        {t.sales ? formatPercent(tx.acos) : '-'}
                      </td>
                      <td className="mono">{formatRoas(tx.roas)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
