'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { GLOBAL_NAV, activeTopbarSection, type NavView } from '../nav/consoleNav';
import { MobileNav } from '../mobile/MobileNav';
import { UserMenu } from '@/components/UserMenu';
import { SyncButton } from '@/components/SyncButton';

const SECTION_TO_VIEW: Record<string, NavView> = {
  campaigns: 'campaigns',
  portfolio: 'portfolio',
  dashboard: 'dashboard',
  training: 'drills',
};

export function Topbar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);

  // The active global-nav section follows the current view. Extracted to
  // `activeTopbarSection` so the wiring for the 6 training views stays
  // in one place (audit H-03).
  const activeSection = activeTopbarSection(view);

  return (
    <nav className="app-navbar" aria-label="Global">
      <MobileNav />
      <div className="nav-brand">
        Amazon Ads <span className="brand-sub">Console</span>
      </div>
      {GLOBAL_NAV.map((section) => (
        <div
          key={section.view}
          className={`nav-section ${activeSection === section.view ? 'active' : ''}`}
          onClick={() => setView(SECTION_TO_VIEW[section.view] ?? 'campaigns')}
        >
          {section.label}
        </div>
      ))}
      <div className="nav-spacer" />
      <SyncButton />
      <UserMenu />
    </nav>
  );
}
