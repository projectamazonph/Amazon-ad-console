'use client';

import { Card } from '@astryxdesign/core/Card';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: '' | 'good' | 'bad';
}

// Astryx `Text` color tokens don't expose tone semantics (no `success`/`error`),
// so we keep tone on the wrapping span and let CSS variables from the global
// theme handle the actual color. The Astryx components sit *inside* this span.
const toneToColor = (tone: '' | 'good' | 'bad'): string => {
  if (tone === 'good') return 'var(--success, #16a34a)';
  if (tone === 'bad') return 'var(--danger, #dc2626)';
  return 'var(--text-muted, #6b7280)';
};

const trendChar = (tone: '' | 'good' | 'bad'): string => {
  if (tone === 'good') return '↑';
  if (tone === 'bad') return '↓';
  return '·';
};

export function MetricCard({ label, value, delta, tone = '' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <Card padding={4} variant="transparent">
        <Stack gap={1}>
          <Text
            type="supporting"
            size="sm"
            weight="medium"
            maxLines={1}
            hasTruncateTooltip
          >
            {label}
          </Text>
          <Text
            type="display-3"
            size="lg"
            weight="semibold"
            maxLines={1}
            hasTruncateTooltip
          >
            {value}
          </Text>
          {delta && (
            <span
              className={`delta ${tone}`}
              style={{
                color: toneToColor(tone),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--text-sm, 0.875rem)',
                overflow: 'hidden',
                maxWidth: '100%',
              }}
              title={delta}
            >
              {tone !== '' && <span aria-hidden="true">{trendChar(tone)}</span>}
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {delta}
              </span>
            </span>
          )}
        </Stack>
      </Card>
    </div>
  );
}
