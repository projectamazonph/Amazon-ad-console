import { describe, it, expect } from 'vitest';
import {
  getMissions,
  getMission,
  createMissionSession,
  startMission,
  useHint,
  completeStep,
} from '../engine';

describe('mission catalog', () => {
  it('returns all missions', () => {
    expect(getMissions().length).toBeGreaterThanOrEqual(3);
  });
  it('looks up a mission by id', () => {
    expect(getMission('sp-harvest-negate')?.title).toContain('Harvest');
  });
  it('returns undefined for unknown id', () => {
    expect(getMission('nope')).toBeUndefined();
  });
});

describe('mission session lifecycle', () => {
  it('creates an empty session', () => {
    const s = createMissionSession();
    expect(s.currentStep).toBe(0);
    expect(s.score).toBe(0);
    expect(s.completed).toBe(false);
  });

  it('starts a mission with a full score', () => {
    const s = startMission('sp-harvest-negate');
    expect(s.missionId).toBe('sp-harvest-negate');
    expect(s.score).toBe(100);
  });

  it('falls back to an empty session for an unknown mission id instead of an unresolvable session', () => {
    const s = startMission('typo-id');
    expect(s).toEqual(createMissionSession());
    expect(s.missionId).toBeNull();
  });

  it('lowers score by 10 per hint', () => {
    const s0 = startMission('sp-harvest-negate');
    const s1 = useHint(s0);
    expect(s1.hintsUsed).toBe(1);
    expect(s1.score).toBe(90);
  });

  it('never drops score below zero', () => {
    let s = startMission('sp-harvest-negate');
    for (let i = 0; i < 20; i++) s = useHint(s);
    expect(s.score).toBe(0);
  });

  it('advances steps and marks completed at the end', () => {
    const total = getMission('sp-harvest-negate')!.steps.length;
    let s = startMission('sp-harvest-negate');
    for (let i = 0; i < total; i++) s = completeStep(s, total);
    expect(s.completed).toBe(true);
  });

  it('clamps currentStep to the last index', () => {
    const total = getMission('sp-harvest-negate')!.steps.length;
    let s = startMission('sp-harvest-negate');
    for (let i = 0; i < total + 3; i++) s = completeStep(s, total);
    expect(s.currentStep).toBe(total - 1);
  });
});
