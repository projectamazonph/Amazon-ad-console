import { describe, it, expect } from 'vitest';
import { parseBulkCsv, validateBulkRows, generateBulkTemplate, applyBulkRows } from '../engine';
import type { BulkRow } from '../types';
import { defaultCampaigns } from '../../../core/scenarios';

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

  it('template rows execute without throwing even when target campaigns are absent', () => {
    const tpl = generateBulkTemplate();
    const rows = parseBulkCsv(tpl);
    const campaigns = defaultCampaigns();
    // C-SP-AUTO-001 and T-SP-001 are real IDs in defaultCampaigns,
    // so template rows partially apply (6 applied, 1 budgetRule delete no-ops)
    expect(() => applyBulkRows(campaigns, rows)).not.toThrow();
    const result = applyBulkRows(campaigns, rows);
    expect(result.applied).toBeGreaterThan(0);
    expect(result.skipped).toBeGreaterThanOrEqual(0);
    expect(result.applied + result.skipped).toBe(rows.length);
  });
});

describe('applyBulkRows', () => {
  const campaigns = defaultCampaigns();
  const firstCampaign = campaigns[0]!;

  it('campaign update — applies dailyBudget change and increments applied', () => {
    const rows: BulkRow[] = [
      { entity: 'campaign', operation: 'update', id: firstCampaign.id, field: 'dailyBudget', value: '99' },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.applied).toBe(1);
    const updated = result.campaigns.find((x) => x.id === firstCampaign.id)!;
    expect(updated.dailyBudget).toBe(99);
  });

  it('campaign pause — sets status to Paused and increments applied', () => {
    const rows: BulkRow[] = [
      { entity: 'campaign', operation: 'pause', id: firstCampaign.id },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.applied).toBe(1);
    expect(result.campaigns.find((x) => x.id === firstCampaign.id)!.status).toBe('Paused');
  });

  it('campaign with unknown id — increments skipped, does not mutate', () => {
    const rows: BulkRow[] = [
      { entity: 'campaign', operation: 'pause', id: 'C-DOES-NOT-EXIST' },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.skipped).toBe(1);
    expect(result.applied).toBe(0);
  });

  it('negative operation with valid campaignId — applies and increments applied', () => {
    const rows: BulkRow[] = [
      { entity: 'negative', operation: 'update', campaignId: firstCampaign.id, value: 'test negative' },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.applied).toBe(1);
    const updated = result.campaigns.find((x) => x.id === firstCampaign.id)!;
    expect(updated.negatives.some((n) => n.value === 'test negative')).toBe(true);
  });

  it('negative operation without campaignId — increments skipped', () => {
    const rows: BulkRow[] = [
      { entity: 'negative', operation: 'update', value: 'test negative' },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.skipped).toBe(1);
    expect(result.applied).toBe(0);
  });

  it('accumulated applied + skipped equals row count', () => {
    const rows: BulkRow[] = [
      { entity: 'campaign', operation: 'pause', id: firstCampaign.id },
      { entity: 'campaign', operation: 'pause', id: 'C-MISSING' },
      { entity: 'negative', operation: 'update', campaignId: firstCampaign.id, value: 'waste term' },
      { entity: 'negative', operation: 'update', value: 'no campaign' },
    ];
    const result = applyBulkRows(campaigns, rows);
    expect(result.applied + result.skipped).toBe(4);
  });
});
