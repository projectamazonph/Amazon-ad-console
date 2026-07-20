'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { KeywordEntry } from '../../KeywordEntry';

interface Step4TargetingSPProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step4TargetingSP({ isActive, isComplete }: Step4TargetingSPProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [asinTargets, setAsinTargets] = useState(draft.asinTargets || '');
  const [categoryTargets, setCategoryTargets] = useState(draft.categoryTargets || '');

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Targeting</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Choose targeting method and add targets.</p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Targeting mode</label>
        <select className="select full" value={draft.targetingMode} onChange={(e) => updateDraft('targetingMode', e.target.value)}>
          <option>Automatic</option>
          <option>Manual keyword</option>
          <option>Manual product</option>
        </select>
      </div>

      {draft.targetingMode === 'Manual keyword' && <KeywordEntry />}

      {draft.targetingMode === 'Manual product' && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Product targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>ASIN targets (one per line)</label>
            <textarea className="input full" rows={3} value={asinTargets} onChange={(e) => { setAsinTargets(e.target.value); updateDraft('asinTargets', e.target.value); }} placeholder="B0ABC123&#10;B0DEF456" />
          </div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Category targets (one per line)</label>
            <textarea className="input full" rows={3} value={categoryTargets} onChange={(e) => { setCategoryTargets(e.target.value); updateDraft('categoryTargets', e.target.value); }} placeholder="Coffee & Espresso Accessories&#10;Drinkware" />
          </div>
        </div>
      )}

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Bid strategy</label>
        <select className="select full" value={draft.bidStrategy} onChange={(e) => updateDraft('bidStrategy', e.target.value)}>
          <option>Dynamic bids - down only</option>
          <option>Dynamic bids - up and down</option>
          <option>Fixed bids</option>
        </select>
      </div>
    </div>
  );
}
