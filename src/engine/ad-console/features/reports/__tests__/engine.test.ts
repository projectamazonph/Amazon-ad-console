import { describe, it, expect } from 'vitest';
import { createReportRequest, generateReport, reportToCsv } from '../engine';
import type { ReportType } from '../types';

describe('createReportRequest', () => {
  it('creates a pending request with an id and timestamp', () => {
    const req = createReportRequest('campaign');
    expect(req.type).toBe('campaign');
    expect(req.status).toBe('pending');
    expect(req.id).toBeTruthy();
    expect(req.requestedAt).toBeTruthy();
  });

  it('fails fast on unknown report type', () => {
    expect(() => createReportRequest('bogus' as ReportType)).toThrow();
  });
});

describe('generateReport', () => {
  it('produces 5 rows for a campaign report', () => {
    const r = generateReport('campaign');
    expect(r.rows).toHaveLength(5);
  });

  it('produces empty rows for an unsupported type', () => {
    const r = generateReport('summary' as ReportType);
    expect(r.rows).toHaveLength(0);
  });

  it('computes derived KPIs per row', () => {
    const r = generateReport('campaign');
    const row = r.rows[0]!;
    expect(row.ctr).toBeGreaterThanOrEqual(0);
    expect(row.acos).toBeGreaterThanOrEqual(0);
    expect(row.roas).toBeGreaterThan(0);
  });
});

describe('reportToCsv', () => {
  it('returns empty string for a report with no rows', () => {
    expect(reportToCsv({ id: 'R', type: 'campaign', rows: [], generatedAt: '' })).toBe('');
  });

  it('emits a header line plus one line per row', () => {
    const r = generateReport('campaign');
    const csv = reportToCsv(r);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(r.rows.length + 1);
    expect(lines[0]).toContain('impressions');
  });
});
