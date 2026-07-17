import { describe, it, expect } from 'vitest';
import {
  getDrill,
  getAllDrills,
  getDrillsByAdType,
  createSession,
  startDrill,
  isCorrectAction,
  advanceStep,
  recordMistake,
  recordSkip,
  calculateScore,
  canCompleteStep,
} from '../engine';
import type { DrillDefinition, DrillId } from '../types';

const drill = getDrill('nav-sp-search-term-negative')!;

describe('drill catalog', () => {
  it('returns 5 drills', () => {
    expect(getAllDrills()).toHaveLength(5);
  });
  it('looks up a drill by id', () => {
    expect(getDrill('nav-sp-search-term-negative')?.title).toContain('Search terms');
  });
  it('returns undefined for unknown id', () => {
    expect(getDrill('nope' as DrillId)).toBeUndefined();
  });
  it('filters drills by ad type', () => {
    expect(getDrillsByAdType('SB')).toHaveLength(1);
    expect(getDrillsByAdType('XX')).toHaveLength(0);
  });
});

describe('drill session lifecycle', () => {
  it('creates an empty session', () => {
    const s = createSession();
    expect(s.currentStep).toBe(0);
    expect(s.completed).toBe(false);
  });

  it('starts a drill and logs the title', () => {
    const s = startDrill('nav-sp-search-term-negative');
    expect(s.drillId).toBe('nav-sp-search-term-negative');
    expect(s.log[0]).toContain('Started drill');
  });

  it('falls back to empty session for unknown drill', () => {
    const s = startDrill('nope' as DrillId);
    expect(s.drillId).toBeNull();
  });

  it('detects a correct action for the current step', () => {
    const s = startDrill('nav-sp-search-term-negative');
    expect(isCorrectAction(s, drill, drill.steps[0]!.targetAction)).toBe(true);
    expect(isCorrectAction(s, drill, 'wrong-action')).toBe(false);
  });

  it('advances steps and marks completed at the end', () => {
    let s = startDrill('nav-sp-search-term-negative');
    for (let i = 0; i < drill.steps.length; i++) s = advanceStep(s, drill);
    expect(s.completed).toBe(true);
    expect(s.currentStep).toBe(drill.steps.length - 1);
  });

  it('records mistakes without changing step', () => {
    const s0 = startDrill('nav-sp-search-term-negative');
    const s1 = recordMistake(s0);
    expect(s1.mistakes).toBe(1);
    expect(s1.currentStep).toBe(0);
  });

  it('records a skip and advances the step', () => {
    const s0 = startDrill('nav-sp-search-term-negative');
    const s1 = recordSkip(s0, drill);
    expect(s1.skips).toBe(1);
    expect(s1.currentStep).toBe(1);
  });

  it('scores lower with skips and mistakes', () => {
    const total = drill.steps.length;
    const perfect = calculateScore({ ...createSession(), skips: 0, mistakes: 0 }, total);
    const flawed = calculateScore({ ...createSession(), skips: 1, mistakes: 2 }, total);
    expect(perfect).toBe(100);
    expect(flawed).toBeLessThan(perfect);
  });

  it('reports completable for a skippable final step', () => {
    const s = startDrill('nav-sp-search-term-negative');
    expect(canCompleteStep(s, drill)).toBe(true);
  });
});
