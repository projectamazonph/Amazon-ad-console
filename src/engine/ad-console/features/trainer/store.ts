/**
 * Trainer Dashboard — Zustand slice.
 */
import type { StateCreator } from 'zustand/vanilla';
import type { TrainerNote, ActionGrade, CertificationItem } from './types';
import { DEFAULT_CERTIFICATION } from './types';
import { addNote, calculateCertScore, calculateGrade } from './engine';

export interface TrainerSlice {
  notes: TrainerNote[];
  actionLog: ActionGrade[];
  certificationChecklist: CertificationItem[];
  addNote: (text: string) => void;
  deleteNote: (id: string) => void;
  logAction: (type: string, message: string, tone?: 'good' | 'bad' | 'warn') => void;
  toggleCertItem: (id: string) => void;
  certScore: () => number;
}

export const createTrainerSlice: StateCreator<TrainerSlice> = (set, get) => ({
  notes: [],
  actionLog: [],
  certificationChecklist: DEFAULT_CERTIFICATION.map((c) => ({ ...c })),

  addNote: (text) => {
    set((s) => ({ notes: [addNote(text), ...s.notes] }));
  },

  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  logAction: (type, message, tone) => {
    const grade = calculateGrade(type);
    set((s) => ({
      actionLog: [{
        timestamp: new Date().toISOString(),
        type,
        message,
        tone: tone || grade.tone,
      }, ...s.actionLog],
    }));
  },

  toggleCertItem: (id) => {
    set((s) => ({
      certificationChecklist: s.certificationChecklist.map((c) =>
        c.id === id ? { ...c, checked: !c.checked } : c,
      ),
    }));
  },

  certScore: () => calculateCertScore(get().certificationChecklist),
});
