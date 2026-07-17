'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { GLOBAL_NAV, type NavView } from '../nav/consoleNav';

const SECTION_TO_VIEW: Record<string, NavView> = {
  campaigns: 'campaigns',
  portfolio: 'portfolio',
  dashboard: 'dashboard',
};

export function Topbar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const state = useAdConsoleStore((s) => s.state);

  // The active global-nav section follows the current view.
  const activeSection =
    view === 'portfolio'
      ? 'portfolio'
      : view === 'dashboard'
        ? 'dashboard'
        : 'campaigns';

  return (
    <nav className="app-navbar" aria-label="Global">
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
      <div className="nav-account" title="Training account">
        <span>☰</span>
        <span>Training Account: Coffee Accessories US</span>
      </div>
      <button className="btn primary small" onClick={() => setView('create')}>
        + Create campaign
      </button>
    </nav>
  );
}
