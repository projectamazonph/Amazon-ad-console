/**
 * Reports — Zustand slice.
 */
import type { StateCreator } from 'zustand';
import type { Report, ReportRequest, ReportType } from './types';
import { createReportRequest, generateReport, reportToCsv } from './engine';

export interface ReportsSlice {
  reportQueue: ReportRequest[];
  reports: Report[];
  selectedReportId: string | null;
  requestReport: (type: ReportType) => void;
  selectReport: (id: string | null) => void;
  exportReportCsv: (reportId: string) => string;
}

export const createReportsSlice: StateCreator<ReportsSlice> = (set, get) => ({
  reportQueue: [],
  reports: [],
  selectedReportId: null,

  requestReport: (type) => {
    const request = createReportRequest(type);
    // Generate the report immediately (simulate processing)
    const report = generateReport(type);
    set((s) => ({
      reportQueue: [{ ...request, status: 'completed', completedAt: new Date().toISOString() }, ...s.reportQueue],
      reports: [report, ...s.reports],
      selectedReportId: report.id,
    }));
  },

  selectReport: (id) => {
    set({ selectedReportId: id });
  },

  exportReportCsv: (reportId) => {
    const report = get().reports.find((r) => r.id === reportId);
    if (!report) return '';
    return reportToCsv(report);
  },
});
