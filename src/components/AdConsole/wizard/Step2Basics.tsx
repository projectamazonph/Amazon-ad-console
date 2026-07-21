'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignStatus, CampaignDraft } from '@/engine/ad-console/types';

interface Step2BasicsProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step2Basics({ isActive, isComplete }: Step2BasicsProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Campaign basics</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Set campaign-level controls.</p>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="s2-name">Campaign name</label>
          <input
            id="s2-name"
            className="input full"
            value={draft.name}
            onChange={(e) => updateDraft('name', e.target.value)}
            placeholder={`${draft.type} | Manual | Training`}
            style={draft.name.trim() === '' && !isActive ? { borderColor: 'var(--danger)' } : {}}
          />
          {draft.name.trim() === '' && !isActive && <small style={{ color: 'var(--danger)' }}>Campaign name is required before launch.</small>}
        </div>
        <div className="field">
          <label htmlFor="s2-portfolio">Portfolio</label>
          <input id="s2-portfolio" className="input full" value={draft.portfolio} onChange={(e) => updateDraft('portfolio', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="s2-status">Status</label>
          <select id="s2-status" className="select full" value={draft.status} onChange={(e) => updateDraft('status', e.target.value as CampaignStatus)}>
            <option>Enabled</option><option>Paused</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="s2-budget">Daily budget</label>
          <input
            id="s2-budget"
            className="input full"
            type="number"
            min="1"
            value={draft.dailyBudget}
            onChange={(e) => updateDraft('dailyBudget', Number(e.target.value))}
            style={draft.dailyBudget < 1 ? { borderColor: 'var(--danger)' } : {}}
          />
          {draft.dailyBudget < 1 && <small style={{ color: 'var(--danger)' }}>Budget must be at least $1.</small>}
        </div>
        <div className="field">
          <label htmlFor="s2-start">Start date</label>
          <input id="s2-start" className="input full" type="date" value={draft.startDate} onChange={(e) => updateDraft('startDate', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="s2-end">End date (optional)</label>
          <input id="s2-end" className="input full" type="date" value={draft.endDate} onChange={(e) => updateDraft('endDate', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
