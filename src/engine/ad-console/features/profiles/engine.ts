/**
 * Multi-User Trainee Profiles — pure engine.
 */
import type { TraineeProfile } from './types';
import { assertNonEmpty } from '../../../../lib/validation';

let _counter = 0;
function uid(): string {
  _counter++;
  return 'P-' + Date.now().toString(36) + '-' + _counter;
}

export function createProfile(name: string): TraineeProfile {
  return {
    id: uid(),
    name: name.trim().slice(0, 25) || 'Trainee',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
}

export function switchProfile(
  profiles: TraineeProfile[],
  targetId: string,
): TraineeProfile[] {
  return profiles.map((p) =>
    p.id === targetId ? { ...p, lastActiveAt: new Date().toISOString() } : p,
  );
}

export function renameProfile(
  profiles: TraineeProfile[],
  id: string,
  newName: string,
): TraineeProfile[] {
  assertNonEmpty('new name', newName);
  return profiles.map((p) =>
    p.id === id ? { ...p, name: newName.trim().slice(0, 25) } : p,
  );
}

export function deleteProfile(
  profiles: TraineeProfile[],
  id: string,
): TraineeProfile[] {
  return profiles.filter((p) => p.id !== id);
}

export function defaultProfile(): TraineeProfile {
  return {
    id: 'p-default',
    name: 'Trainee 1',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
}
