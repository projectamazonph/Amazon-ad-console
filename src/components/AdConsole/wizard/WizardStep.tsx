'use client';

import type { ReactNode } from 'react';

interface WizardStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  isActive: boolean;
  isComplete: boolean;
}

export function WizardStep({ stepNumber, title, description, children, isActive, isComplete }: WizardStepProps) {
  if (!isActive && !isComplete) return null;
  
  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
