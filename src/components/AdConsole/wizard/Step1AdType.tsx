'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignType } from '@/engine/ad-console/types';

interface Step1AdTypeProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step1AdType({ isActive, isComplete }: Step1AdTypeProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const choices = [
    { type: 'SP' as CampaignType, title: 'Sponsored Products', desc: 'Promote individual listings. Train automatic targeting, manual keyword targeting, product targeting, search term reports, bids, negatives, and placements.', foot: 'Best first PPC operations module' },
    { type: 'SB' as CampaignType, title: 'Sponsored Brands', desc: 'Promote brand creative, product collections, Store spotlight, or video. Train headlines, brand assets, destinations, and keyword/product/category targeting.', foot: 'Brand registered workflow' },
    { type: 'SD' as CampaignType, title: 'Sponsored Display', desc: 'Reach shoppers through contextual targeting or audiences such as views remarketing. Train display setup, creative, products, and audience logic.', foot: 'Upper funnel and remarketing' },
  ];

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Choose campaign type</h2>
      <p className="muted" style={{ marginBottom: 14 }}>The simulator includes the three core ad types.</p>
      <div className="choice-grid">
        {choices.map((choice) => (
          <div
            key={choice.type}
            className={`choice ${draft.type === choice.type ? 'active' : ''}`}
            onClick={() => {
              updateDraft('type', choice.type);
              updateDraft('adFormat', choice.type === 'SP' ? 'Standard' : choice.type === 'SB' ? 'Product collection' : 'Auto generated');
            }}
          >
            <div><span className={`pill ${choice.type === 'SP' ? 'active' : choice.type === 'SB' ? 'orange' : 'purple'}`}>{choice.type}</span></div>
            <h3>{choice.title}</h3>
            <p>{choice.desc}</p>
            <span className="pill orange" style={{ marginTop: 8 }}>{choice.foot}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
