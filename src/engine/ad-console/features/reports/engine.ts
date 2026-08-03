/**
 * Reports — pure engine.
 */
import type { Report, ReportRequest, ReportType } from './types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';
import { generateId } from '../../core/engine/id';

const REPORT_TYPES: ReportType[] = ['campaign', 'adGroup', 'target', 'searchTerm', 'placement'];

export function createReportRequest(type: ReportType): ReportRequest {
  if (!REPORT_TYPES.includes(type)) throw new ValidationError(`Unknown report type: ${type}`);
  return {
    id: generateId('R'),
    type,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
}

export function generateReport(type: ReportType): Report {
  const rows: Report['rows'] = [];
  const now = new Date().toISOString();

  if (REPORT_TYPES.includes(type)) {
    // Generate simulated report data
    for (let i = 0; i < 5; i++) {
      const clicks = Math.round(100 + Math.random() * 500);
      const impressions = Math.round(clicks / (0.005 + Math.random() * 0.01));
      const spend = parseFloat((50 + Math.random() * 200).toFixed(2));
      const sales = parseFloat((spend * (2 + Math.random() * 2)).toFixed(2));
      const orders = Math.round(sales / 30);
      rows.push({
        impressions,
        clicks,
        spend,
        sales,
        orders,
        ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
        cpc: parseFloat((spend / clicks).toFixed(2)),
        acos: parseFloat(((spend / sales) * 100).toFixed(2)),
        roas: parseFloat((sales / spend).toFixed(2)),
      });
    }
  }

  return {
    id: generateId('R'),
    type,
    rows,
    generatedAt: now,
  };
}

export function reportToCsv(report: Report): string {
  if (!report.rows.length) return '';
  const headers = Object.keys(report.rows[0]);
  const lines = [
    headers.join(','),
    ...report.rows.map((row) => headers.map((h) => String(row[h] ?? '')).join(',')),
  ];
  return lines.join('\n');
}
