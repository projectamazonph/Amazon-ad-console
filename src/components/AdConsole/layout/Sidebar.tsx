'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getLeftRail, isSidebarItemActive, resolveSidebarClick, sidebarSectionForView, type RailSection } from '../nav/consoleNav';
import { SideNav } from '@astryxdesign/core/SideNav';
import { SideNavSection } from '@astryxdesign/core/SideNav';
import { SideNavItem } from '@astryxdesign/core/SideNav';

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

  return (
    <SideNav>
      {Object.entries(groups).map(([group, groupItems]) => (
        <SideNavSection key={group} title={GROUP_TITLES[group]}>
          {groupItems.map((item) => (
            <SideNavItem
              key={item.label}
              label={item.label}
              isSelected={isSidebarItemActive(item, view, selectedTab)}
              onClick={() => {
                const action = resolveSidebarClick(item, view);
                if (action.type === 'setTab') setTab(action.tab!);
                else if (action.type === 'setTabAndView') { setTab(action.tab!); setView(action.view!); }
                else setView(action.view!);
              }}
            />
          ))}
        </SideNavSection>
      ))}
      <SideNavSection title="Actions">
        <SideNavItem
          label="Run 7-day sim"
          onClick={() => runSimulation()}
        />
        <SideNavItem
          label="Reset sandbox"
          onClick={() => {
            if (confirm('Reset all data?')) resetAll();
          }}
        />
      </SideNavSection>
    </SideNav>
  );
}
