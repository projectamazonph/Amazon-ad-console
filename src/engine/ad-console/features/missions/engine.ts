/**
 * Training Missions — pure engine.
 */
import type { Mission, MissionSession, MissionStep } from './types';

const MISSIONS: Mission[] = [
  {
    id: 'sp-harvest-negate',
    title: 'SP Search Term Harvest and Negation',
    description: 'Harvest converting search terms as exact keywords and negate waste to protect ACOS.',
    adType: 'SP',
    difficulty: 'beginner',
    steps: [
      { instruction: 'Open the SP Auto Discovery campaign.', expectedAction: 'openC-SP-AUTO-001', hint: 'Find it in campaign manager.' },
      { instruction: 'Open the Search terms tab.', expectedAction: 'tabSearchTerms', hint: 'Located in the campaign detail tabs.' },
      { instruction: 'Find a high-performing term and harvest it as exact.', expectedAction: 'harvestTerm', hint: 'Look for terms with good sales and ACOS < 30%.' },
      { instruction: 'Negate a wasteful term with zero sales.', expectedAction: 'addNegative', hint: 'Terms with spend but no orders should be negated.' },
      { instruction: 'Verify the negatives in the Negatives tab.', expectedAction: 'tabNegatives', hint: 'Confirm the waste term is now blocked.' },
    ],
  },
  {
    id: 'build-sp-campaign',
    title: 'Build Sponsored Products Campaign',
    description: 'Create a new SP manual keyword campaign from scratch using the campaign wizard.',
    adType: 'SP',
    difficulty: 'intermediate',
    steps: [
      { instruction: 'Click "Create campaign" and choose Sponsored Products.', expectedAction: 'createCampaign', hint: 'Select SP as the ad type.' },
      { instruction: 'Set campaign name, budget, and targeting mode.', expectedAction: 'setBasics', hint: 'Use "Manual keyword" targeting.' },
      { instruction: 'Set bid strategy and default bid.', expectedAction: 'setBidding', hint: 'Try "Dynamic bids - down only".' },
      { instruction: 'Add keywords with match types.', expectedAction: 'addKeywords', hint: 'Include Exact, Phrase, and Broad matches.' },
      { instruction: 'Review and launch the campaign.', expectedAction: 'launchCampaign', hint: 'Check all settings before launching.' },
    ],
  },
  {
    id: 'budget-placement',
    title: 'Budget and Placement Controls',
    description: 'Practice adjusting campaign budgets, setting placement modifiers, and reviewing change history.',
    adType: 'SP',
    difficulty: 'intermediate',
    steps: [
      { instruction: 'Open the Manual SP campaign.', expectedAction: 'openC-SP-MAN-002', hint: 'Find the Exact Winners campaign.' },
      { instruction: 'Increase the daily budget in Overview.', expectedAction: 'editBudget', hint: 'Try a 20% increase.' },
      { instruction: 'Set a Top of Search placement adjustment.', expectedAction: 'editPlacements', hint: 'Try 30% for Top of Search.' },
      { instruction: 'Save and review Change history.', expectedAction: 'tabHistory', hint: 'Verify all changes were recorded.' },
    ],
  },
];

export function getMissions(): Mission[] {
  return MISSIONS;
}

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function createMissionSession(): MissionSession {
  return {
    missionId: null,
    currentStep: 0,
    score: 0,
    startedAt: null,
    completed: false,
    hintsUsed: 0,
  };
}

export function startMission(missionId: string): MissionSession {
  return {
    missionId,
    currentStep: 0,
    score: 100,
    startedAt: new Date().toISOString(),
    completed: false,
    hintsUsed: 0,
  };
}

export function useHint(session: MissionSession): MissionSession {
  return {
    ...session,
    hintsUsed: session.hintsUsed + 1,
    score: Math.max(0, session.score - 10),
  };
}

export function completeStep(session: MissionSession, totalSteps: number): MissionSession {
  const next = session.currentStep + 1;
  return {
    ...session,
    currentStep: Math.min(next, totalSteps - 1),
    completed: next >= totalSteps,
  };
}
