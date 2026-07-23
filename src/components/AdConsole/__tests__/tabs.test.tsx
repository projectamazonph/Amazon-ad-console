/**
 * TDD tests for extracted tab components.
 * Each tab receives campaign + actions via props (DIP).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OverviewTab } from '../details/OverviewTab';
import { AdGroupsTab } from '../details/AdGroupsTab';
import { TargetsTab } from '../details/TargetsTab';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/types';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function getFirstCampaign(): Campaign {
  return useAdConsoleStore.getState().state.campaigns[0]!;
}

describe('OverviewTab', () => {
  beforeEach(() => resetStore());

  it('renders campaign settings heading', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    expect(screen.getByText('Campaign settings')).toBeDefined();
  });

  it('renders products section', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    expect(screen.getByText('Products')).toBeDefined();
  });

  it('renders bid strategy dropdown', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    expect(screen.getByText('Bid strategy')).toBeDefined();
  });

  it('sets the selected campaign status instead of toggling it', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'Archived' },
    });

    const updated = useAdConsoleStore
      .getState()
      .state.campaigns.find((campaign) => campaign.id === c.id);
    expect(updated?.status).toBe('Archived');
  });
});

describe('AdGroupsTab', () => {
  beforeEach(() => resetStore());

  it('renders ad groups table when groups exist', () => {
    const c = getFirstCampaign();
    render(<AdGroupsTab campaign={c} />);
    expect(screen.getByText('Ad group')).toBeDefined();
  });

  it('shows empty state when no ad groups', () => {
    const c = getFirstCampaign();
    const emptyCampaign = { ...c, adGroups: [] };
    render(<AdGroupsTab campaign={emptyCampaign} />);
    expect(screen.getByText('No ad groups')).toBeDefined();
  });

  it('renders add ad group form', () => {
    const c = getFirstCampaign();
    render(<AdGroupsTab campaign={c} />);
    expect(screen.getByText('+ Add ad group')).toBeDefined();
  });
});

describe('TargetsTab', () => {
  beforeEach(() => resetStore());

  it('renders targets table when targets exist', () => {
    const c = getFirstCampaign();
    render(<TargetsTab campaign={c} />);
    expect(screen.getByText('Target')).toBeDefined();
  });

  it('shows empty state when no targets', () => {
    const c = getFirstCampaign();
    const emptyCampaign = { ...c, targets: [] };
    render(<TargetsTab campaign={emptyCampaign} />);
    expect(screen.getByText(/No targets/)).toBeDefined();
  });
});
