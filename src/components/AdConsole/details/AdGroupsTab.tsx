'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaign: Campaign;
}

export function AdGroupsTab({ campaign: c }: Props) {
  const addAdGroup = useAdConsoleStore((s) => s.addAdGroup);
  const renameAdGroup = useAdConsoleStore((s) => s.renameAdGroup);
  const setAdGroupStatus = useAdConsoleStore((s) => s.setAdGroupStatus);
  const setAdGroupDefaultBid = useAdConsoleStore((s) => s.setAdGroupDefaultBid);
  const removeAdGroup = useAdConsoleStore((s) => s.removeAdGroup);

  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string | null>(null);
  const [adGroupNameEdits, setAdGroupNameEdits] = useState<Record<string, string>>({});
  const [adGroupBidEdits, setAdGroupBidEdits] = useState<Record<string, string>>({});
  const [newAdGroupName, setNewAdGroupName] = useState('');

  if (!c.adGroups.length) {
    return (
      <EmptyState
        icon="group"
        title="No ad groups"
        message="This campaign has no ad groups. Add one to organize your targets."
      />
    );
  }

  const focused = selectedAdGroupId ? c.adGroups.find((ag) => ag.id === selectedAdGroupId) : null;

  if (focused) {
    const agTargets = c.targets.filter((t) => t.adGroupId === focused.id);
    return (
      <div>
        <Button
          variant="secondary"
          size="sm"
          label="← All ad groups"
          onClick={() => setSelectedAdGroupId(null)}
          style={{ marginBottom: 10 }}
        />
        <Card padding={5} style={{ marginBottom: 12 }}>
          <Stack gap={3}>
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip>
              {focused.name}
            </Text>
            <Text type="supporting" size="sm" maxLines={1}>
              {agTargets.length} targets
            </Text>
            <HStack gap={3} wrap="wrap">
              <div className="field" style={{ minWidth: 0 }}>
                <label htmlFor={`ag-status-${focused.id}`}>Status</label>
                <select
                  id={`ag-status-${focused.id}`}
                  className="select full"
                  value={focused.status}
                  onChange={(e) =>
                    setAdGroupStatus(c.id, focused.id, e.target.value as any)
                  }
                  style={{ width: 180 }}
                >
                  {['Enabled', 'Paused', 'Archived'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ minWidth: 0 }}>
                <label htmlFor={`ag-bid-${focused.id}`}>Default bid</label>
                <input
                  id={`ag-bid-${focused.id}`}
                  className="input full"
                  type="number"
                  min={0.02}
                  step={0.01}
                  value={adGroupBidEdits[focused.id] ?? String(focused.defaultBid)}
                  onChange={(e) =>
                    setAdGroupBidEdits((p) => ({ ...p, [focused.id]: e.target.value }))
                  }
                  style={{ width: 120 }}
                />
              </div>
            </HStack>
            <Button
              variant="primary"
              size="sm"
              label="Save default bid"
              onClick={() =>
                setAdGroupDefaultBid(
                  c.id,
                  focused.id,
                  Number(adGroupBidEdits[focused.id] ?? focused.defaultBid),
                )
              }
            />
          </Stack>
        </Card>
        {!agTargets.length ? (
          <EmptyState
            icon="target"
            title={`No targets in "${focused.name}" yet`}
            message="Add keywords or product targets to this ad group from the Targeting tab."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
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
                {agTargets.map((t) => {
                  const x = calc(t.metrics);
                  return (
                    <tr key={t.id}>
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
                      <td>
                        <Badge
                          label={t.match === 'Negative' ? 'Neg' : t.type}
                          variant="neutral"
                        />
                      </td>
                      <td>
                        <Text type="supporting" color="secondary" maxLines={1}>
                          {t.match}
                        </Text>
                      </td>
                      <td>
                        <Badge
                          label={t.status}
                          variant={t.status === 'Enabled' ? 'success' : 'warning'}
                        />
                      </td>
                      <td className="money">{formatBid(t.bid)}</td>
                      <td className="mono">{formatWhole(t.metrics.impressions)}</td>
                      <td className="mono">{formatWhole(t.metrics.clicks)}</td>
                      <td className="money">{formatMoney(t.metrics.spend)}</td>
                      <td className="money">{formatMoney(t.metrics.sales)}</td>
                      <td className={`mono ${acosClass(x.acos)}`}>
                        {x.acos ? formatPercent(x.acos) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <HStack gap={2} vAlign="end" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <TextInput
            label="New ad group name"
            value={newAdGroupName}
            onChange={(v) => setNewAdGroupName(v)}
            description="e.g. Branded keywords"
            width="100%"
          />
        </div>
        <Button
          variant="primary"
          label="+ Add ad group"
          onClick={() => {
            if (newAdGroupName.trim()) {
              addAdGroup(c.id, newAdGroupName);
              setNewAdGroupName('');
            }
          }}
        />
      </HStack>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad group</th>
              <th>Status</th>
              <th>Default bid</th>
              <th>Impr.</th>
              <th>Clicks</th>
              <th>Spend</th>
              <th>Sales</th>
              <th>ACOS</th>
              <th>Targets</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {c.adGroups.map((ag) => {
              const m = ag.metrics || {
                impressions: 0,
                clicks: 0,
                spend: 0,
                sales: 0,
                orders: 0,
              };
              const ax = calc(m);
              const count = c.targets.filter((t) => t.adGroupId === ag.id).length;
              return (
                <tr key={ag.id}>
                  <td>
                    <label htmlFor={`ag-row-name-${ag.id}`} className="visually-hidden">
                      Ad group name
                    </label>
                    <input
                      id={`ag-row-name-${ag.id}`}
                      className="input"
                      type="text"
                      value={adGroupNameEdits[ag.id] ?? ag.name}
                      onChange={(e) =>
                        setAdGroupNameEdits((p) => ({ ...p, [ag.id]: e.target.value }))
                      }
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          renameAdGroup(c.id, ag.id, e.target.value);
                        }
                      }}
                      style={{ width: 180, fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <label htmlFor={`ag-row-status-${ag.id}`} className="visually-hidden">
                      Ad group status
                    </label>
                    <select
                      id={`ag-row-status-${ag.id}`}
                      className="select"
                      value={ag.status}
                      onChange={(e) => setAdGroupStatus(c.id, ag.id, e.target.value as any)}
                      style={{ width: 120 }}
                    >
                      {['Enabled', 'Paused', 'Archived'].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </td>
                  <td className="money">{formatBid(ag.defaultBid)}</td>
                  <td className="mono">{formatWhole(m.impressions)}</td>
                  <td className="mono">{formatWhole(m.clicks)}</td>
                  <td className="money">{formatMoney(m.spend)}</td>
                  <td className="money">{formatMoney(m.sales)}</td>
                  <td className={`mono ${acosClass(ax.acos)}`}>
                    {ax.acos ? formatPercent(ax.acos) : '-'}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      label={`${count} ${count === 1 ? 'target' : 'targets'} →`}
                      onClick={() => setSelectedAdGroupId(ag.id)}
                    />
                  </td>
                  <td>
                    {c.adGroups.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        label="Remove"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove ad group "${ag.name}" and its targets?`,
                            )
                          ) {
                            removeAdGroup(c.id, ag.id);
                          }
                        }}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
