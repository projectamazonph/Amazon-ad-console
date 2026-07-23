'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaign: Campaign;
}

const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'];

export function TargetsTab({ campaign: c }: Props) {
  const addKeyword = useAdConsoleStore((s) => s.addKeyword);
  const removeTarget = useAdConsoleStore((s) => s.removeTarget);
  const setTargetBid = useAdConsoleStore((s) => s.setTargetBid);
  const adjustTargetBid = useAdConsoleStore((s) => s.adjustTargetBid);
  const toggleStatusTarget = useAdConsoleStore((s) => s.pauseTarget);
  const toggleAddKeywordForm = useAdConsoleStore((s) => s.toggleAddKeywordForm);
  const showAddKeywordForm = useAdConsoleStore((s) => s.showAddKeywordForm);

  const [newKeywordValue, setNewKeywordValue] = useState('');
  const [newKeywordMatch, setNewKeywordMatch] = useState<'Exact' | 'Phrase' | 'Broad'>('Exact');
  const [newKeywordBid, setNewKeywordBid] = useState(0.75);
  const [newKeywordAdGroup, setNewKeywordAdGroup] = useState(c.adGroups[0]?.id ?? '');
  const [bidEdits, setBidEdits] = useState<Record<string, string>>({});

  if (!c.targets.length && !showAddKeywordForm) {
    return (
      <EmptyState
        icon="target"
        title="No targets"
        message="Add keywords, products, or audience targets to start targeting shoppers."
      >
        <Button
          variant="primary"
          label="+ Add keyword"
          onClick={() => toggleAddKeywordForm()}
        />
      </EmptyState>
    );
  }

  return (
    <div>
      {!showAddKeywordForm && (
        <div className="tab-toolbar center">
          <Button
            variant="primary"
            label="+ Add keyword"
            onClick={() => toggleAddKeywordForm()}
          />
        </div>
      )}

      {showAddKeywordForm && (
        <Card padding={4} style={{ marginBottom: 10, background: 'var(--surface-2)' }}>
          <Stack gap={3}>
            <TextArea
              label="Keyword"
              value={newKeywordValue}
              onChange={(v) => setNewKeywordValue(v)}
              description="Enter a keyword"
              rows={2}
              width="100%"
            />
            <HStack gap={2} wrap="wrap">
              <div className="field" style={{ flex: 1, minWidth: 100 }}>
                <label htmlFor="kw-match">Match type</label>
                <select
                  id="kw-match"
                  className="select full"
                  value={newKeywordMatch}
                  onChange={(e) => setNewKeywordMatch(e.target.value as 'Exact' | 'Phrase' | 'Broad')}
                >
                  {MATCH_TYPES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ flex: 1, minWidth: 80 }}>
                <label htmlFor="kw-bid">Bid</label>
                <input
                  id="kw-bid"
                  className="input full"
                  type="number"
                  min={0.02}
                  step={0.01}
                  value={newKeywordBid}
                  onChange={(e) => setNewKeywordBid(Number(e.target.value))}
                  style={{
                    borderColor: newKeywordBid < 0.02 ? 'var(--danger)' : undefined,
                  }}
                />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 140 }}>
                <label htmlFor="kw-adgroup">Ad group</label>
                <select
                  id="kw-adgroup"
                  className="select full"
                  value={newKeywordAdGroup}
                  onChange={(e) => setNewKeywordAdGroup(e.target.value)}
                >
                  {c.adGroups.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>
            </HStack>
            <HStack gap={2}>
              <Button
                variant="primary"
                label="Add keyword"
                onClick={() => {
                  if (!newKeywordValue.trim()) return;
                  addKeyword(
                    c.id,
                    newKeywordValue.trim(),
                    newKeywordMatch,
                    newKeywordBid,
                    newKeywordAdGroup,
                  );
                  setNewKeywordValue('');
                  setNewKeywordBid(0.75);
                }}
              />
              <Button variant="secondary" label="Cancel" onClick={() => toggleAddKeywordForm()} />
            </HStack>
          </Stack>
        </Card>
      )}

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
            {c.targets.map((t) => {
              const tx = calc(t);
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
                  <td>{t.type}</td>
                  <td>{t.match}</td>
                  <td>
                    <Badge
                      variant={t.status === 'Enabled' ? 'success' : 'warning'}
                      label={t.status}
                    />
                  </td>
                  <td>
                    <label htmlFor={`t-bid-${t.id}`} className="visually-hidden">
                      Bid for {t.value}
                    </label>
                    <input
                      id={`t-bid-${t.id}`}
                      className="input"
                      type="number"
                      min={0.02}
                      step={0.01}
                      value={bidEdits[t.id] ?? t.bid}
                      onChange={(e) =>
                        setBidEdits({ ...bidEdits, [t.id]: e.target.value })
                      }
                      style={{ width: 72, padding: '4px 6px', fontSize: 12 }}
                    />
                  </td>
                  <td className="mono">{formatWhole(t.impressions)}</td>
                  <td className="mono">{formatWhole(t.clicks)}</td>
                  <td className="money">{formatBid(tx.cpc)}</td>
                  <td className="money">{formatMoney(t.spend)}</td>
                  <td className="money">{formatMoney(t.sales)}</td>
                  <td className="mono">{formatWhole(t.orders)}</td>
                  <td className={`mono ${acosClass(tx.acos)}`}>
                    {t.sales ? formatPercent(tx.acos) : 'No sales'}
                  </td>
                  <td className="mono">{formatRoas(tx.roas)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <HStack gap={1} wrap="wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        label="-10%"
                        onClick={() => adjustTargetBid(c.id, t.id, 0.9)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        label="+10%"
                        onClick={() => adjustTargetBid(c.id, t.id, 1.1)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        label="Set"
                        onClick={() => {
                          const bid = Number(bidEdits[t.id]);
                          if (bid && bid > 0) setTargetBid(c.id, t.id, bid);
                        }}
                      />
                      <Button
                        variant={t.status === 'Paused' ? 'primary' : 'secondary'}
                        size="sm"
                        label={t.status === 'Paused' ? 'Enable' : 'Pause'}
                        onClick={() => toggleStatusTarget(c.id, t.id)}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        label="Remove"
                        onClick={() => {
                          if (confirm(`Remove "${t.value}"?`)) removeTarget(c.id, t.id);
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
    </div>
  );
}
