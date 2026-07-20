'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { AutoTargetSettings } from '@/engine/ad-console/types';
import { KeywordEntry } from '../../KeywordEntry';

interface Step4TargetingSPProps {
  isActive: boolean;
  isComplete: boolean;
}

const AUTO_GROUPS: { key: keyof AutoTargetSettings; label: string; hint: string }[] = [
  { key: 'closeMatch', label: 'Close match', hint: 'Shoppers using search terms closely related to your products' },
  { key: 'looseMatch', label: 'Loose match', hint: 'Shoppers using search terms loosely related to your products' },
  { key: 'substitutes', label: 'Substitutes', hint: 'Shoppers viewing detail pages of products similar to yours' },
  { key: 'complements', label: 'Complements', hint: 'Shoppers viewing detail pages of products that pair with yours' },
];

export function Step4TargetingSP({ isActive, isComplete }: Step4TargetingSPProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [asinTargets, setAsinTargets] = useState(draft.asinTargets || '');
  const [categoryTargets, setCategoryTargets] = useState(draft.categoryTargets || '');

  const setAutoGroup = (key: keyof AutoTargetSettings, patch: Partial<AutoTargetSettings[typeof key]>) => {
    updateDraft('autoTargets', {
      ...draft.autoTargets,
      [key]: { ...draft.autoTargets[key], ...patch },
    } as never);
  };

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Targeting</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Choose targeting method and add targets.</p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Targeting mode</label>
        <select className="select full" value={draft.targetingMode} onChange={(e) => updateDraft('targetingMode', e.target.value)}>
          <option>Automatic</option>
          <option>Manual keyword</option>
          <option>Manual product</option>
        </select>
      </div>

      {draft.targetingMode === 'Automatic' && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Automatic targeting groups</h3><span>Set a bid per group</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Enabled</th><th>Targeting group</th><th>Bid</th></tr></thead>
              <tbody>
                {AUTO_GROUPS.map(({ key, label, hint }) => {
                  const group = draft.autoTargets[key];
                  return (
                    <tr key={key}>
                      <td>
                        <input type="checkbox" checked={group.enabled}
                          onChange={(e) => setAutoGroup(key, { enabled: e.target.checked })} />
                      </td>
                      <td>
                        <strong>{label}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>{hint}</div>
                      </td>
                      <td>
                        <input className="input" style={{ width: 90 }} type="number" min="0.02" max="999.99" step="0.01"
                          value={group.bid}
                          disabled={!group.enabled}
                          onChange={(e) => setAutoGroup(key, { bid: Number(e.target.value) })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {draft.targetingMode === 'Manual keyword' && <KeywordEntry />}

      {draft.targetingMode === 'Manual product' && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title"><h3>Product targeting</h3></div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>ASIN targets (one per line)</label>
            <textarea className="input full" rows={3} value={asinTargets} onChange={(e) => { setAsinTargets(e.target.value); updateDraft('asinTargets', e.target.value); }} placeholder="B0ABC123&#10;B0DEF456" />
          </div>
          <div className="field full" style={{ marginBottom: 12 }}>
            <label>Category targets (one per line)</label>
            <textarea className="input full" rows={3} value={categoryTargets} onChange={(e) => { setCategoryTargets(e.target.value); updateDraft('categoryTargets', e.target.value); }} placeholder="Coffee & Espresso Accessories&#10;Drinkware" />
          </div>
        </div>
      )}

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Bid strategy</label>
        <select className="select full" value={draft.bidStrategy} onChange={(e) => updateDraft('bidStrategy', e.target.value)}>
          <option>Dynamic bids - down only</option>
          <option>Dynamic bids - up and down</option>
          <option>Fixed bids</option>
        </select>
      </div>
    </div>
  );
}
