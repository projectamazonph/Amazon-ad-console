/**
 * Guided Navigation Drills — pure engine.
 *
 * Defines the 5 core drills, resolves current step targets,
 * evaluates actions, and calculates scores.
 */

import type { DrillDefinition, DrillId, DrillStep, DrillSession } from './types';

// ---------------------------------------------------------------------------
// Drill definitions — 5 route-based navigation exercises
// ---------------------------------------------------------------------------

const DRILLS: Record<DrillId, DrillDefinition> = {
  'nav-sp-search-term-negative': {
    id: 'nav-sp-search-term-negative',
    title: 'Find and block waste from Search terms',
    description: 'Navigate to Campaign manager → SP Auto campaign → Search terms → Negative exact → Verify negatives.',
    adType: 'SP',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    actions: ['openCampaignManager', 'selectSpAutoCampaign', 'openSearchTermsTab', 'addNegativeExact', 'verifyNegatives'],
    steps: [
      { instruction: 'Click Campaign manager in the left sidebar.', targetAction: 'sidebarCampaigns', hint: 'Look for the "Campaign manager" navigation item.', skippable: true },
      { instruction: 'Find and click the SP Auto Discovery campaign.', targetAction: 'selectC-SP-AUTO-001', hint: 'It has "Auto" and "Discovery" in the name.', skippable: false },
      { instruction: 'Click the "Search terms" tab.', targetAction: 'tabSearchTerms', hint: 'It shows customer search term data.', skippable: false },
      { instruction: 'Click "Negative exact" on "paper coffee filters bulk".', targetAction: 'negativeST-A-001', hint: 'This term spends but has zero orders.', skippable: false },
      { instruction: 'Verify the negative appears in "Negatives" tab.', targetAction: 'tabNegatives', hint: 'Check that the waste term is now blocked.', skippable: true },
    ],
  },
  'nav-sp-placement-controls': {
    id: 'nav-sp-placement-controls',
    title: 'Adjust SP placement settings',
    description: 'Navigate to Campaign manager → Manual SP campaign → Placements tab → Save adjustments → Verify in Change history.',
    adType: 'SP',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    actions: ['openCampaignManager', 'selectSpManualCampaign', 'openPlacementsTab', 'savePlacements', 'checkHistory'],
    steps: [
      { instruction: 'Click Campaign manager in the left sidebar.', targetAction: 'sidebarCampaigns', skippable: true },
      { instruction: 'Open the SP Manual Exact Winners campaign.', targetAction: 'selectC-SP-MAN-002', hint: 'Look for "Manual | Coffee Filter | Exact Winners".', skippable: false },
      { instruction: 'Click the "Placements" tab.', targetAction: 'tabPlacements', skippable: false },
      { instruction: 'Review and click "Save placements".', targetAction: 'savePlacements', skippable: false },
      { instruction: 'Open "Change history" to verify the save was recorded.', targetAction: 'tabHistory', skippable: true },
    ],
  },
  'nav-sb-creative-review': {
    id: 'nav-sb-creative-review',
    title: 'Review SB creative before launch',
    description: 'Navigate to Creative assets → SB Video campaign → Overview → Targeting tab to verify creative readiness.',
    adType: 'SB',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    actions: ['openCreativeAssets', 'selectSbVideoCampaign', 'viewCreativeOverview', 'checkTargetingTab'],
    steps: [
      { instruction: 'Click "Creative assets" in the sidebar.', targetAction: 'sidebarCreative', skippable: true },
      { instruction: 'Select the SB Video campaign.', targetAction: 'selectC-SB-VID-003', hint: 'It has a rejected creative status.', skippable: false },
      { instruction: 'Review the Overview tab for creative issues.', targetAction: 'tabOverview', hint: 'Check the creative rejection reason.', skippable: false },
      { instruction: 'Check the Targeting tab for keyword coverage.', targetAction: 'tabTargets', skippable: true },
    ],
  },
  'nav-report-request': {
    id: 'nav-report-request',
    title: 'Request and copy a performance report',
    description: 'Navigate to Reports → Request a report → Copy rows to practice the reporting workflow.',
    adType: 'SP',
    difficulty: 'beginner',
    estimatedMinutes: 3,
    actions: ['openReports', 'requestReport', 'copyReportRows'],
    steps: [
      { instruction: 'Click "Reports" in the left sidebar.', targetAction: 'sidebarReports', skippable: true },
      { instruction: 'Click "Request report" to generate data.', targetAction: 'requestReport', skippable: false },
      { instruction: 'Click "Copy report" to copy a row.', targetAction: 'copyReport', hint: 'Practice the copy workflow without spreadsheets.', skippable: true },
    ],
  },
  'nav-sd-audience-path': {
    id: 'nav-sd-audience-path',
    title: 'Find Sponsored Display audience targeting',
    description: 'Navigate to Campaign manager → SD Views Remarketing → Targeting tab → Reports to understand SD is audience-based, not keyword-based.',
    adType: 'SD',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    actions: ['openCampaignManager', 'selectSdCampaign', 'openTargetingTab', 'openReports'],
    steps: [
      { instruction: 'Click Campaign manager in the left sidebar.', targetAction: 'sidebarCampaigns', skippable: true },
      { instruction: 'Open the SD Views Remarketing campaign.', targetAction: 'selectC-SD-AUD-004', hint: 'Sponsored Display uses audience targeting.', skippable: false },
      { instruction: 'Click the "Targeting" tab to see audience logic.', targetAction: 'tabTargets', hint: 'SD targets audiences, not keywords.', skippable: false },
      { instruction: 'Go to "Reports" to see display-style reporting.', targetAction: 'sidebarReports', skippable: true },
    ],
  },
};

