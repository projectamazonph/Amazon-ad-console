'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getLeftRail, getToolsRail, resolveSidebarClick, type NavView, type LeftRailItem } from '../nav/consoleNav';

const GROUP_TITLES: Record<string, string> = {
  campaigns: 'Campaign Manager',
  portfolios: 'Portfolios',
  measurement: 'Measurement',
  tools: 'Training tools',
};

export function Sidebar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const setFilter = useAdConsoleStore((s) => s.setFilter);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  // The left rail reflects the active global-nav section.
  const section: NavView = view === 'portfolio' ? 'portfolio' : view === 'dashboard' ? 'dashboard' : 'campaigns';
  const items = getLeftRail(section);

  // Group section items by their area for Amazon-style sectioned rail.
  const groups: Record<string, LeftRailItem[]> = {};
  for (const item of items) {
    (groups[item.group] ??= []).push(item);
  }

  const handleClick = (item: LeftRailItem) => {
    const action = resolveSidebarClick(item, view);
    if (action.type === 'filterAndView') {
      setFilter({ type: action.filterType! });
      setView(action.view!);
    } else if (action.type === 'setTab') {
      setTab(action.tab!);
    } else if (action.type === 'setTabAndView') {
      setTab(action.tab!);
      setView(action.view!);
    } else {
      setView(action.view!);
    }
  };

  const isActive = (item: LeftRailItem) =>
    item.tab ? view === 'detail' : view === item.view;

  return (
    <nav className="app-sidebar" aria-label="Console sections">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group}>
          <div className="sidebar-group-title">{GROUP_TITLES[group]}</div>
          {groupItems.map((item) => (
            <div
              key={item.label}
              className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleClick(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div>
        <div className="sidebar-group-title">{GROUP_TITLES.tools}</div>
        {getToolsRail().map((item) => (
          <div
            key={item.label}
            className={`sidebar-item ${view === item.view ? 'active' : ''}`}
            onClick={() => setView(item.view)}
          >
            {item.label}
          </div>
        ))}
      </div>

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
