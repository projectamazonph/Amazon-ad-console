'use client';

import { Card } from '@astryxdesign/core/Card';
import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Step6ReviewLaunchProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step6ReviewLaunch({ isActive, isComplete }: Step6ReviewLaunchProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const launchCampaign = useAdConsoleStore((s) => s.launchCampaign);
  const resetDraft = useAdConsoleStore((s) => s.resetDraft);
  const setWizardStep = useAdConsoleStore((s) => s.setWizardStep);

  const d = draft;

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <div className="wizard-step-header">
        <h2>Review and launch</h2>
        <p>Review your campaign settings before launch.</p>
      </div>
      <Card variant="default" padding={6}>
        <div className="review-box">
          <div className="review-row"><span>Type</span><strong>{d.type}</strong></div>
          <div className="review-row"><span>Name</span><strong>{d.name || '(not set)'}</strong></div>
          <div className="review-row"><span>Portfolio</span><strong>{d.portfolio || '(not set)'}</strong></div>
          <div className="review-row"><span>Budget</span><strong>${d.dailyBudget}/day</strong></div>
          <div className="review-row"><span>Default bid</span><strong>${d.defaultBid}</strong></div>
          <div className="review-row"><span>Targeting</span><strong>{d.targetingMode}</strong></div>
          <div className="review-row"><span>Bid strategy</span><strong>{d.bidStrategy}</strong></div>
          <div className="review-row"><span>Format</span><strong>{d.adFormat}</strong></div>
          {d.campaignGoal && <div className="review-row"><span>Campaign goal</span><strong>{d.campaignGoal}</strong></div>}
          <div className="review-row"><span>Status</span><strong>{d.status}</strong></div>
          <div className="review-row"><span>Products</span><strong>{d.products.length} selected</strong></div>
          {d.exactKeywords && <div className="review-row"><span>Exact keywords</span><strong>{d.exactKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
          {d.phraseKeywords && <div className="review-row"><span>Phrase keywords</span><strong>{d.phraseKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
          {d.broadKeywords && <div className="review-row"><span>Broad keywords</span><strong>{d.broadKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
          {d.audienceLookback && <div className="review-row"><span>Lookback</span><strong>{d.audienceLookback} days</strong></div>}
        </div>
        {!d.name.trim() && <div className="coach-tip" style={{ marginTop: 10 }}>Campaign name is required before launch.</div>}
      </Card>
    </div>
  );
}
