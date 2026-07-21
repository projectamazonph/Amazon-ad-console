'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass } from '@/engine/ad-console/engine';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';

interface Props {
  campaign: Campaign;
}

export function OverviewTab({ campaign: c }: Props) {
  const toggleStatus = useAdConsoleStore((s) => s.toggleCampaignStatus);
  const removeCampaignProduct = useAdConsoleStore((s) => s.removeCampaignProduct);
  const [budgetInput, setBudgetInput] = useState(String(c.dailyBudget));
  const [defaultBidInput, setDefaultBidInput] = useState(String(c.defaultBid));

  return (
    <div className="split">
      <div className="card pad">
        <div className="section-head"><h2>Campaign settings</h2><span className="meta">Editable training controls</span></div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="ot-budget">Daily budget</label>
            <input id="ot-budget" className="input full" type="number" min="1" value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ot-bid">Default bid</label>
            <input id="ot-bid" className="input full" type="number" min="0.02" step="0.01" value={defaultBidInput}
              onChange={(e) => setDefaultBidInput(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ot-strategy">Bid strategy</label>
            <select id="ot-strategy" className="select full" value={c.bidStrategy}
              onChange={(e) => useAdConsoleStore.getState().updateCampaignSettings(c.id, { bidStrategy: e.target.value as any })}>
              {['Dynamic bids - down only', 'Dynamic bids - up and down', 'Fixed bids', 'Cost per click', 'Cost per thousand impressions'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ot-status">Status</label>
            <select id="ot-status" className="select full" value={c.status}
              onChange={(e) => toggleStatus(c.id)}>
              {['Enabled', 'Paused', 'Archived'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <button className="btn primary" style={{ marginTop: 12 }}
          onClick={() => {
            useAdConsoleStore.getState().updateCampaignSettings(c.id, {
              dailyBudget: Number(budgetInput),
              defaultBid: Number(defaultBidInput),
            });
          }}>Save settings</button>
      </div>
      <div className="card pad">
        <div className="section-head"><h2>Products</h2><span className="meta">{c.type}</span></div>
        {c.products.map((asin) => {
          const p = PRODUCTS.find(x => x.asin === asin);
          return (
            <div key={asin} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="pill" style={{ margin: 0 }}>{p ? `${p.image} ${p.title} (${p.asin})` : asin}</span>
              <button className="btn small danger" onClick={() => removeCampaignProduct(c.id, asin)} style={{ padding: '2px 6px', fontSize: 11 }}>&times;</button>
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
                <button className="btn small primary" style={{ marginLeft: 8 }}
                  onClick={() => useAdConsoleStore.getState().updateCampaignSettings(c.id, {
                    creativeStatus: 'Pending',
                    creativeIssue: '',
                  } as any)}>Resubmit creative</button>
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
      </div>
      <div className="card pad" style={{ gridColumn: '1 / -1' }}>
        <div className="section-head"><h2>Top targets by profit signal</h2><span className="meta">Use to train bid optimization</span></div>
        <div className="table-wrap">
          <table>
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
          </table>
        </div>
      </div>
    </div>
  );
}
