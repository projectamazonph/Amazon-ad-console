'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

export function Topbar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const state = useAdConsoleStore((s) => s.state);

  return (
    <header className="app-topbar">
      <div>
        {view === 'detail' && (
          <button className="btn" onClick={() => setView('campaigns')}>
            ← Back to campaigns
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="pill">Training Account</span>
        <button className="btn primary small" onClick={() => setView('create')}>
          + Create campaign
        </button>
      </div>
    </header>
  );
}
