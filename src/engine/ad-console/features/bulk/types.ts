/**
 * Bulk Operations — types.
 */
export interface BulkRow {
  entity: string;       // campaign, adGroup, target, negative, budgetRule
  operation: string;    // update, pause, enable, archive, delete, create
  id?: string;
  name?: string;
  campaignName?: string;
  campaignId?: string;
  adGroupId?: string;
  field?: string;
  value?: string;
  [key: string]: string | undefined;
}

export interface BulkValidationError {
  row: number;
  field: string;
  message: string;
}

export interface BulkPreview {
  rows: BulkRow[];
  valid: boolean;
  errors: BulkValidationError[];
  summary: string;
}
