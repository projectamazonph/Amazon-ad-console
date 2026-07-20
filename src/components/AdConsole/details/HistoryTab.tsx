import type { Campaign } from '@/engine/ad-console/types';

interface Props { campaign: Campaign }

export function HistoryTab({ campaign }: Props) {
  if (!campaign.history.length) {
    return (
      <div className="empty">
        
        <h3>No history</h3>
        <p>Campaign changes will appear here as you make edits and run simulations.</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Event</th></tr></thead>
        <tbody>
          {campaign.history.map((h, i) => (
            <tr key={i}><td><span className="muted">{h}</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
