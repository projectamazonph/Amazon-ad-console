'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Step5BiddingSBProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step5BiddingSB({ isActive, isComplete }: Step5BiddingSBProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Bidding</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Set default bid and placement adjustments.</p>

      <div className="form-grid">
        <div className="field">
          <label>Default bid</label>
          <input
            className="input full"
            type="number"
            min="0.02"
            step="0.01"
            value={draft.defaultBid}
            onChange={(e) => updateDraft('defaultBid', Number(e.target.value))}
            style={draft.defaultBid < 0.02 ? { borderColor: 'var(--danger)' } : {}}
          />
          {draft.defaultBid < 0.02 && <small style={{ color: 'var(--danger)' }}>Minimum bid is $0.02.</small>}
        </div>
        <div className="field">
          <label>Top of Search (%)</label>
          <input className="input full" type="number" min="0" max="900" value={draft.placements.top} onChange={(e) => updateDraft('placements', { ...draft.placements, top: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}
