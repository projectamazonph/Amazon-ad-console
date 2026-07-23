'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Card } from '@astryxdesign/core/Card';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Step6ReviewLaunchProps {
  isActive: boolean;
  isComplete: boolean;
}

interface RowProps {
  label: string;
  value: React.ReactNode;
}

function ReviewRow({ label, value }: RowProps) {
  return (
    <div className="review-row">
      <Text type="supporting" size="sm" color="secondary" maxLines={1}>
        {label}
      </Text>
      <Text type="body" weight="medium" maxLines={2} hasTruncateTooltip>
        {value}
      </Text>
    </div>
  );
}

export function Step6ReviewLaunch({ isActive, isComplete }: Step6ReviewLaunchProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const d = draft;

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Review & launch</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Review your campaign settings before launch.
      </p>
      <Card padding={5} variant="default">
        <Stack gap={4}>
          <div className="review-box">
            <ReviewRow label="Type" value={d.type} />
            <ReviewRow label="Name" value={d.name || '(not set)'} />
            <ReviewRow label="Portfolio" value={d.portfolio || '(not set)'} />
            <ReviewRow label="Budget" value={`$${d.dailyBudget}/day`} />
            <ReviewRow label="Default bid" value={`$${d.defaultBid}`} />
            <ReviewRow label="Targeting" value={d.targetingMode} />
            <ReviewRow label="Bid strategy" value={d.bidStrategy} />
            <ReviewRow label="Format" value={d.adFormat} />
            {d.campaignGoal && (
              <ReviewRow label="Campaign goal" value={d.campaignGoal} />
            )}
            <ReviewRow label="Status" value={d.status} />
            <ReviewRow label="Products" value={`${d.products.length} selected`} />
            {d.exactKeywords && (
              <ReviewRow
                label="Exact keywords"
                value={`${d.exactKeywords.split('\n').filter(Boolean).length} entered`}
              />
            )}
            {d.phraseKeywords && (
              <ReviewRow
                label="Phrase keywords"
                value={`${d.phraseKeywords.split('\n').filter(Boolean).length} entered`}
              />
            )}
            {d.broadKeywords && (
              <ReviewRow
                label="Broad keywords"
                value={`${d.broadKeywords.split('\n').filter(Boolean).length} entered`}
              />
            )}
            {d.audienceLookback && (
              <ReviewRow label="Lookback" value={`${d.audienceLookback} days`} />
            )}
          </div>
          {!d.name.trim() && (
            <div className="coach-tip" style={{ marginTop: 10 }}>
              Campaign name is required before launch.
            </div>
          )}
        </Stack>
      </Card>
    </div>
  );
}
