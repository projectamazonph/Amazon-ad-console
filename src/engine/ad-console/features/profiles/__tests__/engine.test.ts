import { describe, it, expect } from 'vitest';
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
