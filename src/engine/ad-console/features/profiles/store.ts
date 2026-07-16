/**
 * Multi-User Profiles — Zustand slice.
 */
import type { StateCreator } from 'zustand';
import type { TraineeProfile } from './types';
import { createProfile, switchProfile, renameProfile, deleteProfile, defaultProfile } from './engine';

export interface ProfilesSlice {
  activeProfileId: string;
  profiles: TraineeProfile[];
  switchProfile: (id: string) => void;
  createProfile: (name: string) => void;
  renameProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
}

export const createProfilesSlice: StateCreator<ProfilesSlice> = (set, get) => ({
  activeProfileId: 'p-default',
  profiles: [defaultProfile()],

  switchProfile: (id) => {
    set((s) => ({
      activeProfileId: id,
      profiles: switchProfile(s.profiles, id),
    }));
  },

  createProfile: (name) => {
    const profile = createProfile(name);
    set((s) => ({
      profiles: [...s.profiles, profile],
      activeProfileId: profile.id,
    }));
  },

  renameProfile: (id, name) => {
    set((s) => ({
      profiles: renameProfile(s.profiles, id, name),
    }));
  },

  deleteProfile: (id) => {
    set((s) => {
      const filtered = deleteProfile(s.profiles, id);
      return {
        profiles: filtered,
        activeProfileId: s.activeProfileId === id ? (filtered[0]?.id || 'p-default') : s.activeProfileId,
      };
    });
  },
});
