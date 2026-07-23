'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import {
  GLOBAL_NAV,
  activeTopbarSection,
  type NavView,
} from '../nav/consoleNav';
import { MobileNav } from '../mobile/MobileNav';
import { UserMenu } from '@/components/UserMenu';
import { SyncButton } from '@/components/SyncButton';
import { Text } from '@astryxdesign/core/Text';
import { MenuIcon } from './navIcons';

const SECTION_TO_VIEW: Record<string, NavView> = {
  campaigns: 'campaigns',
  portfolio: 'portfolio',
  dashboard: 'dashboard',
  training: 'drills',
};

export function Topbar() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);

  const activeSection = activeTopbarSection(view);

  return (
    <nav
      className="app-navbar amazon-topbar"
      aria-label="Global"
      style={{
        background: 'var(--nav-bg, #131921)',
        color: 'var(--nav-ink, #ffffff)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <MobileNav />

      <div className="nav-brand">
        <span style={{ fontWeight: 700 }}>Amazon Ads</span>{' '}
        <span className="brand-sub">Console</span>
      </div>

      {GLOBAL_NAV.map((section) => {
        const isActive = activeSection === section.view;
        return (
          <button
            key={section.view}
            type="button"
            className={`nav-section ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setView(SECTION_TO_VIEW[section.view] ?? 'campaigns')}
            style={{
              background: isActive ? 'var(--nav-bg-hover, #232f3e)' : 'transparent',
              color: 'var(--nav-ink, #ffffff)',
              border: 'none',
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'var(--text-sm, 0.875rem)',
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? '2px solid var(--accent, #ff9900)' : '2px solid transparent',
              borderRadius: 0,
              height: '100%',
              minWidth: 0,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Text
              type="body"
              size="sm"
              weight={isActive ? 'semibold' : 'normal'}
              maxLines={1}
              hasTruncateTooltip
              style={{ color: 'inherit' }}
            >
              {section.label}
            </Text>
          </button>
        );
      })}

      <div className="nav-spacer" />
      <SyncButton />
      <UserMenu />
    </nav>
  );
}
