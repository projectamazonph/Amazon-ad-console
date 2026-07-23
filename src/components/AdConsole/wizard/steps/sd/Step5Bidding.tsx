'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Step5BiddingProps {
  isActive: boolean;
  isComplete: boolean;
}

const showBidError = (bid: number) => bid < 0.02;

export function Step5BiddingSD({ isActive, isComplete }: Step5BiddingProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Bidding</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Set default bid for Sponsored Display campaigns.
      </p>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="sd5-bid">Default bid</label>
          <input
            id="sd5-bid"
            className="input full"
            type="number"
            min={0.02}
            step={0.01}
            value={draft.defaultBid}
            onChange={(e) => updateDraft('defaultBid', Number(e.target.value))}
            style={showBidError(draft.defaultBid) ? { borderColor: 'var(--danger)' } : {}}
          />
          {showBidError(draft.defaultBid) && (
            <small style={{ color: 'var(--danger)' }}>Minimum bid is $0.02.</small>
          )}
        </div>
      </div>
    </div>
  );
}
