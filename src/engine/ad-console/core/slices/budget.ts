/**
 * Budget rules slice.
 */
import type { BudgetRule, BudgetRuleType } from '../types';
import { addBudgetRule, removeBudgetRule, updateBudgetRule } from '../engine';

export interface BudgetSlice {
  addBudgetRule: (cid: string, name: string, type: BudgetRuleType, increase: number, condition: string) => void;
  removeBudgetRule: (cid: string, ruleId: string) => void;
  updateBudgetRule: (cid: string, ruleId: string, updates: Partial<Pick<BudgetRule, 'name' | 'type' | 'increase' | 'condition'>>) => void;
}

export const createBudgetSlice = (set: any, ..._rest: any[]): BudgetSlice => ({
  addBudgetRule: (cid, name, type, increase, condition) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addBudgetRule(c, name, type, increase, condition).campaign : c) }
  })),
  removeBudgetRule: (cid, ruleId) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? removeBudgetRule(c, ruleId).campaign : c) }
  })),
  updateBudgetRule: (cid, ruleId, updates) => set((s: any) => ({
    state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? updateBudgetRule(c, ruleId, updates).campaign : c) }
  })),
});
