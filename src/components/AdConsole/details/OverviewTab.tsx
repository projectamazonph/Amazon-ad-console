'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/core/engine';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';

interface Props {
  campaign: Campaign;
}

export function OverviewTab({ campaign: c }: Props) {
  const toggleStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const removeCampaignProduct = useAdConsoleStore((s) => s.removeCampaignProduct);
  const [budgetInput, setBudgetInput] = useState(c.dailyBudget);
  const [defaultBidInput, setDefaultBidInput] = useState(c.defaultBid);

  return (
    <div className="split">
      <Card variant="default" padding={6}>
        <div className="section-head"><h2>Campaign settings</h2><span className="meta">Editable training controls</span></div>
        <div className="form-grid">
          <NumberInput
            id="ot-budget"
            label="Daily budget"
            min={1}
            value={budgetInput}
            onChange={(v) => setBudgetInput(Number(v))}
          />
          <NumberInput
            id="ot-bid"
            label="Default bid"
            min={0.02}
            step={0.01}
            value={defaultBidInput}
            onChange={(v) => setDefaultBidInput(Number(v))}
          />
          <Selector
            id="ot-strategy"
            label="Bid strategy"
            value={c.bidStrategy}
            onChange={(v) => useAdConsoleStore.getState().updateCampaignSettings(c.id, { bidStrategy: v as any })}
            options={['Dynamic bids - down only', 'Dynamic bids - up and down', 'Fixed bids', 'Cost per click', 'Cost per thousand impressions'].map((x) => ({ value: x, label: x }))}
          />
          <Selector
            id="ot-status"
            label="Status"
            value={c.status}
            onChange={() => toggleStatus(c.id)}
            options={['Enabled', 'Paused', 'Archived'].map((x) => ({ value: x, label: x }))}
          />
        </div>
        <Button label="Save settings" variant="primary" style={{ marginTop: 12 }}
          onClick={() => {
            useAdConsoleStore.getState().updateCampaignSettings(c.id, {
              dailyBudget: budgetInput,
              defaultBid: defaultBidInput,
            });
          }} />
      </Card>
      <Card variant="default" padding={6}>
        <div className="section-head"><h2>Products</h2><span className="meta">{c.type}</span></div>
        {c.products.map((asin) => {
          const p = PRODUCTS.find(x => x.asin === asin);
          return (
            <div key={asin} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="pill" style={{ margin: 0 }}>{p ? `${p.image} ${p.title} (${p.asin})` : asin}</span>
              <Button label="×" variant="destructive" size="sm" isIconOnly onClick={() => removeCampaignProduct(c.id, asin)} style={{ padding: '2px 6px', fontSize: 11 }} />
            </div>
          );
        })}
        {c.creative && (
          <div style={{ marginTop: 10 }}>
            <div className="review-box">
              <div className="review-row"><span>Brand</span><strong>{c.creative.brandName || 'N/A'}</strong></div>
              <div className="review-row"><span>Headline</span><strong>{c.creative.headline || 'N/A'}</strong></div>
            </div>
            {c.creativeStatus === 'Rejected' && (
              <div className="coach-tip" style={{ marginTop: 8 }}>
                Creative rejected: {c.creativeIssue}
                <Button label="Resubmit creative" variant="primary" size="sm" style={{ marginLeft: 8 }}
                  onClick={() => useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                    creativeStatus: 'Pending',
                    creativeIssue: '',
                  } as any)} />
              </div>
            )}
            {((c.type === 'SB' || c.type === 'SD') && ((c.type === 'SB' && c.adFormat === 'Video') || (c.type === 'SD' && c.adFormat === 'Video creative'))) && c.creative?.video && (
              <div className="tag" style={{ background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 18 }}>&#9654;</span>
                <span><strong>Video:</strong> {c.creative.video}</span>
              </div>
            )}
            {c.creative?.logo && <div className="review-row" style={{ marginTop: 4 }}><span>Logo</span><strong>{c.creative.logo}</strong></div>}
            {c.creative?.destination && <div className="review-row" style={{ marginTop: 4 }}><span>Destination</span><strong>{c.creative.destination}</strong></div>}
          </div>
        )}
      </Card>
      <Card variant="default" padding={6} style={{ gridColumn: '1 / -1' }}>
        <div className="section-head"><h2>Top targets by profit signal</h2><span className="meta">Use to train bid optimization</span></div>
        <Table>
            <thead><tr><th>Target</th><th>Bid</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th></tr></thead>
            <tbody>
              {c.targets.slice(0, 4).map((t) => {
                const tx = calc(t);
                return (
                  <tr key={t.id}>
                    <td><strong>{t.value}</strong></td>
                    <td className="money">{formatBid(t.bid)}</td>
                    <td className="mono">{formatWhole(t.impressions)}</td>
                    <td className="mono">{formatWhole(t.clicks)}</td>
                    <td className="money">{formatBid(tx.cpc)}</td>
                    <td className="money">{formatMoney(t.spend)}</td>
                    <td className="money">{formatMoney(t.sales)}</td>
                    <td className="mono">{formatWhole(t.orders)}</td>
                    <td className={`mono ${acosClass(tx.acos)}`}>{t.sales ? formatPercent(tx.acos) : '-'}</td>
                    <td className="mono">{formatRoas(tx.roas)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
      </Card>
    </div>
  );
}
