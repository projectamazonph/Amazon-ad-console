import type { Campaign } from '@/engine/ad-console/types';
import { EmptyState } from './EmptyState';

interface Props { campaign: Campaign }

export function HistoryTab({ campaign }: Props) {
  if (!campaign.history.length) {
    return (
      <EmptyState
        icon="history"
        title="No history"
        message="Campaign changes will appear here as you make edits and run simulations."
      />
    );
  }
  return (
    <div className="card pad">
      <div className="section-head">
        <h2>Change history</h2>
        <span className="meta">{campaign.history.length} events</span>
      </div>
      <div className="timeline">
        {campaign.history.map((h, i) => (
          <div className="timeline-item" key={i}>{h}</div>
        ))}
      </div>
    </div>
  );
}
