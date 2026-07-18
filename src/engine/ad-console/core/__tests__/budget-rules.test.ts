import { describe, it, expect } from 'vitest';
import {
  addBudgetRule,
  removeBudgetRule,
  updateBudgetRule,
} from '../engine';
import type { Campaign } from '../types';

function makeCampaign(over: Partial<Campaign> = {}): Campaign {
  return {
    id: 'C1',
    type: 'SP',
    name: 'Test',
    portfolio: 'Default',
    status: 'Enabled',
    dailyBudget: 10,
    defaultBid: 0.75,
    startDate: '2026-01-01',
    endDate: null,
    targetingMode: 'Automatic',
    adFormat: 'Standard',
    bidStrategy: 'Dynamic bids - down only',
    placements: { top: 0, product: 0, rest: 0 },
    products: ['B0TRAIN001'],
    creative: null,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
    adGroups: [{ id: 'AG1', campaignId: 'C1', name: 'AG', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 } }],
    targets: [],
    searchTerms: [],
    negatives: [],
    budgetRules: [],
    history: [],
    ...over,
  };
}

describe('addBudgetRule', () => {
  it('adds a schedule-type budget rule to a campaign', () => {
    const c = makeCampaign();
    const { campaign, rule } = addBudgetRule(c, 'Weekend boost', 'Schedule', 1.5, 'Saturday through Sunday');
    expect(campaign.budgetRules).toHaveLength(1);
    expect(rule.name).toBe('Weekend boost');
    expect(rule.type).toBe('Schedule');
    expect(rule.increase).toBe(1.5);
    expect(rule.condition).toBe('Saturday through Sunday');
    expect(rule.campaignId).toBe('C1');
  });

  it('adds a performance-type budget rule', () => {
    const c = makeCampaign();
    const { campaign } = addBudgetRule(c, 'ACoS trigger', 'Performance', 2.0, 'ACoS below 25%');
    expect(campaign.budgetRules[0]!.type).toBe('Performance');
  });

  it('appends to existing budget rules', () => {
    let c = makeCampaign();
    c = addBudgetRule(c, 'First', 'Schedule', 1.5, 'Weekdays').campaign;
    const { campaign } = addBudgetRule(c, 'Second', 'Performance', 2.0, 'Sales above $100');
    expect(campaign.budgetRules).toHaveLength(2);
  });

  it('fails fast on empty name', () => {
    expect(() => addBudgetRule(makeCampaign(), '   ', 'Schedule', 1.5, 'Weekdays')).toThrow();
  });

  it('fails fast on invalid type', () => {
    expect(() => addBudgetRule(makeCampaign(), 'Test', 'Invalid' as any, 1.5, 'cond')).toThrow();
  });

  it('fails fast on zero increase', () => {
    expect(() => addBudgetRule(makeCampaign(), 'Test', 'Schedule', 0, 'Weekdays')).toThrow();
  });

  it('fails fast on empty condition', () => {
    expect(() => addBudgetRule(makeCampaign(), 'Test', 'Schedule', 1.5, '   ')).toThrow();
  });

  it('logs history entry', () => {
    const { campaign } = addBudgetRule(makeCampaign(), 'Weekend boost', 'Schedule', 1.5, 'Sat-Sun');
    expect(campaign.history.some((h) => h.includes('Budget rule'))).toBe(true);
  });
});

describe('removeBudgetRule', () => {
  it('removes a budget rule by id', () => {
    const c = makeCampaign();
    const { campaign: withRule } = addBudgetRule(c, 'Boost', 'Schedule', 1.5, 'Weekends');
    const { campaign: removed } = removeBudgetRule(withRule, withRule.budgetRules[0]!.id);
    expect(removed.budgetRules).toHaveLength(0);
  });

  it('is a no-op when rule id not found', () => {
    const c = makeCampaign({ budgetRules: [{ id: 'BR1', campaignId: 'C1', name: 'X', type: 'Schedule', increase: 1.5, condition: 'Week' }] });
    const { campaign } = removeBudgetRule(c, 'NONEXISTENT');
    expect(campaign.budgetRules).toHaveLength(1);
  });

  it('removes only the matching rule', () => {
    let c = makeCampaign();
    c = addBudgetRule(c, 'First', 'Schedule', 1.5, 'A').campaign;
    c = addBudgetRule(c, 'Second', 'Performance', 2.0, 'B').campaign;
    const { campaign } = removeBudgetRule(c, c.budgetRules[0]!.id);
    expect(campaign.budgetRules).toHaveLength(1);
    expect(campaign.budgetRules[0]!.name).toBe('Second');
  });

  it('logs history entry', () => {
    const c = makeCampaign();
    const { campaign: withRule } = addBudgetRule(c, 'Boost', 'Schedule', 1.5, 'Weekends');
    const { campaign: removed } = removeBudgetRule(withRule, withRule.budgetRules[0]!.id);
    expect(removed.history.some((h) => h.includes('Budget rule'))).toBe(true);
  });
});

describe('updateBudgetRule', () => {
  it('updates name, type, increase, and condition of a rule', () => {
    const c = makeCampaign();
    const { campaign: withRule } = addBudgetRule(c, 'Old', 'Schedule', 1.5, 'Weekdays');
    const ruleId = withRule.budgetRules[0]!.id;
    const { campaign: updated } = updateBudgetRule(withRule, ruleId, { name: 'New', type: 'Performance', increase: 2.0, condition: 'ACoS < 30%' });
    const rule = updated.budgetRules.find((r) => r.id === ruleId)!;
    expect(rule.name).toBe('New');
    expect(rule.type).toBe('Performance');
    expect(rule.increase).toBe(2.0);
    expect(rule.condition).toBe('ACoS < 30%');
  });

  it('partially updates only provided fields', () => {
    const c = makeCampaign();
    const { campaign: withRule } = addBudgetRule(c, 'Original', 'Schedule', 1.5, 'Weekdays');
    const ruleId = withRule.budgetRules[0]!.id;
    const { campaign: updated } = updateBudgetRule(withRule, ruleId, { increase: 3.0 });
    const rule = updated.budgetRules.find((r) => r.id === ruleId)!;
    expect(rule.name).toBe('Original');
    expect(rule.increase).toBe(3.0);
  });

  it('fails fast on unknown rule id', () => {
    expect(() => updateBudgetRule(makeCampaign(), 'NOPE', { name: 'X' })).toThrow();
  });

  it('logs history entry', () => {
    const c = makeCampaign();
    const { campaign: withRule } = addBudgetRule(c, 'Old', 'Schedule', 1.5, 'Weekdays');
    const { campaign: updated } = updateBudgetRule(withRule, withRule.budgetRules[0]!.id, { name: 'Updated' });
    expect(updated.history.some((h) => h.includes('Budget rule'))).toBe(true);
  });
});
