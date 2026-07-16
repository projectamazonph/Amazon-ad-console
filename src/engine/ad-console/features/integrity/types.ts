/**
 * Integrity Center — types.
 */
export interface IntegrityIssue {
  id: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  entityId: string;
  entityType: string;
  recommendation: string;
}

export interface IntegrityReport {
  score: number;
  issues: IntegrityIssue[];
  passed: boolean;
  lastRun: string | null;
}
