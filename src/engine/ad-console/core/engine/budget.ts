/**
 * Budget rule CRUD operations.
 */
import type { Campaign, BudgetRule, BudgetRuleType } from '../types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';
import { generateId } from './id';

const VALID_RULE_TYPES = ['Schedule', 'Performance'] as const;

export function addBudgetRule(
  c: Campaign,
  name: string,
  type: BudgetRuleType,
  increase: number,
  condition: string,
): { campaign: Campaign; rule: BudgetRule } {
  assertNonEmpty('budget rule name', name);
  assertNonEmpty('budget rule condition', condition);
  if (!VALID_RULE_TYPES.includes(type as typeof VALID_RULE_TYPES[number])) {
    throw new ValidationError(`Invalid budget rule type: ${type}. Must be Schedule or Performance`);
  }
  if (!Number.isFinite(increase) || increase <= 0) {
    throw new ValidationError(`Budget rule increase must be a positive number, got ${increase}`);
  }
  const rule: BudgetRule = {
    id: generateId('BR'),
    campaignId: c.id,
    name: name.trim(),
    type,
    increase,
    condition: condition.trim(),
  };
  return {
    campaign: {
      ...c,
      budgetRules: [...c.budgetRules, rule],
      history: [...c.history, `Budget rule "${rule.name}" added (${type}, ${increase}x)`],
    },
    rule,
  };
}

export function removeBudgetRule(
  c: Campaign,
  ruleId: string,
): { campaign: Campaign; removed: boolean } {
  const idx = c.budgetRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) return { campaign: c, removed: false };
  const removed = c.budgetRules[idx]!;
  return {
    campaign: {
      ...c,
      budgetRules: c.budgetRules.filter((r) => r.id !== ruleId),
      history: [...c.history, `Budget rule "${removed.name}" removed`],
    },
    removed: true,
  };
}

export function updateBudgetRule(
  c: Campaign,
  ruleId: string,
  updates: Partial<Pick<BudgetRule, 'name' | 'type' | 'increase' | 'condition'>>,
): { campaign: Campaign } {
  const idx = c.budgetRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) throw new ValidationError(`Unknown budget rule: ${ruleId}`);
  if (updates.name !== undefined) assertNonEmpty('budget rule name', updates.name);
  if (updates.condition !== undefined) assertNonEmpty('budget rule condition', updates.condition);
  if (updates.type !== undefined && !VALID_RULE_TYPES.includes(updates.type as typeof VALID_RULE_TYPES[number])) {
    throw new ValidationError(`Invalid budget rule type: ${updates.type}`);
  }
  if (updates.increase !== undefined && (!Number.isFinite(updates.increase) || updates.increase <= 0)) {
    throw new ValidationError(`Budget rule increase must be a positive number, got ${updates.increase}`);
  }
  const rule = c.budgetRules[idx]!;
  const updated = { ...rule, ...updates };
  return {
    campaign: {
      ...c,
      budgetRules: c.budgetRules.map((r) => (r.id === ruleId ? updated : r)),
      history: [...c.history, `Budget rule "${updated.name}" updated`],
    },
  };
}
