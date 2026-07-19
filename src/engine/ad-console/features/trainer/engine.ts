/**
 * Trainer Dashboard — pure engine.
 */
import type { TrainerNote, TrainerState } from './types';
import { assertNonEmpty } from '../../../../lib/validation';

let _counter = 0;
function uid(): string {
  _counter++;
  return 'TN-' + Date.now().toString(36) + '-' + _counter;
}

export function addNote(text: string): TrainerNote {
  assertNonEmpty('note text', text);
  return {
    id: uid(),
    timestamp: new Date().toISOString(),
    text: text.trim(),
  };
}

export function calculateCertScore(checklist: { checked: boolean }[]): number {
  if (!checklist.length) return 0;
  const passed = checklist.filter((c) => c.checked).length;
  return Math.round((passed / checklist.length) * 100);
}

export function calculateGrade(actionType: string, context?: Record<string, any>): { tone: 'good' | 'bad' | 'warn'; message: string } {
  switch (actionType) {
    case 'keyword_added':
      return { tone: 'good', message: 'Keyword added to campaign' };
    case 'target_removed':
      return { tone: 'warn', message: 'Target removed: confirm this was intentional' };
    case 'bid_up':
      return context?.acos && context.acos > 40
        ? { tone: 'bad', message: 'Bid increase on high-ACOS target: recommend review' }
        : { tone: 'good', message: 'Bid increase on performing target' };
    case 'bid_down':
      return context?.acos && context.acos > 40
        ? { tone: 'good', message: 'Correct: lowering bid on waste target' }
        : { tone: 'warn', message: 'Bid decreased: verify performance data' };
    case 'budget_change':
      return context?.increase && context.increase > 1.5
        ? { tone: 'warn', message: 'Large budget increase: check portfolio impact' }
        : { tone: 'good', message: 'Budget adjusted' };
    case 'campaign_paused':
      return { tone: 'good', message: 'Campaign paused' };
    case 'campaign_archived':
      return { tone: 'warn', message: 'Campaign archived: verify before finalizing' };
    default:
      return { tone: 'good', message: 'Action recorded' };
  }
}
