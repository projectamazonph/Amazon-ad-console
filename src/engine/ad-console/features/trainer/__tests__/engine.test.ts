import { describe, it, expect } from 'vitest';
import { addNote, calculateCertScore, calculateGrade } from '../engine';

describe('addNote', () => {
  it('creates a note with id, timestamp, and trimmed text', () => {
    const n = addNote('  good trainee  ');
    expect(n.text).toBe('good trainee');
    expect(n.id).toBeTruthy();
    expect(n.timestamp).toBeTruthy();
  });

  it('fails fast on empty note text', () => {
    expect(() => addNote('   ')).toThrow();
  });
});

describe('calculateCertScore', () => {
  it('returns 0 for an empty checklist', () => {
    expect(calculateCertScore([])).toBe(0);
  });
  it('returns a percentage of checked items', () => {
    expect(calculateCertScore([{ checked: true }, { checked: false }, { checked: true }])).toBe(67);
  });
  it('returns 100 when all checked', () => {
    expect(calculateCertScore([{ checked: true }, { checked: true }])).toBe(100);
  });
});

describe('calculateGrade', () => {
  it('grades a keyword add as good', () => {
    expect(calculateGrade('keyword_added').tone).toBe('good');
  });
  it('warns on target removal', () => {
    expect(calculateGrade('target_removed').tone).toBe('warn');
  });
  it('flags a bid increase on high ACOS as bad', () => {
    expect(calculateGrade('bid_up', { acos: 55 }).tone).toBe('bad');
  });
  it('approves a bid decrease on high ACOS', () => {
    expect(calculateGrade('bid_down', { acos: 55 }).tone).toBe('good');
  });
  it('warns on a large budget increase', () => {
    expect(calculateGrade('budget_change', { increase: 2 }).tone).toBe('warn');
  });
  it('falls back to good for unknown actions', () => {
    expect(calculateGrade('mystery').tone).toBe('good');
  });
});
