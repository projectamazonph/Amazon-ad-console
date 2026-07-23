'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

// Step components
import { Step1AdType } from './Step1AdType';
import { Step2Basics } from './Step2Basics';
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

import { Button } from '@astryxdesign/core/Button';
import { HStack, Stack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';

const STEPS = [
  'Ad type',
  'Basics',
  'Products & creative',
  'Targeting',
  'Bidding',
  'Review',
];

export function CreateCampaignWizard() {
  const draft = useAdConsoleStore((s) => s.draft);
  const wizardStep = useAdConsoleStore((s) => s.wizardStep);
  const setWizardStep = useAdConsoleStore((s) => s.setWizardStep);
  const launchCampaign = useAdConsoleStore((s) => s.launchCampaign);
  const resetDraft = useAdConsoleStore((s) => s.resetDraft);
  const setView = useAdConsoleStore((s) => s.setView);

  const d = draft;
  const isComplete = (step: number) => wizardStep > step;
  const isActive = (step: number) => wizardStep === step;

  const renderStep = (stepNum: number) => {
    const campaignType = d.type || 'SP';

    switch (stepNum) {
      case 1:
        return <Step1AdType isActive={isActive(1)} isComplete={isComplete(1)} />;
      case 2:
        return <Step2Basics isActive={isActive(2)} isComplete={isComplete(2)} />;
      case 3:
        if (campaignType === 'SP')
          return (
            <Step3ProductsCreativeSP
              isActive={isActive(3)}
              isComplete={isComplete(3)}
            />
          );
        if (campaignType === 'SB')
          return (
            <Step3ProductsCreativeSB
              isActive={isActive(3)}
              isComplete={isComplete(3)}
            />
          );
        return (
          <Step3ProductsCreativeSD
            isActive={isActive(3)}
            isComplete={isComplete(3)}
          />
        );
      case 4:
        if (campaignType === 'SP')
          return (
            <Step4TargetingSP isActive={isActive(4)} isComplete={isComplete(4)} />
          );
        if (campaignType === 'SB')
          return (
            <Step4TargetingSB isActive={isActive(4)} isComplete={isComplete(4)} />
          );
        return (
          <Step4TargetingSD isActive={isActive(4)} isComplete={isComplete(4)} />
        );
      case 5:
        if (campaignType === 'SP')
          return (
            <Step5BiddingSP isActive={isActive(5)} isComplete={isComplete(5)} />
          );
        if (campaignType === 'SB')
          return (
            <Step5BiddingSB isActive={isActive(5)} isComplete={isComplete(5)} />
          );
        return (
          <Step5BiddingSD isActive={isActive(5)} isComplete={isComplete(5)} />
        );
      case 6:
        return (
          <Step6ReviewLaunch isActive={isActive(6)} isComplete={isComplete(6)} />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-title">
        <Text
          type="display-3"
          size="lg"
          weight="semibold"
          maxLines={1}
          hasTruncateTooltip
          as="h1"
        >
          Create campaign
        </Text>
        <Button
          variant="secondary"
          label="Back to campaigns"
          onClick={() => setView('campaigns')}
        />
      </div>

      <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
        <HStack gap={2} wrap justify="between">
          {STEPS.map((label, i) => (
            <Stack key={i} gap={1} align="center">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isComplete(i + 1)
                    ? 'var(--success, #16a34a)'
                    : isActive(i + 1)
                      ? 'var(--primary, #2563eb)'
                      : 'var(--surface-3, #e5e7eb)',
                  color:
                    isComplete(i + 1) || isActive(i + 1)
                      ? 'white'
                      : 'var(--text, #1f2937)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm, 0.875rem)',
                }}
              >
                {isComplete(i + 1) ? '✓' : i + 1}
              </div>
              <Text
                type="supporting"
                size="sm"
                color={isActive(i + 1) ? 'primary' : 'secondary'}
                maxLines={1}
                hasTruncateTooltip
              >
                {label}
              </Text>
            </Stack>
          ))}
        </HStack>
      </Card>

      <Card padding={5} variant="default">
        <Stack gap={4}>
          {renderStep(wizardStep)}

          <HStack justify="between" vAlign="center" wrap="wrap">
            <Button
              variant="secondary"
              size="sm"
              label="Back"
              isDisabled={wizardStep === 1}
              onClick={() => setWizardStep(wizardStep - 1)}
            />
            <HStack gap={2} wrap="wrap">
              <Button
                variant="ghost"
                size="sm"
                label="Reset draft"
                onClick={() => {
                  resetDraft();
                }}
              />
              {wizardStep < 6 ? (
                <Button
                  variant="primary"
                  label="Next"
                  onClick={() => setWizardStep(wizardStep + 1)}
                />
              ) : (
                <Button
                  variant="primary"
                  label="Launch campaign"
                  onClick={() => {
                    if (!d.name.trim()) return;
                    launchCampaign();
                  }}
                />
              )}
            </HStack>
          </HStack>
        </Stack>
      </Card>
    </div>
  );
}
