/**
 * Bulk Operations — Zustand slice.
 */
import type { StateCreator } from 'zustand';
import type { BulkRow, BulkValidationError } from './types';
import { parseBulkCsv, validateBulkRows, generateBulkTemplate } from './engine';

export interface BulkSlice {
  bulkInput: string;
  bulkPreview: BulkRow[];
  bulkErrors: BulkValidationError[];
  bulkValid: boolean;
  setBulkInput: (text: string) => void;
  parseAndValidate: () => void;
  clearBulk: () => void;
  getTemplate: () => string;
}

export const createBulkSlice: StateCreator<BulkSlice> = (set, get) => ({
  bulkInput: generateBulkTemplate(),
  bulkPreview: [],
  bulkErrors: [],
  bulkValid: false,

  setBulkInput: (text) => {
    set({ bulkInput: text });
  },

  parseAndValidate: () => {
    const rows = parseBulkCsv(get().bulkInput);
    const errors = validateBulkRows(rows);
    set({
      bulkPreview: rows,
      bulkErrors: errors,
      bulkValid: errors.length === 0 && rows.length > 0,
    });
  },

  clearBulk: () => {
    set({ bulkInput: '', bulkPreview: [], bulkErrors: [], bulkValid: false });
  },

  getTemplate: () => generateBulkTemplate(),
});
