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
  const filterType = useAdConsoleStore((s) => s.state.filter.type);
  const selectedTab = useAdConsoleStore((s) => s.state.selectedTab);
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

  // Active state tracks the current filter (for SP/SB/SD items) and the
  // selected tab (for tab items), not just the view — so only the chosen item
  // highlights.
  const isActive = (item: LeftRailItem): boolean => {
    if (item.filterType) return view === 'campaigns' && filterType === item.filterType;
    if (item.tab) return (view === 'detail' || view === 'campaigns') && selectedTab === item.tab;
    return view === item.view && !item.filterType;
  };

  return (
    <nav className="app-sidebar" aria-label="Console sections">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group}>
          <div className="sidebar-group-title">{GROUP_TITLES[group]}</div>
          {groupItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}

      <div>
        <div className="sidebar-group-title">{GROUP_TITLES.tools}</div>
        {getToolsRail().map((item) => (
          <button
            type="button"
            key={item.label}
            className={`sidebar-item ${view === item.view ? 'active' : ''}`}
            onClick={() => setView(item.view)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-spacer" />
      <button
        type="button"
        className="sidebar-item"
        style={{ color: 'var(--ink-700)' }}
        onClick={() => runSimulation()}
      >
        Run 7-day sim
      </button>
      <button
        type="button"
        className="sidebar-item"
        style={{ color: 'var(--ink-700)' }}
        onClick={() => {
          if (confirm('Reset all data?')) resetAll();
        }}
      >
        Reset sandbox
      </button>
    </nav>
  );
}
