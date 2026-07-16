/**
 * Trainer Dashboard — types.
 */
export interface TrainerNote {
  id: string;
  timestamp: string;
  text: string;
}

export interface ActionGrade {
  timestamp: string;
  type: string;
  message: string;
  tone: 'good' | 'bad' | 'warn';
}

export interface CertificationItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TrainerState {
  notes: TrainerNote[];
  certificationChecklist: CertificationItem[];
}

export const DEFAULT_CERTIFICATION: CertificationItem[] = [
  { id: 'name-ad-type', label: 'Names ad type before making changes', checked: false },
  { id: 'check-status', label: 'Checks campaign status before editing', checked: false },
  { id: 'check-date-range', label: 'Checks date range before reading performance', checked: false },
  { id: 'read-metrics', label: 'Reads spend, sales, orders, ACOS, CPC, CVR', checked: false },
  { id: 'explain-optimization', label: 'Explains why a target gets increased, decreased, paused, harvested, or negated', checked: false },
  { id: 'use-exact-negatives', label: 'Uses exact negatives for precise waste, phrase only when safe', checked: false },
  { id: 'validate-sb-creative', label: 'Validates SB creative fields before launch', checked: false },
  { id: 'understand-sd', label: 'Understands SD audience/contextual targeting vs keyword targeting', checked: false },
  { id: 'check-change-history', label: 'Checks change history after major edits', checked: false },
];
