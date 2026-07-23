'use client';

import type { ReactNode } from 'react';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface WizardStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  isActive: boolean;
  isComplete: boolean;
}

export function WizardStep({
  stepNumber,
  title,
  description,
  children,
  isActive,
  isComplete,
}: WizardStepProps) {
  if (!isActive && !isComplete) return null;

  return (
    <div className="wizard-step">
      <Stack gap={2}>
        <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h2">
          {title}
        </Text>
        {description && (
          <Text type="supporting" color="secondary" maxLines={2} hasTruncateTooltip>
            {description}
          </Text>
        )}
        {children}
      </Stack>
    </div>
  );
}
