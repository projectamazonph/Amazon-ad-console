'use client';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: '' | 'good' | 'bad';
}

export function MetricCard({ label, value, delta, tone = '' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${tone}`}>{delta}</div>}
    </div>
  );
}
