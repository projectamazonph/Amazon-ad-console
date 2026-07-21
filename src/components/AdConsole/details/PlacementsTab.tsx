'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Props { campaign: Campaign }

export function PlacementsTab({ campaign }: Props) {
  const [top, setTop] = useState(String(campaign.placements.top));
  const [prod, setProd] = useState(String(campaign.placements.product));
  const [rest, setRest] = useState(String(campaign.placements.rest));

  return (
    <div className="card pad">
      <div className="section-head"><h2>Placement adjustments</h2><span className="meta">Percentage modifiers</span></div>
      <div className="form-grid" style={{ maxWidth: 400 }}>
        <div className="field">
          <label>Top of Search (%)</label>
          <input className="input full" type="number" min="0" max="900" value={top} onChange={(e) => setTop(e.target.value)} />
        </div>
        <div className="field">
          <label>Product pages (%)</label>
          <input className="input full" type="number" min="0" max="900" value={prod} onChange={(e) => setProd(e.target.value)} />
        </div>
        <div className="field">
          <label>Rest of Search (%)</label>
          <input className="input full" type="number" min="0" max="900" value={rest} onChange={(e) => setRest(e.target.value)} />
        </div>
      </div>
      <button className="btn primary" style={{ marginTop: 12 }} onClick={() => {
        useAdConsoleStore.getState().savePlacements(campaign.id, {
          top: Number(top),
          product: Number(prod),
          rest: Number(rest),
        });
      }}>Save placements</button>
    </div>
  );
}
