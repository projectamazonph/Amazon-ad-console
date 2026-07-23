'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Card } from '@astryxdesign/core/Card';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Step4TargetingSPProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step4TargetingSP({ isActive, isComplete }: Step4TargetingSPProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [exactKeywords, setExactKeywords] = useState(draft.exactKeywords || '');
  const [phraseKeywords, setPhraseKeywords] = useState(draft.phraseKeywords || '');
  const [broadKeywords, setBroadKeywords] = useState(draft.broadKeywords || '');
  const [asinTargets, setAsinTargets] = useState(draft.asinTargets || '');
  const [categoryTargets, setCategoryTargets] = useState(draft.categoryTargets || '');

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Targeting</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Choose targeting method and add targets.
      </p>

      <Stack gap={4}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Targeting mode</label>
          <select
            className="select full"
            value={draft.targetingMode}
            onChange={(e) => updateDraft('targetingMode', e.target.value)}
          >
            <option>Automatic</option>
            <option>Manual keyword</option>
            <option>Manual product</option>
          </select>
        </div>

        {draft.targetingMode === 'Manual keyword' && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h3"
              >
                Keyword targeting
              </Text>
              <TextArea
                label="Exact match (one per line)"
                value={exactKeywords}
                onChange={(v) => {
                  setExactKeywords(v);
                  updateDraft('exactKeywords', v);
                }}
                description="coffee filter, paper coffee filter"
                rows={4}
                width="100%"
              />
              <TextArea
                label="Phrase match (one per line)"
                value={phraseKeywords}
                onChange={(v) => {
                  setPhraseKeywords(v);
                  updateDraft('phraseKeywords', v);
                }}
                description="organic coffee filter, best coffee filter"
                rows={4}
                width="100%"
              />
              <TextArea
                label="Broad match (one per line)"
                value={broadKeywords}
                onChange={(v) => {
                  setBroadKeywords(v);
                  updateDraft('broadKeywords', v);
                }}
                description="cheap coffee filter, coffee filter deals"
                rows={4}
                width="100%"
              />
            </Stack>
          </Card>
        )}

        {draft.targetingMode === 'Manual product' && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h3"
              >
                Product targeting
              </Text>
              <TextArea
                label="ASIN targets (one per line)"
                value={asinTargets}
                onChange={(v) => {
                  setAsinTargets(v);
                  updateDraft('asinTargets', v);
                }}
                description="B0ABC123, B0DEF456"
                rows={3}
                width="100%"
              />
              <TextArea
                label="Category targets (one per line)"
                value={categoryTargets}
                onChange={(v) => {
                  setCategoryTargets(v);
                  updateDraft('categoryTargets', v);
                }}
                description="Coffee & Espresso Accessories, Drinkware"
                rows={3}
                width="100%"
              />
            </Stack>
          </Card>
        )}

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
