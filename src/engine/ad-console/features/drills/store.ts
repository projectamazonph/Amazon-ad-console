/**
 * Guided Drills — Zustand slice.
 */
import type { StateCreator } from 'zustand/vanilla';
import type { DrillId, DrillSession, DrillResult } from './types';
import { getDrill, createSession, startDrill, isCorrectAction, advanceStep, recordMistake, recordSkip, calculateScore } from './engine';

export interface DrillsSlice {
  drillSession: DrillSession;
  drillResults: DrillResult[];
  startDrill: (drillId: DrillId) => void;
  stopDrill: () => void;
  evaluateDrillAction: (action: string) => boolean;
  skipDrillStep: () => void;
}

export const createDrillsSlice: StateCreator<DrillsSlice> = (set, get) => ({
  drillSession: createSession(),
  drillResults: [],

  startDrill: (drillId) => {
    set({ drillSession: startDrill(drillId) });
  },

  stopDrill: () => {
    const session = get().drillSession;
    if (session.drillId) {
      const drill = getDrill(session.drillId);
      if (drill) {
        const score = calculateScore(session, drill.steps.length);
        const result: DrillResult = {
          drillId: session.drillId,
          traineeName: 'Trainee',
          completedAt: new Date().toISOString(),
          score,
          mistakes: session.mistakes,
          skips: session.skips,
          totalSteps: drill.steps.length,
        };
        set({
          drillSession: createSession(),
          drillResults: [...get().drillResults, result],
        });
      }
    }
  },

  evaluateDrillAction: (action) => {
    const session = get().drillSession;
    if (!session.drillId || session.completed) return false;
    const drill = getDrill(session.drillId);
    if (!drill) return false;

    if (isCorrectAction(session, drill, action)) {
      const newSession = advanceStep(session, drill);
      set({ drillSession: newSession });
      if (newSession.completed) {
        const score = calculateScore(newSession, drill.steps.length);
        const result: DrillResult = {
          drillId: session.drillId,
          traineeName: 'Trainee',
          completedAt: new Date().toISOString(),
          score,
          mistakes: newSession.mistakes,
          skips: newSession.skips,
          totalSteps: drill.steps.length,
        };
        set({ drillResults: [...get().drillResults, result] });
      }
      return true;
    } else {
      set({ drillSession: recordMistake(session) });
      return false;
    }
  },

  skipDrillStep: () => {
    const session = get().drillSession;
    if (!session.drillId) return;
    const drill = getDrill(session.drillId);
    if (!drill) return;
    set({ drillSession: recordSkip(session, drill) });
  },
});
