/**
 * Bulk Operations — Zustand slice.
 *
 * Tracks parsing state and execution results.  Actual campaign mutations happen
 * in the UI layer (BulkOpsPage.tsx) via applyBulkRows() — this keeps the
 * engine pure and avoids circular store imports.
 */
import type { StateCreator } from 'zustand';
import type { BulkRow, BulkValidationError } from './types';
import { parseBulkCsv, validateBulkRows, generateBulkTemplate } from './engine';

export interface BulkSlice {
  bulkInput: string;
  bulkPreview: BulkRow[];
  bulkErrors: BulkValidationError[];
  bulkValid: boolean;
  bulkApplied: number;
  bulkSkipped: number;
  bulkExecutionErrors: BulkValidationError[];
  setBulkInput: (text: string) => void;
  parseAndValidate: () => void;
  clearBulk: () => void;
  getTemplate: () => string;
}

export const createBulkSlice: StateCreator<BulkSlice, [], []> = (set, get) => ({
  bulkInput: generateBulkTemplate(),
  bulkPreview: [],
  bulkErrors: [],
  bulkValid: false,
  bulkApplied: 0,
  bulkSkipped: 0,
  bulkExecutionErrors: [],

  setBulkInput: (text) => {
    set({ bulkInput: text, bulkApplied: 0, bulkSkipped: 0, bulkExecutionErrors: [] });
  },

  parseAndValidate: () => {
    const rows = parseBulkCsv(get().bulkInput);
    const errors = validateBulkRows(rows);
    set({
      bulkPreview: rows,
      bulkErrors: errors,
      bulkValid: errors.length === 0 && rows.length > 0,
      bulkApplied: 0,
      bulkSkipped: 0,
      bulkExecutionErrors: [],
    });
  },

  clearBulk: () => {
    set({
      bulkInput: '',
      bulkPreview: [],
      bulkErrors: [],
      bulkValid: false,
      bulkApplied: 0,
      bulkSkipped: 0,
      bulkExecutionErrors: [],
    });
  },

  getTemplate: () => generateBulkTemplate(),
});