// ---------------------------------------------------------------------------
// Engine functions
// ---------------------------------------------------------------------------

export function getDrill(id: DrillId): DrillDefinition | undefined {
  return DRILLS[id];
}

export function getAllDrills(): DrillDefinition[] {
  return Object.values(DRILLS);
}

export function getDrillsByAdType(adType: string): DrillDefinition[] {
  return Object.values(DRILLS).filter((d) => d.adType === adType);
}

export function createSession(): DrillSession {
  return {
    drillId: null,
    currentStep: 0,
    mistakes: 0,
    skips: 0,
    startedAt: null,
    completed: false,
    log: [],
  };
}

export function startDrill(drillId: DrillId): DrillSession {
  const drill = getDrill(drillId);
  if (!drill) return createSession();
  return {
    drillId,
    currentStep: 0,
    mistakes: 0,
    skips: 0,
    startedAt: new Date().toISOString(),
    completed: false,
    log: [`Started drill: ${drill.title}`],
  };
}

export function isCorrectAction(
  session: DrillSession,
  drill: DrillDefinition,
  action: string,
): boolean {
  if (!drill || session.completed) return false;
  const step = drill.steps[session.currentStep];
  if (!step) return false;
  return step.targetAction === action;
}

export function advanceStep(session: DrillSession, drill: DrillDefinition): DrillSession {
  const nextStep = session.currentStep + 1;
  const completed = nextStep >= drill.steps.length;
  return {
    ...session,
    currentStep: Math.min(nextStep, drill.steps.length - 1),
    completed,
    log: [...session.log, completed ? 'Drill completed' : `Step ${nextStep}/${drill.steps.length} done`],
  };
}

export function recordMistake(session: DrillSession): DrillSession {
  return {
    ...session,
    mistakes: session.mistakes + 1,
    log: [...session.log, 'Wrong click recorded'],
  };
}

export function recordSkip(session: DrillSession, drill: DrillDefinition): DrillSession {
  const skipCount = session.skips + 1;
  const nextStep = session.currentStep + 1;
  const completed = nextStep >= drill.steps.length;
  return {
    ...session,
    skips: skipCount,
    currentStep: Math.min(nextStep, drill.steps.length - 1),
    completed,
    log: [...session.log, `Skipped step ${session.currentStep + 1}`],
  };
}

export function calculateScore(session: DrillSession, totalSteps: number): number {
  const stepScore = Math.max(0, totalSteps - session.skips) / totalSteps;
  const mistakePenalty = Math.max(0, 1 - session.mistakes * 0.12);
  return Math.round(stepScore * mistakePenalty * 100);
}

export function canCompleteStep(session: DrillSession, drill: DrillDefinition): boolean {
  if (!drill) return false;
  const step = drill.steps[session.currentStep];
  return !step || step.skippable !== false || session.currentStep < drill.steps.length;
}
