'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Props { campaign: Campaign }

export function PlacementsTab({ campaign }: Props) {
  const [top, setTop] = useState(campaign.placements.top);
  const [prod, setProd] = useState(campaign.placements.product);
  const [rest, setRest] = useState(campaign.placements.rest);

  return (
    <Card variant="default" padding={6}>
      <div className="section-head"><h2>Placement adjustments</h2><span className="meta">Percentage modifiers</span></div>
      <div className="form-grid" style={{ maxWidth: 400 }}>
        <NumberInput
          id="pt-top"
          label="Top of Search (%)"
          min={0}
          max={900}
          value={top}
          onChange={(v) => setTop(v)}
        />
        <NumberInput
          id="pt-product"
          label="Product pages (%)"
          min={0}
          max={900}
          value={prod}
          onChange={(v) => setProd(v)}
        />
        <NumberInput
          id="pt-rest"
          label="Rest of Search (%)"
          min={0}
          max={900}
          value={rest}
          onChange={(v) => setRest(v)}
        />
      </div>
      <Button label="Save placements" variant="primary" style={{ marginTop: 12 }} onClick={() => {
        useAdConsoleStore.getState().savePlacements(campaign.id, {
          top,
          product: prod,
          rest,
        });
      }} />
    </Card>
  );
}
