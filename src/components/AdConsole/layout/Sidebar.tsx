'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

const NAV_ITEMS = [
  { view: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
  { view: 'campaigns' as const, label: 'Campaign manager', icon: '📋' },
  { view: 'portfolio' as const, label: 'Portfolios', icon: '📁' },
];

const FEATURE_ITEMS = [
  { view: 'missions' as const, label: 'Missions', icon: '🎯' },
  { view: 'drills' as const, label: 'Guided drills', icon: '🎮' },
  { view: 'reports' as const, label: 'Reports', icon: '📄' },
  { view: 'bulk' as const, label: 'Bulk operations', icon: '📦' },
  { view: 'integrity' as const, label: 'Integrity center', icon: '🔍' },
  { view: 'trainer' as const, label: 'Trainer dashboard', icon: '👨‍🏫' },
];

export function Sidebar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  return (
    <nav className="app-sidebar">
      <div className="sidebar-brand">Ads Console</div>
      <div style={{ fontSize: 11, color: 'var(--ink-300)', padding: '4px 10px', marginBottom: 4 }}>
        NAVIGATION
      </div>
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
      <div style={{ fontSize: 11, color: 'var(--ink-300)', padding: '4px 10px', marginTop: 8, marginBottom: 4 }}>
        TRAINING TOOLS
      </div>
      {FEATURE_ITEMS.map((item) => (
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
      <div className="sidebar-item" style={{ fontSize: 12 }} onClick={() => runSimulation()}>
        <span>▶️</span><span>Run 7-day sim</span>
      </div>
      <div className="sidebar-item" style={{ fontSize: 12 }} onClick={() => { if (confirm('Reset all data?')) resetAll(); }}>
        <span>🔄</span><span>Reset</span>
      </div>
      <div className="sandbox-badge" style={{ padding: '8px 10px', marginTop: 4 }}>
        V{useAdConsoleStore((s) => s.state.version)} Training Sandbox
      </div>
    </nav>
  );
}
