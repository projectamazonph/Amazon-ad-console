'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

interface Step5BiddingProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step5BiddingSP({ isActive, isComplete }: Step5BiddingProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <div className="wizard-step-header">
        <h2>Bidding</h2>
        <p>Set default bid and placement adjustments.</p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="sp5-bid">Default bid</label>
          <input
            id="sp5-bid"
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
          <label htmlFor="sp5-top">Top of Search (%)</label>
          <input id="sp5-top" className="input full" type="number" min="0" max="900" value={draft.placements.top} onChange={(e) => updateDraft('placements', { ...draft.placements, top: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="sp5-product">Product pages (%)</label>
          <input id="sp5-product" className="input full" type="number" min="0" max="900" value={draft.placements.product} onChange={(e) => updateDraft('placements', { ...draft.placements, product: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="sp5-rest">Rest of Search (%)</label>
          <input id="sp5-rest" className="input full" type="number" min="0" max="900" value={draft.placements.rest} onChange={(e) => updateDraft('placements', { ...draft.placements, rest: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}
