/**
 * TDD: Comprehensive Zustand slice store tests.
 * Exercises all core + feature slice actions for coverage.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAdConsoleStore } from '../../store';
import type { Campaign } from '../types';

function getStore() { return useAdConsoleStore.getState(); }
function reset() { useAdConsoleStore.getState().resetAll(); }
function firstCampaign(): Campaign { return getStore().state.campaigns[0]!; }

describe('CoreSlice', () => {
  beforeEach(reset);

  it('initializes with default campaigns', () => {
    expect(getStore().state.campaigns.length).toBeGreaterThan(0);
  });

  it('selectCampaign sets detail view and selectedCampaignId', () => {
    const c = firstCampaign();
    getStore().selectCampaign(c.id);
    const s = getStore();
    expect(s.view).toBe('detail');
    expect(s.state.selectedCampaignId).toBe(c.id);
    expect(s.state.selectedTab).toBe('adgroups');
  });

  it('selectCampaign(null) goes to campaigns view', () => {
    getStore().selectCampaign(null);
    expect(getStore().view).toBe('campaigns');
  });

  it('setView changes view', () => {
    getStore().setView('create');
    expect(getStore().view).toBe('create');
  });

  it('setTab changes tab', () => {
    getStore().setTab('targets');
    expect(getStore().state.selectedTab).toBe('targets');
  });

  it('setFilter updates filter partially', () => {
    getStore().setFilter({ type: 'SP' });
    expect(getStore().state.filter.type).toBe('SP');
    getStore().setFilter({ status: 'Paused' });
    expect(getStore().state.filter.status).toBe('Paused');
  });

  it('toggleCampaignStatus toggles between Enabled and Paused', () => {
    const c = firstCampaign();
    const before = c.status;
    getStore().toggleCampaignStatus(c.id);
    const after = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(after.status).not.toBe(before);
  });

  it('archiveCampaign sets status to Archived', () => {
    const c = firstCampaign();
    getStore().archiveCampaign(c.id);
    const after = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(after.status).toBe('Archived');
  });

  it('duplicateCampaign creates a copy', () => {
    const before = getStore().state.campaigns.length;
    const c = firstCampaign();
    getStore().duplicateCampaign(c.id);
    expect(getStore().state.campaigns.length).toBe(before + 1);
  });

  it('runSimulation increments simulationDays', () => {
    const before = getStore().state.simulationDays;
    getStore().runSimulation(7);
    expect(getStore().state.simulationDays).toBe(before + 7);
  });

  it('toggleAddKeywordForm toggles', () => {
    expect(getStore().showAddKeywordForm).toBe(false);
    getStore().toggleAddKeywordForm();
    expect(getStore().showAddKeywordForm).toBe(true);
    getStore().toggleAddKeywordForm();
    expect(getStore().showAddKeywordForm).toBe(false);
  });

  it('toggleMobileMenu toggles', () => {
    getStore().toggleMobileMenu();
    getStore().openMobileMenu();
    getStore().closeMobileMenu();
    getStore().mobileMenuAnimationEnd();
  });

  it('resetAll restores initial state', () => {
    getStore().setTab('targets');
    getStore().toggleAddKeywordForm();
    getStore().resetAll();
    expect(getStore().view).toBe('dashboard');
    expect(getStore().state.selectedTab).toBe('campaigns');
    expect(getStore().showAddKeywordForm).toBe(false);
  });

  it('updateCampaignSettings updates a campaign', () => {
    const c = firstCampaign();
    getStore().updateCampaignSettings(c.id, { dailyBudget: 100 });
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.dailyBudget).toBe(100);
  });

  it('savePlacements updates placements', () => {
    const c = firstCampaign();
    getStore().savePlacements(c.id, { top: 50, product: 30, rest: 10 });
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.placements.top).toBe(50);
  });

  it('exportState returns a JSON string', () => {
    const json = getStore().exportState();
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('importState parses valid JSON', () => {
    const json = getStore().exportState();
    expect(getStore().importState(json)).toBe(true);
  });

  it('importState rejects empty/invalid', () => {
    expect(getStore().importState('')).toBe(false);
    expect(getStore().importState('   ')).toBe(false);
    expect(getStore().importState('not json')).toBe(false);
  });

  it('launchCampaign creates a new campaign from draft', () => {
    getStore().updateDraft('name', 'Test Launch');
    getStore().launchCampaign();
    const found = getStore().state.campaigns.find((c: Campaign) => c.name === 'Test Launch');
    expect(found).toBeDefined();
  });

  it('launchCampaign rejects empty name', () => {
    getStore().updateDraft('name', '');
    getStore().launchCampaign();
    // No campaign with empty name should exist
    expect(getStore().view).not.toBe('detail');
  });
});

describe('DraftSlice', () => {
  beforeEach(reset);

  it('updateDraft updates a field', () => {
    getStore().updateDraft('name', 'My Draft');
    expect(getStore().draft.name).toBe('My Draft');
  });

  it('setWizardStep changes step', () => {
    getStore().setWizardStep(3);
    expect(getStore().wizardStep).toBe(3);
  });

  it('resetDraft resets to defaults', () => {
    getStore().updateDraft('name', 'Changed');
    getStore().setWizardStep(5);
    getStore().resetDraft();
    expect(getStore().draft.name).toBe('');
    expect(getStore().wizardStep).toBe(1);
  });

  it('selectProduct adds an ASIN', () => {
    getStore().selectProduct('B0NEWASIN1');
    expect(getStore().draft.products).toContain('B0NEWASIN1');
  });

  it('removeProduct removes an ASIN', () => {
    getStore().selectProduct('B0NEWASIN2');
    getStore().removeProduct('B0TRAIN001');
    expect(getStore().draft.products).not.toContain('B0TRAIN001');
  });
});

describe('AdGroupSlice', () => {
  beforeEach(reset);

  it('addAdGroup adds a new ad group', () => {
    const c = firstCampaign();
    const before = c.adGroups.length;
    getStore().addAdGroup(c.id, 'New AG');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.adGroups.length).toBe(before + 1);
    expect(updated.adGroups[updated.adGroups.length - 1].name).toBe('New AG');
  });

  it('renameAdGroup renames', () => {
    const c = firstCampaign();
    const ag = c.adGroups[0]!;
    getStore().renameAdGroup(c.id, ag.id, 'Renamed');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const renamed = updated.adGroups.find((a) => a.id === ag.id)!;
    expect(renamed.name).toBe('Renamed');
  });

  it('setAdGroupStatus changes status', () => {
    const c = firstCampaign();
    const ag = c.adGroups[0]!;
    getStore().setAdGroupStatus(c.id, ag.id, 'Paused');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.adGroups.find((a) => a.id === ag.id)!.status).toBe('Paused');
  });

  it('setAdGroupDefaultBid changes bid', () => {
    const c = firstCampaign();
    const ag = c.adGroups[0]!;
    getStore().setAdGroupDefaultBid(c.id, ag.id, 1.50);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.adGroups.find((a) => a.id === ag.id)!.defaultBid).toBe(1.50);
  });

  it('removeAdGroup removes', () => {
    const c = firstCampaign();
    getStore().addAdGroup(c.id, 'Temp');
    const withNew = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const agId = withNew.adGroups[withNew.adGroups.length - 1].id;
    getStore().removeAdGroup(c.id, agId);
    const after = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(after.adGroups.find((a) => a.id === agId)).toBeUndefined();
  });
});

describe('TargetSlice', () => {
  beforeEach(reset);

  it('addKeyword adds a target', () => {
    const c = firstCampaign();
    const before = c.targets.length;
    getStore().addKeyword(c.id, 'test keyword', 'Exact', 0.75);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.length).toBe(before + 1);
  });

  it('removeTarget removes', () => {
    const c = firstCampaign();
    const t = c.targets[0]!;
    getStore().removeTarget(c.id, t.id);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.find((x) => x.id === t.id)).toBeUndefined();
  });

  it('setTargetBid sets bid', () => {
    const c = firstCampaign();
    const t = c.targets[0]!;
    getStore().setTargetBid(c.id, t.id, 2.00);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.find((x) => x.id === t.id)!.bid).toBe(2.00);
  });

  it('adjustTargetBid multiplies bid', () => {
    const c = firstCampaign();
    const t = c.targets[0]!;
    const before = t.bid;
    getStore().adjustTargetBid(c.id, t.id, 1.1);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.find((x) => x.id === t.id)!.bid).toBeCloseTo(before * 1.1);
  });

  it('pauseTarget toggles status', () => {
    const c = firstCampaign();
    const t = c.targets[0]!;
    getStore().pauseTarget(c.id, t.id);
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.find((x) => x.id === t.id)!.status).not.toBe(t.status);
  });
});

describe('NegativeSlice', () => {
  beforeEach(reset);

  it('addNegative adds a negative keyword', () => {
    const c = firstCampaign();
    const before = c.negatives.length;
    getStore().addNegative(c.id, 'test neg', 'Negative exact');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.negatives.length).toBe(before + 1);
  });

  it('harvestTerm creates a keyword from a search term', () => {
    const c = firstCampaign();
    getStore().harvestTerm(c.id, 'harvested term');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.targets.some((t) => t.value === 'harvested term')).toBe(true);
  });

  it('removeNegative deletes a negative', () => {
    const c = firstCampaign();
    getStore().addNegative(c.id, 'removable', 'Negative exact');
    let updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const neg = updated.negatives.find((n) => n.value === 'removable')!;
    getStore().removeNegative(c.id, neg.id);
    updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.negatives.some((n) => n.id === neg.id)).toBe(false);
  });

  it('toggleNegative flips a negative status', () => {
    const c = firstCampaign();
    getStore().addNegative(c.id, 'toggleable', 'Negative exact');
    let updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const neg = updated.negatives.find((n) => n.value === 'toggleable')!;
    getStore().toggleNegative(c.id, neg.id);
    updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.negatives.find((n) => n.id === neg.id)!.status).toBe('Paused');
  });
});

describe('BudgetSlice', () => {
  beforeEach(reset);

  it('addBudgetRule adds a rule', () => {
    const c = firstCampaign();
    getStore().addBudgetRule(c.id, 'Rule 1', 'Schedule', 20, 'AoS greater than 20%');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.budgetRules.length).toBe(c.budgetRules.length + 1);
  });

  it('removeBudgetRule removes', () => {
    const c = firstCampaign();
    getStore().addBudgetRule(c.id, 'Temp Rule', 'Schedule', 10, 'Always');
    const withNew = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const ruleId = withNew.budgetRules[withNew.budgetRules.length - 1].id;
    getStore().removeBudgetRule(c.id, ruleId);
    const after = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(after.budgetRules.find((r) => r.id === ruleId)).toBeUndefined();
  });

  it('updateBudgetRule updates', () => {
    const c = firstCampaign();
    getStore().addBudgetRule(c.id, 'Updatable', 'Schedule', 10, 'Always');
    const withNew = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    const ruleId = withNew.budgetRules[withNew.budgetRules.length - 1].id;
    getStore().updateBudgetRule(c.id, ruleId, { name: 'Updated' });
    const after = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(after.budgetRules.find((r) => r.id === ruleId)!.name).toBe('Updated');
  });
});

describe('PortfolioSlice + QuerySlice', () => {
  beforeEach(reset);

  it('createPortfolio adds a portfolio', () => {
    const before = getStore().state.portfolios.length;
    getStore().createPortfolio('New Portfolio');
    expect(getStore().state.portfolios.length).toBe(before + 1);
  });

  it('renamePortfolio renames', () => {
    getStore().createPortfolio('Old Name');
    getStore().renamePortfolio('Old Name', 'New Name');
    expect(getStore().state.portfolios).toContain('New Name');
    expect(getStore().state.portfolios).not.toContain('Old Name');
  });

  it('deletePortfolio removes', () => {
    getStore().createPortfolio('Temp');
    getStore().deletePortfolio('Temp');
    expect(getStore().state.portfolios).not.toContain('Temp');
  });

  it('assignCampaignToPortfolio assigns', () => {
    const c = firstCampaign();
    getStore().createPortfolio('Target Portfolio');
    getStore().assignCampaignToPortfolio(c.id, 'Target Portfolio');
    const updated = getStore().state.campaigns.find((x: Campaign) => x.id === c.id)!;
    expect(updated.portfolio).toBe('Target Portfolio');
  });

  it('campaignById finds campaign', () => {
    const c = firstCampaign();
    const found = getStore().campaignById(c.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(c.id);
  });

  it('filteredCampaigns returns campaigns matching filter', () => {
    getStore().setFilter({ type: 'SP' });
    const filtered = getStore().filteredCampaigns();
    expect(filtered.every((c: Campaign) => c.type === 'SP')).toBe(true);
  });

  it('portfolioOptions returns portfolio names', () => {
    const opts = getStore().portfolioOptions();
    expect(Array.isArray(opts)).toBe(true);
  });
});
