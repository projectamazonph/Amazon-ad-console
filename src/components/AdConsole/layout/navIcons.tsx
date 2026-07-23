/**
 * Amazon Advertising Console — nav icons.
 *
 * Inline SVGs matching the visual language of advertising.amazon.com
 * (rounded line icons, 20x20, currentColor stroke, 1.6 weight).
 * Use them in SideNavItem `icon` / `selectedIcon` props.
 */

import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export function DashboardIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" />
      <rect x="12" y="8" width="3" height="9" rx="0.5" />
      <rect x="17" y="5" width="3" height="12" rx="0.5" />
    </svg>
  );
}

export function PortfolioIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
    </svg>
  );
}

export function CampaignsIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M4 4h16v4H4z" />
      <path d="M4 12h10v4H4z" />
      <path d="M4 20h6" />
    </svg>
  );
}

export function AdGroupsIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="9" cy="12" r="6" />
      <path d="M3 12h12" />
      <path d="M15 12l6-4" />
      <path d="M15 12l6 4" />
    </svg>
  );
}

export function TargetIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function BlockIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </svg>
  );
}

export function RulesIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M4 4h16v4H4z" />
      <path d="M4 12h10v4H4z" />
      <path d="M4 20h6" />
    </svg>
  );
}

export function PlayIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function FlagIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M4 4v16" />
      <path d="M4 4h12l-2 4 2 4H4" />
    </svg>
  );
}

export function ReportIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
    </svg>
  );
}

export function BulkIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}

export function TrainerIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

export function IntegrityIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function DrillsIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MissionsIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M5 4v16l5-2 4 2 5-2V4l-5 2-4-2-5 2z" />
      <path d="M10 4v14" />
      <path d="M14 6v14" />
    </svg>
  );
}

export function RefreshIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg {...baseProps(size)}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function PlayFilledIcon({ size = 20 }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** Maps consoleNav label -> icon component for SideNavItem. */
export function navIconFor(label: string, selected: boolean): ReactNode {
  const map: Record<string, (p: IconProps) => ReactNode> = {
    Campaigns: TargetIcon,
    'Ad groups': AdGroupsIcon,
    Targeting: TargetIcon,
    'Search terms': SearchIcon,
    'Negative keywords': BlockIcon,
    Portfolios: PortfolioIcon,
    'Budget rules': RulesIcon,
    'Sponsored Products': CampaignsIcon,
    'Sponsored Brands': CampaignsIcon,
    'Sponsored Display': CampaignsIcon,
    'Search catalog': SearchIcon,
    'Search query performance': SearchIcon,
    Drills: DrillsIcon,
    Missions: MissionsIcon,
    Reports: ReportIcon,
    'Bulk ops': BulkIcon,
    Trainer: TrainerIcon,
    Integrity: IntegrityIcon,
  };
  const Icon = map[label] ?? DashboardIcon;
  return selected ? <Icon size={20} /> : <Icon size={20} />;
}

export function CloseIcon({ size = 20 }: { size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function MenuIcon({ size = 20 }: { size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}
