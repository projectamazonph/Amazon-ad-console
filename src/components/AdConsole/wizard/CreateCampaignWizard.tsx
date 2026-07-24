'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignType, CampaignDraft } from '@/engine/ad-console/types';
import { PRODUCTS, BRANDS } from '@/engine/ad-console/core/scenarios';

// Step components
import { Step1AdType } from './Step1AdType';
import { Step2Basics } from './Step2Basics';
// Import campaign-type specific steps
import { Step3ProductsCreativeSP } from './steps/sp/Step3ProductsCreative';
import { Step4TargetingSP } from './steps/sp/Step4Targeting';
import { Step5BiddingSP } from './steps/sp/Step5Bidding';
import { Step3ProductsCreativeSB } from './steps/sb/Step3ProductsCreative';
import { Step4TargetingSB } from './steps/sb/Step4Targeting';
import { Step5BiddingSB } from './steps/sb/Step5Bidding';
import { Step3ProductsCreativeSD } from './steps/sd/Step3ProductsCreative';
import { Step4TargetingSD } from './steps/sd/Step4Targeting';
import { Step5BiddingSD } from './steps/sd/Step5Bidding';
import { Step6ReviewLaunch } from './Step6ReviewLaunch';

const STEPS = ['Ad type', 'Basics', 'Products & creative', 'Targeting', 'Bidding', 'Review'];

export function CreateCampaignWizard() {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const wizardStep = useAdConsoleStore((s) => s.wizardStep);
  const setWizardStep = useAdConsoleStore((s) => s.setWizardStep);
  const launchCampaign = useAdConsoleStore((s) => s.launchCampaign);
  const resetDraft = useAdConsoleStore((s) => s.resetDraft);
  const setView = useAdConsoleStore((s) => s.setView);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const d = draft;

  // Local state for forms
  const [exactKeywords, setExactKeywords] = useState(d.exactKeywords || '');
  const [phraseKeywords, setPhraseKeywords] = useState(d.phraseKeywords || '');
  const [broadKeywords, setBroadKeywords] = useState(d.broadKeywords || '');
  const [asinTargets, setAsinTargets] = useState(d.asinTargets || '');
  const [categoryTargets, setCategoryTargets] = useState(d.categoryTargets || '');
  const [audienceTargets, setAudienceTargets] = useState(d.audienceTargets || '');
  const [audienceLookback, setAudienceLookback] = useState(d.audienceLookback || '30');

  // SB-specific state
  const [storeUrl, setStoreUrl] = useState(d.creative.destination || '');
  const [brandId, setBrandId] = useState(d.creative.brandName ? BRANDS.find(b => b.name === d.creative.brandName)?.id || '' : '');
  const [logo, setLogo] = useState(d.creative.logo || '');
  const [headline, setHeadline] = useState(d.creative.headline || '');
  const [image, setImage] = useState(d.creative.image || '');
  const [video, setVideo] = useState(d.creative.video || '');

  // Local state is initialized from draft and kept in sync via the store's
  // updateDraft action on each step's Next handler.

  const isComplete = (step: number) => wizardStep > step;
  const isActive = (step: number) => wizardStep === step;

  // Get the correct step components based on campaign type
  const renderStep = (stepNum: number) => {
    const campaignType = d.type || 'SP';
    
    switch (stepNum) {
      case 1:
        return <Step1AdType isActive={isActive(1)} isComplete={isComplete(1)} />;
      case 2:
        return <Step2Basics isActive={isActive(2)} isComplete={isComplete(2)} />;
      case 3:
        if (campaignType === 'SP') return <Step3ProductsCreativeSP isActive={isActive(3)} isComplete={isComplete(3)} />;
        if (campaignType === 'SB') return <Step3ProductsCreativeSB isActive={isActive(3)} isComplete={isComplete(3)} />;
        return <Step3ProductsCreativeSD isActive={isActive(3)} isComplete={isComplete(3)} />;
      case 4:
        if (campaignType === 'SP') return <Step4TargetingSP isActive={isActive(4)} isComplete={isComplete(4)} />;
        if (campaignType === 'SB') return <Step4TargetingSB isActive={isActive(4)} isComplete={isComplete(4)} />;
        return <Step4TargetingSD isActive={isActive(4)} isComplete={isComplete(4)} />;
      case 5:
        if (campaignType === 'SP') return <Step5BiddingSP isActive={isActive(5)} isComplete={isComplete(5)} />;
        if (campaignType === 'SB') return <Step5BiddingSB isActive={isActive(5)} isComplete={isComplete(5)} />;
        return <Step5BiddingSD isActive={isActive(5)} isComplete={isComplete(5)} />;
      case 6:
        return <Step6ReviewLaunch isActive={isActive(6)} isComplete={isComplete(6)} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>Create campaign</h1>
        <Button label="Back to campaigns" onClick={() => setView('campaigns')} />
      </div>

      <div className="wizard">
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`step ${isActive(i + 1) ? 'active' : isComplete(i + 1) ? 'done' : ''}`}>
              <span className="step-num">{isComplete(i + 1) ? '✓' : i + 1}</span>
              <div>{label}</div>
            </div>
          ))}
        </div>

        <div className="wizard-panel">
          {renderStep(wizardStep)}

          <div className="wizard-nav">
            <Button label="Back" isDisabled={wizardStep === 1} onClick={() => setWizardStep(wizardStep - 1)} />
            <div className="pill-row">
              <Button label="Reset draft" onClick={() => { resetDraft(); }} />
              {wizardStep < 6 ? (
                <Button label="Next" variant="primary" onClick={() => setWizardStep(wizardStep + 1)} />
              ) : (
                <Button label="Launch campaign" variant="primary" onClick={() => {
                  if (!d.name.trim()) return;
                  launchCampaign();
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
