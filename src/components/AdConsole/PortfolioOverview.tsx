'use client';

import { useState, useMemo } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { MetricCard } from './metrics/MetricCard';

export function PortfolioOverview() {
  const state = useAdConsoleStore((s) => s.state);
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const createPortfolio = useAdConsoleStore((s) => s.createPortfolio);
  const renamePortfolio = useAdConsoleStore((s) => s.renamePortfolio);
  const deletePortfolio = useAdConsoleStore((s) => s.deletePortfolio);
  const assignCampaignToPortfolio = useAdConsoleStore((s) => s.assignCampaignToPortfolio);

  const [manageMode, setManageMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

  const portfolios = useMemo(() => {
    const map = new Map<string, typeof state.campaigns>();
    state.campaigns.forEach((c) => {
      const p = c.portfolio || '(No portfolio)';
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(c);
    });
    return Array.from(map.entries()).map(([name, camps]) => ({
      name,
      campaigns: camps,
      metrics: camps.reduce(
        (acc, c) => {
          acc.impressions += c.metrics.impressions;
          acc.clicks += c.metrics.clicks;
          acc.spend += c.metrics.spend;
          acc.sales += c.metrics.sales;
          acc.orders += c.metrics.orders;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ),
    }));
  }, [state.campaigns]);

  const totalMetrics = useMemo(
    () =>
      state.campaigns.reduce(
        (acc, c) => {
          acc.impressions += c.metrics.impressions;
          acc.clicks += c.metrics.clicks;
          acc.spend += c.metrics.spend;
          acc.sales += c.metrics.sales;
          acc.orders += c.metrics.orders;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
      ),
    [state.campaigns],
  );

  const totalDerived = calc(totalMetrics);
  const totalAcosTone =
    totalDerived.acos <= 0 ? '' : totalDerived.acos <= 30 ? 'good' : 'bad';

  return (
    <div>
      <div className="page-title">
        <div style={{ minWidth: 0 }}>
          <Text
            type="display-3"
            size="lg"
            weight="semibold"
            maxLines={1}
            hasTruncateTooltip
            as="h1"
          >
            Portfolios
          </Text>
          <Text type="body" color="secondary" maxLines={2} hasTruncateTooltip>
            Group campaigns into portfolios and manage portfolio structure.
          </Text>
        </div>
        <Button
          variant={manageMode ? 'primary' : 'secondary'}
          label={manageMode ? 'Done managing' : 'Manage portfolios'}
          onClick={() => setManageMode((m) => !m)}
        />
      </div>

      {manageMode && (
        <Card padding={6} variant="default" style={{ marginBottom: 14 }}>
          <Stack gap={3}>
            <HStack justify="between" vAlign="center">
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h2"
              >
                Create portfolio
              </Text>
              <Text type="supporting" size="sm" maxLines={1}>
                New portfolio group
              </Text>
            </HStack>
            <HStack gap={2} vAlign="end" wrap="wrap">
              <div className="field" style={{ flex: 1, minWidth: 0 }}>
                <label htmlFor="po-new-name">Portfolio name</label>
                <input
                  id="po-new-name"
                  className="input full"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Holiday Campaigns"
                />
              </div>
              <Button
                variant="primary"
                label="Create"
                onClick={() => {
                  if (newName.trim()) {
                    createPortfolio(newName.trim());
                    setNewName('');
                  }
                }}
              />
            </HStack>
          </Stack>
        </Card>
      )}

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <MetricCard label="Total portfolios" value={String(portfolios.length)} />
        <MetricCard label="Total spend (all)" value={formatMoney(totalMetrics.spend)} />
        <MetricCard
          label="Total sales (all)"
          value={formatMoney(totalMetrics.sales)}
          delta={`${formatWhole(totalMetrics.orders)} orders`}
          tone={totalMetrics.sales > 0 ? 'good' : ''}
        />
        <MetricCard
          label="Blended ACOS"
          value={formatPercent(totalDerived.acos)}
          delta={`ROAS ${formatRoas(totalDerived.roas)}`}
          tone={totalAcosTone}
        />
      </div>

      {portfolios.length === 0 ? (
        <Card padding={6} variant="muted">
          <Stack gap={2} align="center">
            <Text type="large" weight="medium" maxLines={1} hasTruncateTooltip>
              No portfolios
            </Text>
            <Text type="body" color="secondary" maxLines={3} hasTruncateTooltip>
              Create a campaign with a portfolio name or use the Manage button above.
            </Text>
          </Stack>
        </Card>
      ) : (
        portfolios.map((pf) => {
          const x = calc(pf.metrics);
          return (
            <Card key={pf.name} padding={6} variant="default" style={{ marginBottom: 14 }}>
              <Stack gap={3}>
                <div className="card-title">
                  {manageMode ? (
                    <Stack gap={2} vAlign="center">
                      <label
                        htmlFor={`po-rename-${pf.name}`}
                        className="visually-hidden"
                      >
                        Portfolio name
                      </label>
                      <input
                        id={`po-rename-${pf.name}`}
                        className="input"
                        type="text"
                        style={{ fontWeight: 600, flex: 1, minWidth: 0 }}
                        value={renameMap[pf.name] ?? pf.name}
                        onChange={(e) =>
                          setRenameMap((m) => ({ ...m, [pf.name]: e.target.value }))
                        }
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== pf.name) renamePortfolio(pf.name, v);
                        }}
                      />
                      <Text
                        type="supporting"
                        size="sm"
                        maxLines={1}
                        hasTruncateTooltip
                      >
                        {pf.campaigns.length} campaign
                        {pf.campaigns.length !== 1 ? 's' : ''}
                      </Text>
                      <Button
                        variant="destructive"
                        size="sm"
                        label="Delete"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove portfolio "${pf.name}"? Campaigns will be unassigned.`,
                            )
                          ) {
                            deletePortfolio(pf.name);
                          }
                        }}
                      />
                    </Stack>
                  ) : (
                    <HStack justify="between" vAlign="center">
                      <Text
                        type="large"
                        weight="semibold"
                        maxLines={1}
                        hasTruncateTooltip
                        as="h2"
                      >
                        {pf.name}
                      </Text>
                      <Text
                        type="supporting"
                        size="sm"
                        maxLines={1}
                        hasTruncateTooltip
                      >
                        {pf.campaigns.length} campaign
                        {pf.campaigns.length !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  )}
                </div>
                <div className="grid-4" style={{ marginBottom: 12 }}>
                  <div>
                    <Text type="supporting" color="secondary" size="sm">
                      Spend
                    </Text>
                    <Text type="body" weight="medium" maxLines={1}>
                      {formatMoney(pf.metrics.spend)}
                    </Text>
                  </div>
                  <div>
                    <Text type="supporting" color="secondary" size="sm">
                      Sales
                    </Text>
                    <Text type="body" weight="medium" maxLines={1}>
                      {formatMoney(pf.metrics.sales)}
                    </Text>
                  </div>
                  <div>
                    <Text
                      type="body"
                      weight="medium"
                      color={acosClass(x.acos) === 'bad' ? 'secondary' : 'inherit'}
                      maxLines={1}
                      hasTruncateTooltip
                    >
                      {formatPercent(x.acos)}
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      ACOS
                    </Text>
                  </div>
                  <div>
                    <Text type="body" weight="medium" maxLines={1}>
                      {formatRoas(x.roas)}
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      ROAS
                    </Text>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Spend</th>
                        <th>Sales</th>
                        <th>ACOS</th>
                        {manageMode && <th>Assign to</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pf.campaigns.map((c) => {
                        const cx = calc(c.metrics);
                        return (
                          <tr key={c.id}>
                            <td style={{ maxWidth: 220 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                label={c.name}
                                onClick={() => selectCampaign(c.id)}
                                style={{ maxWidth: 200, textAlign: 'left' }}
                              />
                            </td>
                            <td>
                              <Badge
                                variant={
                                  c.type === 'SP'
                                    ? 'blue'
                                    : c.type === 'SB'
                                      ? 'orange'
                                      : 'purple'
                                }
                                label={c.type}
                              />
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
                            <td className="money">{formatMoney(c.metrics.spend)}</td>
                            <td className="money">{formatMoney(c.metrics.sales)}</td>
                            <td className={`mono ${acosClass(cx.acos)}`}>
                              {formatPercent(cx.acos)}
                            </td>
                            {manageMode && (
                              <td>
                                <select
                                  className="select"
                                  value={assignMap[c.id] ?? c.portfolio}
                                  onChange={(e) => {
                                    assignCampaignToPortfolio(c.id, e.target.value);
                                    setAssignMap((m) => ({
                                      ...m,
                                      [c.id]: e.target.value,
                                    }));
                                  }}
                                >
                                  {state.portfolios.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Stack>
            </Card>
          );
        })
      )}
    </div>
  );
}
