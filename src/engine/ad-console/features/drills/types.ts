/**
 * Guided Navigation Drills — types.
 *
 * Coach users through click-by-click Amazon Ads Console workflows
 * with real-time step validation, mistake tracking, and scoring.
 */

export type DrillId =
  | 'nav-sp-search-term-negative'
  | 'nav-sp-placement-controls'
  | 'nav-sb-creative-review'
  | 'nav-report-request'
  | 'nav-sd-audience-path';

export interface DrillStep {
  /** Human-readable instruction for the current click target */
  instruction: string;
  /** Element selector or action identifier the user must perform */
  targetAction: string;
  /** Optional context/coach hint shown in the sidebar */
  hint?: string;
  /** Whether the user can skip this step */
  skippable?: boolean;
}

export interface DrillDefinition {
  id: DrillId;
  title: string;
  description: string;
  adType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  /** Ordered list of navigation steps the user must complete */
  actions: string[];          // Route as sequential action keys
  steps: DrillStep[];         // Corresponding instruction objects
}

export interface DrillResult {
  drillId: DrillId;
  traineeName: string;
  completedAt: string;
  score: number;              // 0-100
  mistakes: number;
  skips: number;
  totalSteps: number;
}

export interface DrillSession {
  drillId: DrillId | null;
  currentStep: number;
  mistakes: number;
  skips: number;
  startedAt: string | null;
  completed: boolean;
  log: string[];
}
