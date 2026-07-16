/**
 * Reports — types.
 */
export type ReportType = 'campaign' | 'adGroup' | 'target' | 'searchTerm' | 'placement';

export interface ReportRequest {
  id: string;
  type: ReportType;
  status: 'pending' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
}

export interface ReportRow {
  [key: string]: string | number;
}

export interface Report {
  id: string;
  type: ReportType;
  rows: ReportRow[];
  generatedAt: string;
}
