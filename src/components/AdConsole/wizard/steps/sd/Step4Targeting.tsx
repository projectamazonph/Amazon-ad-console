'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Card } from '@astryxdesign/core/Card';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Step4TargetingSDProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step4TargetingSD({ isActive, isComplete }: Step4TargetingSDProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [audienceTargets, setAudienceTargets] = useState(draft.audienceTargets || '');
  const [audienceLookback, setAudienceLookback] = useState(draft.audienceLookback || '30');

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Targeting</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Choose audience targeting for Sponsored Display.
      </p>

      <Stack gap={4}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Targeting mode</label>
          <select
            className="select full"
            value={draft.targetingMode}
            onChange={(e) => updateDraft('targetingMode', e.target.value)}
          >
            <option>Contextual targeting</option>
            <option>Audience targeting</option>
          </select>
        </div>

        <Card padding={5} variant="default">
          <Stack gap={3}>
            <Text
              type="large"
              weight="semibold"
              maxLines={1}
              hasTruncateTooltip
              as="h3"
            >
              Audience setup
            </Text>
            <TextArea
              label="Audiences (one per line)"
              value={audienceTargets}
              onChange={(v) => {
                setAudienceTargets(v);
                updateDraft('audienceTargets', v);
              }}
              description="Lifestyle & interests, In-market, Views remarketing"
              rows={4}
              width="100%"
            />
            <div className="field">
              <label htmlFor="sd-lookback">Audience lookback (days)</label>
              <input
                id="sd-lookback"
                className="input full"
                type="number"
                min={1}
                max={365}
                value={audienceLookback}
                onChange={(e) => {
                  setAudienceLookback(e.target.value);
                  updateDraft('audienceLookback', e.target.value);
                }}
              />
            </div>
          </Stack>
        </Card>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>Bid strategy</label>
          <select
            className="select full"
            value={draft.bidStrategy}
            onChange={(e) => updateDraft('bidStrategy', e.target.value)}
          >
            <option>Dynamic bids - down only</option>
            <option>Dynamic bids - up and down</option>
            <option>Fixed bids</option>
          </select>
        </div>
      </Stack>
    </div>
  );
}
