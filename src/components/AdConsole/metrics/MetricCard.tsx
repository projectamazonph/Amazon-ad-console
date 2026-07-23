'use client';

import { Card } from '@astryxdesign/core/Card';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: '' | 'good' | 'bad';
}

export function MetricCard({ label, value, delta, tone = '' }: MetricCardProps) {
  return (
    <Card variant="default" className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${tone}`}>{delta}</div>}
    </Card>
  );
}
