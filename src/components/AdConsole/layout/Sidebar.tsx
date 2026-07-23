'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import {
  getLeftRail,
  isSidebarItemActive,
  resolveSidebarClick,
  sidebarSectionForView,
  type RailSection,
} from '../nav/consoleNav';
import { SideNav, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav';
import { Text } from '@astryxdesign/core/Text';
import { navIconFor, RefreshIcon, PlayFilledIcon } from './navIcons';

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

  const section: RailSection = sidebarSectionForView(view);
  const items = getLeftRail(section);

  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    (groups[item.group] ??= []).push(item);
  }

  const header = (
    <Text
      type="supporting"
      size="xs"
      weight="medium"
      maxLines={1}
      hasTruncateTooltip
      style={{
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--ink-500, #5f6b7a)',
        padding: '0 12px',
      }}
    >
      {GROUP_TITLES[section] ?? ''}
    </Text>
  );

  const footer = (
    <div style={{ display: 'grid', gap: 4, padding: '0 8px' }}>
      <button
        type="button"
        className="sidebar-action"
        onClick={() => runSimulation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          color: 'var(--ink-700, #2b3947)',
          font: 'inherit',
          fontSize: 'var(--text-sm, 0.875rem)',
          textAlign: 'left',
          width: '100%',
          minWidth: 0,
        }}
      >
        <PlayFilledIcon size={16} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Run 7-day sim
        </span>
      </button>
      <button
        type="button"
        className="sidebar-action"
        onClick={() => {
          if (confirm('Reset all data?')) resetAll();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          color: 'var(--ink-700, #2b3947)',
          font: 'inherit',
          fontSize: 'var(--text-sm, 0.875rem)',
          textAlign: 'left',
          width: '100%',
          minWidth: 0,
        }}
      >
        <RefreshIcon size={16} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Reset sandbox
        </span>
      </button>
    </div>
  );

  return (
    <SideNav
      header={header}
      footer={footer}
      className="amazon-sidebar"
      xstyle={{
        backgroundColor: 'var(--surface-1, #ffffff)',
        color: 'var(--ink-900, #0f1111)',
        borderRight: '1px solid var(--border, #d5d9d9)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {Object.entries(groups).map(([group, groupItems]) => (
        <SideNavSection key={group} title={GROUP_TITLES[group]}>
          {groupItems.map((item) => {
            const isSelected = isSidebarItemActive(item, view, selectedTab);
            return (
              <SideNavItem
                key={item.label}
                className="sidebar-item"
                label={item.label}
                icon={navIconFor(item.label, isSelected)}
                isSelected={isSelected}
                onClick={() => {
                  const action = resolveSidebarClick(item, view);
                  if (action.type === 'setTab') setTab(action.tab!);
                  else if (action.type === 'setTabAndView') {
                    setTab(action.tab!);
                    setView(action.view!);
                  } else setView(action.view!);
                }}
              />
            );
          })}
        </SideNavSection>
      ))}
    </SideNav>
  );
}
