/**
 * Integrity Center — Zustand slice.
 */
import type { StateCreator } from 'zustand';
import type { IntegrityReport } from './types';
import { runIntegrityCheck } from './engine';
import type { Campaign } from '../../core/types';

export interface IntegritySlice {
  integrityReport: IntegrityReport | null;
  runIntegrity: (campaigns: Campaign[]) => void;
  clearIntegrity: () => void;
}

export const createIntegritySlice: StateCreator<IntegritySlice> = (set) => ({
  integrityReport: null,

  runIntegrity: (campaigns) => {
    const report = runIntegrityCheck(campaigns);
    set({ integrityReport: report });
  },

  clearIntegrity: () => {
    set({ integrityReport: null });
  },
});
