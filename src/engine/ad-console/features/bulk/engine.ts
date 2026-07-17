/**
 * Bulk Operations — pure engine.
 */
import type { BulkRow, BulkValidationError } from './types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';

export function parseBulkCsv(text: string): BulkRow[] {
  if (typeof text !== 'string') throw new ValidationError('csv text must be a string');
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: BulkRow = { entity: '', operation: '' };
    headers.forEach((h, i) => {
      if (h === 'entity') row.entity = values[i] || '';
      else if (h === 'operation') row.operation = values[i] || '';
      else row[h] = values[i] || '';
    });
    return row;
  });
}

export function validateBulkRows(rows: BulkRow[]): BulkValidationError[] {
  if (!Array.isArray(rows)) throw new ValidationError('rows must be an array');
  const errors: BulkValidationError[] = [];
  rows.forEach((row, i) => {
    if (!row.entity) errors.push({ row: i + 2, field: 'entity', message: 'Entity is required' });
    if (!['campaign', 'adGroup', 'target', 'negative', 'budgetRule'].includes(row.entity)) {
      errors.push({ row: i + 2, field: 'entity', message: `Unknown entity: "${row.entity}"` });
    }
    if (!row.operation) errors.push({ row: i + 2, field: 'operation', message: 'Operation is required' });
    if (!['update', 'pause', 'enable', 'archive', 'delete', 'create'].includes(row.operation)) {
      errors.push({ row: i + 2, field: 'operation', message: `Unknown operation: "${row.operation}"` });
    }
  });
  return errors;
}

export function generateBulkTemplate(): string {
  return 'entity,operation,id,name,campaignName,campaignId,field,value\ncampaign,update,C-001,,,dailyBudget,50\ntarget,pause,T-001,,C-001,,';
}
