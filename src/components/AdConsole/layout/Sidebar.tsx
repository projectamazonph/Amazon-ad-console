'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

const NAV_ITEMS = [
  { view: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
  { view: 'campaigns' as const, label: 'Campaign manager', icon: '📋' },
  { view: 'portfolio' as const, label: 'Portfolios', icon: '📁' },
];

export function Sidebar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);

  return (
    <nav className="app-sidebar">
      <div className="sidebar-brand">Ads Console</div>
      {NAV_ITEMS.map((item) => (
        <div
          key={item.view}
          className={`sidebar-item ${view === item.view ? 'active' : ''}`}
          onClick={() => setView(item.view)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <div className="sidebar-spacer" />
      <div className="sidebar-item" onClick={() => {
        if (typeof window !== 'undefined' && confirm('Reset all campaign data?')) {
          useAdConsoleStore.getState().resetAll();
        }
      }}>
        <span>🔄</span>
        <span>Reset</span>
      </div>
      <div className="sidebar-item" onClick={() => useAdConsoleStore.getState().runSimulation()}>
        <span>▶️</span>
        <span>Run 7-day sim</span>
      </div>
      <div className="sandbox-badge" style={{ padding: '8px 10px', marginTop: 4 }}>
        V{useAdConsoleStore((s) => s.state.version)} Training Sandbox
      </div>
    </nav>
  );
}
