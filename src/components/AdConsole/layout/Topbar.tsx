'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { GLOBAL_NAV, activeTopbarSection } from '../nav/consoleNav';
import { MobileNav } from '../mobile/MobileNav';
import { UserMenu } from '@/components/UserMenu';
import { SyncButton } from '@/components/SyncButton';

export function Topbar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);
  const resetAll = useAdConsoleStore((s) => s.resetAll);

  // The active global-nav section follows the current view. Extracted to
  // `activeTopbarSection` so the wiring for the 6 training views stays
  // in one place (audit H-03). We compare against `section.key`, not
  // `section.view`, because the Training section's key is 'training'
  // while its nav target is 'drills' (one of 6 training views).
  const activeSection = activeTopbarSection(view);

  return (
    <nav className="app-navbar" aria-label="Global">
      <MobileNav />
      <div className="nav-brand">
        Project Amazon PH <span className="brand-sub">Ad Console Simulator</span>
      </div>
      {GLOBAL_NAV.map((section) => (
        <button
          key={section.key}
          type="button"
          className={`nav-section ${activeSection === section.key ? 'active' : ''}`}
          aria-current={activeSection === section.key ? 'page' : undefined}
          onClick={() => setView(section.view)}
        >
          {section.label}
        </button>
      ))}
      <div className="nav-spacer" />
      <button
        type="button"
        className="nav-sim-btn"
        onClick={() => runSimulation()}
        title="Run 7-day simulation"
      >
        Run sim
      </button>
      <button
        type="button"
        className="nav-sim-btn"
        onClick={() => { if (confirm('Reset all data?')) resetAll(); }}
        title="Reset sandbox"
      >
        Reset
      </button>
      <SyncButton />
      <UserMenu />
    </nav>
  );
}
