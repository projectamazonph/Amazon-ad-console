'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getLeftRail, type NavView } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
};

export function Sidebar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  // The left rail reflects the active global-nav section.
  const section: NavView = view === 'portfolio' ? 'portfolio' : 'campaigns';
  const items = getLeftRail(section);

  // Group items by their area for Amazon-style sectioned rail.
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    (groups[item.group] ??= []).push(item);
  }

  return (
    <nav className="app-sidebar" aria-label="Console sections">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group}>
          <div className="sidebar-group-title">{GROUP_TITLES[group]}</div>
          {groupItems.map((item) => (
            <div
              key={item.label}
              className={`sidebar-item ${view === item.view && group === 'campaigns' ? 'active' : ''}`}
              onClick={() => setView(item.view)}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div className="sidebar-spacer" />
      <div
        className="sidebar-item"
        style={{ color: 'var(--ink-700)' }}
        onClick={() => runSimulation()}
      >
        Run 7-day sim
      </div>
      <div
        className="sidebar-item"
        style={{ color: 'var(--ink-700)' }}
        onClick={() => {
          if (confirm('Reset all data?')) resetAll();
        }}
      >
        Reset sandbox
      </div>
    </nav>
  );
}
