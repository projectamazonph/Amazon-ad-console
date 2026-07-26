/**
 * Budget rules slice, using campaignMutatorObj helper.
 */
import type { BudgetRule, BudgetRuleType } from '../types';
import { addBudgetRule, removeBudgetRule, updateBudgetRule } from '../engine';
import { campaignMutatorObj } from './helpers';

export interface BudgetSlice {
  addBudgetRule: (cid: string, name: string, type: BudgetRuleType, increase: number, condition: string) => void;
  removeBudgetRule: (cid: string, ruleId: string) => void;
  updateBudgetRule: (cid: string, ruleId: string, updates: Partial<Pick<BudgetRule, 'name' | 'type' | 'increase' | 'condition'>>) => void;
}

export const createBudgetSlice = (set: any, ..._rest: any[]): BudgetSlice => ({
  addBudgetRule: campaignMutatorObj<[string, BudgetRuleType, number, string]>(set, addBudgetRule),
  removeBudgetRule: campaignMutatorObj<[string]>(set, removeBudgetRule),
  updateBudgetRule: campaignMutatorObj<[string, Partial<Pick<BudgetRule, 'name' | 'type' | 'increase' | 'condition'>>]>(set, updateBudgetRule),
});
