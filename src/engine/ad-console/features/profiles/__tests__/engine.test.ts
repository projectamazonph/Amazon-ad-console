import { describe, it, expect, vi } from 'vitest';
import {
  createProfile,
  switchProfile,
  renameProfile,
  deleteProfile,
  defaultProfile,
} from '../engine';
import type { TraineeProfile } from '../types';

describe('createProfile', () => {
  it('creates a profile with a trimmed name', () => {
    const p = createProfile('  Ana  ');
    expect(p.name).toBe('Ana');
    expect(p.id).toBeTruthy();
  });
  it('falls back to a default name when blank', () => {
    expect(createProfile('   ').name).toBe('Trainee');
  });

  it('assigns unique ids even when created within the same millisecond', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    try {
      const a = createProfile('Ana');
      const b = createProfile('Ben');
      expect(a.id).not.toBe(b.id);
    } finally {
      nowSpy.mockRestore();
    }
  });
});

describe('profile collection ops', () => {
  const list: TraineeProfile[] = [createProfile('Ana'), createProfile('Ben')];
  const target = list[0]!;

  it('switches a profile and updates lastActiveAt', () => {
    const next = switchProfile(list, target.id);
    expect(next.find((p) => p.id === target.id)!.lastActiveAt).toBeTruthy();
    expect(next).toHaveLength(2);
  });

  it('renames a profile by id', () => {
    const next = renameProfile(list, target.id, 'Ana P.');
    expect(next.find((p) => p.id === target.id)!.name).toBe('Ana P.');
  });

  it('fails fast when renaming to an empty name', () => {
    expect(() => renameProfile(list, target.id, '   ')).toThrow();
  });

  it('deletes a profile by id', () => {
    const next = deleteProfile(list, target.id);
    expect(next).toHaveLength(1);
    expect(next.find((p) => p.id === target.id)).toBeUndefined();
  });
});

describe('defaultProfile', () => {
  it('returns a fixed default profile', () => {
    expect(defaultProfile().id).toBe('p-default');
    expect(defaultProfile().name).toBe('Trainee 1');
  });
});
