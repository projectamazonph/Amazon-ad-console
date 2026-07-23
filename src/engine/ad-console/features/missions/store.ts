/**
 * Training Missions — Zustand slice.
 */
import type { StateCreator } from 'zustand/vanilla';
import type { MissionSession, Mission } from './types';
import { getMissions, getMission, createMissionSession, startMission, useHint, completeStep } from './engine';

export interface MissionsSlice {
  missions: Mission[];
  missionSession: MissionSession;
  loadMissions: () => void;
  startMission: (id: string) => void;
  stopMission: () => void;
  completeMissionStep: () => void;
  useHint: () => void;
}

export const createMissionsSlice: StateCreator<MissionsSlice> = (set, get) => ({
  missions: getMissions(),
  missionSession: createMissionSession(),

  loadMissions: () => {
    set({ missions: getMissions() });
  },

  startMission: (id) => {
    set({ missionSession: startMission(id) });
  },

  stopMission: () => {
    set({ missionSession: createMissionSession() });
  },

  completeMissionStep: () => {
    const session = get().missionSession;
    if (!session.missionId) return;
    const mission = getMission(session.missionId);
    if (!mission) return;
    set({ missionSession: completeStep(session, mission.steps.length) });
  },

  useHint: () => {
    set((s) => ({ missionSession: useHint(s.missionSession) }));
  },
});
