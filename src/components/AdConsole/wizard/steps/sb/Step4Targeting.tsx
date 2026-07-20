'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { KeywordEntry } from '../../KeywordEntry';

interface Step4TargetingSBProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step4TargetingSB({ isActive, isComplete }: Step4TargetingSBProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [asinTargets, setAsinTargets] = useState(draft.asinTargets || '');
  const [categoryTargets, setCategoryTargets] = useState(draft.categoryTargets || '');
  const [audienceTargets, setAudienceTargets] = useState(draft.audienceTargets || '');
  const [audienceLookback, setAudienceLookback] = useState(draft.audienceLookback || '30');

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Targeting</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Choose targeting method and add targets.</p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Targeting mode</label>
        <select className="select full" value={draft.targetingMode} onChange={(e) => updateDraft('targetingMode', e.target.value)}>
          <option>Keyword</option>
          <option>Product</option>
          <option>Category</option>
          <option>Audiences - views remarketing</option>
          <option>Audiences - purchases remarketing</option>
        </select>
      </div>

      {draft.targetingMode === 'Keyword' && <KeywordEntry />}

      {draft.targetingMode === 'Product' && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Product targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>ASIN targets (one per line)</label>
            <textarea className="input full" rows={3} value={asinTargets} onChange={(e) => { setAsinTargets(e.target.value); updateDraft('asinTargets', e.target.value); }} placeholder="B0ABC123&#10;B0DEF456" />
          </div>
        </div>
      )}

      {draft.targetingMode === 'Category' && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Category targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Category targets (one per line)</label>
            <textarea className="input full" rows={3} value={categoryTargets} onChange={(e) => { setCategoryTargets(e.target.value); updateDraft('categoryTargets', e.target.value); }} placeholder="Coffee & Espresso Accessories&#10;Drinkware" />
          </div>
        </div>
      )}

      {draft.targetingMode.includes('Audiences') && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Audience targeting</h3></div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Lookback window (days)</label>
            <select className="select full" value={audienceLookback} onChange={(e) => { setAudienceLookback(e.target.value); updateDraft('audienceLookback', e.target.value); }}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Audience targets (one per line)</label>
            <textarea className="input full" rows={3} value={audienceTargets} onChange={(e) => { setAudienceTargets(e.target.value); updateDraft('audienceTargets', e.target.value); }} placeholder="Viewed advertised products 30 days&#10;Purchased from brand 60 days" />
          </div>
        </div>
      )}

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Bid strategy</label>
        <select className="select full" value={draft.bidStrategy} onChange={(e) => updateDraft('bidStrategy', e.target.value)}>
          <option>Cost per click</option>
        </select>
      </div>
    </div>
  );
}
