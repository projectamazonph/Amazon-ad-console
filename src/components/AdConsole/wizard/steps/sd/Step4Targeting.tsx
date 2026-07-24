'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignGoal } from '@/engine/ad-console/types';

interface Step4TargetingSDProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step4TargetingSD({ isActive, isComplete }: Step4TargetingSDProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [contextualCategories, setContextualCategories] = useState(draft.categoryTargets || '');
  const [audienceTargets, setAudienceTargets] = useState(draft.audienceTargets || '');
  const [audienceLookback, setAudienceLookback] = useState(draft.audienceLookback || '30');

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <div className="wizard-step-header">
        <h2>Targeting</h2>
        <p>Choose targeting method and add targets.</p>
      </div>

      <Card variant="default" padding={6} style={{ marginBottom: 16 }}>
        <div className="card-title"><h3>Campaign goal</h3></div>
        <div className="field full">
          <select className="select full" value={draft.campaignGoal || 'Conversions'} onChange={(e) => updateDraft('campaignGoal', e.target.value as CampaignGoal)}>
            <option value="Conversions">Conversions: optimize for purchases</option>
            <option value="Consideration">Consideration: optimize for detail page views</option>
            <option value="Awareness">Awareness: optimize for impressions</option>
          </select>
          <p className="muted" style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>
            Goal affects simulation quality bonus: Conversions +5%, Consideration +2%, Awareness +0%.
          </p>
        </div>
      </Card>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Targeting mode</label>
        <select className="select full" value={draft.targetingMode} onChange={(e) => updateDraft('targetingMode', e.target.value)}>
          <option>Contextual</option>
          <option>Audiences - views remarketing</option>
          <option>Audiences - purchases remarketing</option>
          <option>Categories</option>
        </select>
      </div>

      {draft.targetingMode === 'Contextual' && (
        <Card variant="default" padding={6} style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Contextual targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Category targets (one per line)</label>
            <textarea className="input full" rows={3} value={contextualCategories} onChange={(e) => { setContextualCategories(e.target.value); updateDraft('categoryTargets', e.target.value); }} placeholder="Coffee & Espresso Accessories&#10;Drinkware" />
          </div>
        </Card>
      )}

      {draft.targetingMode.includes('Audiences') && (
        <Card variant="default" padding={6} style={{ marginBottom: 16 }}>
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
        </Card>
      )}

      {draft.targetingMode === 'Categories' && (
        <Card variant="default" padding={6} style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Category targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Categories (one per line)</label>
            <textarea className="input full" rows={3} value={contextualCategories} onChange={(e) => { setContextualCategories(e.target.value); updateDraft('categoryTargets', e.target.value); }} placeholder="Coffee & Espresso Accessories&#10;Drinkware" />
          </div>
        </Card>
      )}

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Bid strategy</label>
        <select className="select full" value={draft.bidStrategy} onChange={(e) => updateDraft('bidStrategy', e.target.value)}>
          {draft.targetingMode.includes('Audiences')
            ? ['Cost per click', 'Cost per thousand impressions'].map((x) => <option key={x}>{x}</option>)
            : ['Cost per click'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
    </div>
  );
}
