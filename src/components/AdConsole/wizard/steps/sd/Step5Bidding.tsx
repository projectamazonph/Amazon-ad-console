'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Step5BiddingSDProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step5BiddingSD({ isActive, isComplete }: Step5BiddingSDProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <div className="wizard-step-header">
        <h2>Bidding</h2>
        <p>Set default bid.</p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="sd5-bid">Default bid</label>
          <input
            id="sd5-bid"
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
      </div>
    </div>
  );
}
