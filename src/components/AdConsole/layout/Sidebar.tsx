'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getLeftRail, isSidebarItemActive, resolveSidebarClick, sidebarSectionForView, type RailSection } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
  training: 'Training',
};

export function Sidebar() {
  const view = useAdConsoleStore((s) => s.view);
  const selectedTab = useAdConsoleStore((s) => s.state.selectedTab);
  const setView = useAdConsoleStore((s) => s.setView);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  // The left rail reflects the active global-nav section. Pulled into
  // `sidebarSectionForView` so the topbar and sidebar stay in sync (H-03).
  const section: RailSection = sidebarSectionForView(view);
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
              className={`sidebar-item ${
                isSidebarItemActive(item, view, selectedTab) ? 'active' : ''
              }`}
              onClick={() => {
                const action = resolveSidebarClick(item, view);
                if (action.type === 'setTab') setTab(action.tab!);
                else if (action.type === 'setTabAndView') { setTab(action.tab!); setView(action.view!); }
                else setView(action.view!);
              }}
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
