'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { MatchType } from '@/engine/ad-console/types';

const MATCH_TYPES: MatchType[] = ['Exact', 'Phrase', 'Broad'];

/**
 * Keyword targeting entry: one keyword box (one per line) plus match-type
 * checkboxes, so a keyword can be added under any combination of Exact /
 * Phrase / Broad at once instead of retyping it into three separate boxes.
 */
export function KeywordEntry() {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [keywords, setKeywords] = useState(draft.keywords || '');
  const selected = draft.keywordMatchTypes ?? ['Exact'];

  const toggleMatch = (mt: MatchType) => {
    const next = selected.includes(mt)
      ? selected.filter((m) => m !== mt)
      : [...selected, mt];
    updateDraft('keywordMatchTypes', next as never);
  };

  return (
    <div className="card pad" style={{ marginBottom: 16 }}>
      <div className="card-title"><h3>Keyword targeting</h3></div>
      <div className="field full" style={{ marginBottom: 12 }}>
        <label>Keywords (one per line)</label>
        <textarea
          className="input full"
          rows={5}
          value={keywords}
          onChange={(e) => { setKeywords(e.target.value); updateDraft('keywords', e.target.value); }}
          placeholder="coffee filter&#10;paper coffee filter&#10;reusable coffee filter"
        />
      </div>
      <div className="field full">
        <label>Match types</label>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
          {MATCH_TYPES.map((mt) => (
            <label key={mt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(mt)} onChange={() => toggleMatch(mt)} />
              {mt}
            </label>
          ))}
        </div>
        {selected.length === 0 ? (
          <small style={{ color: 'var(--danger)' }}>Select at least one match type.</small>
        ) : (
          <small className="muted">Each keyword is added under every selected match type.</small>
        )}
      </div>
    </div>
  );
}
