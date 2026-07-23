import { describe, it, expect } from 'vitest';
import { parseBulkCsv, validateBulkRows, generateBulkTemplate } from '../engine';
import type { BulkRow } from '../types';

describe('parseBulkCsv', () => {
  it('returns no rows for empty or header-only input', () => {
    expect(parseBulkCsv('')).toEqual([]);
    expect(parseBulkCsv('entity,operation')).toEqual([]);
  });

  it('parses header + data rows into typed rows', () => {
    const csv = 'entity,operation,id,value\ncampaign,update,C-001,50\ntarget,pause,T-001,';
    const rows = parseBulkCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ entity: 'campaign', operation: 'update', id: 'C-001', value: '50' });
    expect(rows[1]!.entity).toBe('target');
  });

  it('is case-insensitive on headers and trims values', () => {
    const rows = parseBulkCsv('ENTITY,OPERATION\nCampaign,Update');
    expect(rows[0]).toMatchObject({ entity: 'Campaign', operation: 'Update' });
  });

  it('fails fast on non-string input', () => {
    expect(() => parseBulkCsv(null as unknown as string)).toThrow();
  });
});

describe('validateBulkRows', () => {
  it('reports no errors for a valid row', () => {
    const rows: BulkRow[] = [{ entity: 'campaign', operation: 'update', id: 'C-001' }];
    expect(validateBulkRows(rows)).toEqual([]);
  });

  it('flags missing and unknown entity/operation for a blank row', () => {
    const rows: BulkRow[] = [{ entity: '', operation: '' }];
    const errors = validateBulkRows(rows);
    expect(errors).toHaveLength(2);
    expect(errors.every((e) => e.row === 2)).toBe(true);
    expect(errors.map((e) => e.field).sort()).toEqual(['entity', 'operation']);
  });

  it('flags unknown entity and operation values', () => {
    const rows: BulkRow[] = [{ entity: 'banana', operation: 'frobnicate' }];
    const errors = validateBulkRows(rows);
    expect(errors.map((e) => e.field).sort()).toEqual(['entity', 'operation']);
  });

  it('fails fast when rows is not an array', () => {
    expect(() => validateBulkRows(null as unknown as BulkRow[])).toThrow();
  });
});

describe('generateBulkTemplate', () => {
  it('produces a parseable template with a header and at least one row', () => {
    const tpl = generateBulkTemplate();
    const rows = parseBulkCsv(tpl);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(validateBulkRows(rows)).toEqual([]);
  });
});
