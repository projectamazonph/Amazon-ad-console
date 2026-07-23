'use client';

import type { ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

type IconName = 'target' | 'block' | 'group' | 'search' | 'history' | 'rule' | 'chart';

const ICONS: Record<IconName, ReactNode> = {
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  block: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </>
  ),
  group: (
    <>
      <rect x="3" y="4" width="8" height="7" rx="1" />
      <rect x="13" y="4" width="8" height="7" rx="1" />
      <rect x="8" y="14" width="8" height="6" rx="1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  rule: (
    <>
      <path d="M4 4h16v4H4z" />
      <path d="M4 12h10v4H4z" />
      <path d="M4 20h6" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" />
      <rect x="12" y="8" width="3" height="9" rx="0.5" />
      <rect x="17" y="5" width="3" height="12" rx="0.5" />
    </>
  ),
};

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyState({ icon = 'chart', title, message, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <Card padding={6} variant="muted">
        <Stack gap={3} align="center">
          <div className="empty-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[icon]}
            </svg>
          </div>
          <Stack gap={1} align="center" style={{ maxWidth: '100%', textAlign: 'center' }}>
            <Text
              type="large"
              weight="medium"
              maxLines={2}
              hasTruncateTooltip
              style={{ width: '100%' }}
            >
              {title}
            </Text>
            {message && (
              <Text
                type="body"
                color="secondary"
                maxLines={3}
                hasTruncateTooltip
                style={{ width: '100%' }}
              >
                {message}
              </Text>
            )}
          </Stack>
          {children}
        </Stack>
      </Card>
    </div>
  );
}
