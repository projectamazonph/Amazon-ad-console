/**
 * Audit H-02: campaign manager metrics were displayed under the wrong
 * column headings. The row's 4-column metric block (CPC / Spend / Sales /
 * Orders) was rendered shifted left by one, so:
 *   - the "CPC" column actually showed spend
 *   - the "Spend" column actually showed sales
 *   - the "Sales" column actually showed orders
 *   - the "Orders" column actually showed cpc
 *
 * This test pins each column to the value it should display. The fixture
 * uses values that are pairwise distinct so a misalignment cannot pass
 * by accident.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ManagerCampaignsTab } from '../details/ManagerCampaignsTab';
import type { Campaign } from '@/engine/ad-console/types';

const METRICS = {
  impressions: 10000,
  clicks: 100,
  spend: 25,    // $25 spend
  sales: 200,   // $200 sales (distinct from spend)
  orders: 4,    // 4 orders (distinct from clicks)
};
// Derived: cpc = 25 / 100 = $0.25
//          ctr = 100 / 10000 = 1.0%
//          acos = 25 / 200 = 12.5%
//          roas = 200 / 25 = 8.00x
//          cvr  = 4 / 100 = 4.0%
// These are all distinct, so swapping columns will be caught.

const FIXTURE_CAMPAIGN: Campaign = {
  id: 'cmp-1',
  type: 'SP',
  name: 'Audit Fixture',
  portfolio: 'Default',
  status: 'Enabled',
  dailyBudget: 50,
  defaultBid: 0.75,
  startDate: '2026-01-01',
  endDate: null,
  targetingMode: 'Manual keyword',
  adFormat: 'Standard',
  bidStrategy: 'Fixed bids',
  placements: { top: 0, product: 0, rest: 0 },
  products: [],
  creative: null,
  metrics: METRICS,
  adGroups: [],
  targets: [],
  searchTerms: [],
  negatives: [],
  budgetRules: [],
  productAds: [],
  ads: [],
  history: [],
};

const noop = () => undefined;

beforeEach(() => {
  // The Archive button uses window.confirm — jsdom defaults to true,
  // but make it explicit so future changes can't quietly break this.
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ManagerCampaignsTab — column alignment (H-02)', () => {
  it('renders a row with the right metric under each column header', () => {
    const { container } = render(
      <ManagerCampaignsTab
        campaigns={[FIXTURE_CAMPAIGN]}
        onSelect={noop}
        onToggleStatus={noop}
        onDuplicate={noop}
        onArchive={noop}
        onCreate={noop}
        onClearFilters={noop}
        hasAnyCampaigns={true}
      />,
    );

    // Locate the first data row and grab every <td> in order.
    const tbody = container.querySelector('tbody');
    expect(tbody).not.toBeNull();
    const cells = tbody!.querySelectorAll('td');
    expect(cells.length).toBeGreaterThan(0);

    // Headers are: Campaign, Type, Creative, Status, Budget, Targeting,
    // Impr., Clicks, CPC, Spend, Sales, Orders, ACOS, ROAS, Actions
    // (15 columns, 15 cells expected)
    expect(cells.length).toBe(15);

    const cellText = (idx: number) => cells[idx]?.textContent?.trim() ?? '';

    // The bug: CPC column showed $25.00 (spend), Spend showed $200.00 (sales),
    // Sales showed "4" (orders), Orders showed "$0.25" (cpc).
    // After fix:
    expect(cellText(8)).toBe('$0.25');  // CPC
    expect(cellText(9)).toBe('$25.00'); // Spend
    expect(cellText(10)).toBe('$200.00');// Sales
    expect(cellText(11)).toBe('4');     // Orders
    expect(cellText(12)).toBe('12.5%'); // ACOS
    expect(cellText(13)).toBe('8.00x'); // ROAS
  });

  it('shows the "create your first campaign" empty state when there are no campaigns at all', () => {
    render(
      <ManagerCampaignsTab
        campaigns={[]}
        onSelect={noop}
        onToggleStatus={noop}
        onDuplicate={noop}
        onArchive={noop}
        onCreate={noop}
        onClearFilters={noop}
        hasAnyCampaigns={false}
      />,
    );
    expect(screen.getByText('No campaigns yet')).toBeDefined();
  });

  it('shows a "no matches" empty state (not "create your first campaign") when filters yield zero results', () => {
    render(
      <ManagerCampaignsTab
        campaigns={[]}
        onSelect={noop}
        onToggleStatus={noop}
        onDuplicate={noop}
        onArchive={noop}
        onCreate={noop}
        onClearFilters={noop}
        hasAnyCampaigns={true}
      />,
    );
    expect(screen.getByText('No campaigns match your filters')).toBeDefined();
    expect(screen.queryByText('No campaigns yet')).toBeNull();
    expect(screen.getByText('Clear filters')).toBeDefined();
  });

  it('renders one row per campaign', () => {
    const a = { ...FIXTURE_CAMPAIGN, id: 'a', name: 'Alpha' };
    const b = { ...FIXTURE_CAMPAIGN, id: 'b', name: 'Bravo' };
    const { container } = render(
      <ManagerCampaignsTab
        campaigns={[a, b]}
        onSelect={noop}
        onToggleStatus={noop}
        onDuplicate={noop}
        onArchive={noop}
        onCreate={noop}
        onClearFilters={noop}
        hasAnyCampaigns={true}
      />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(within(rows[0] as HTMLElement).getByText('Alpha')).toBeDefined();
    expect(within(rows[1] as HTMLElement).getByText('Bravo')).toBeDefined();
  });
});
