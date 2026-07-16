/**
 * Training Missions / Scenarios — types.
 */
export interface Mission {
  id: string;
  title: string;
  description: string;
  adType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: MissionStep[];
}

export interface MissionStep {
  instruction: string;
  expectedAction: string;
  hint: string;
}

export interface MissionSession {
  missionId: string | null;
  currentStep: number;
  score: number;
  startedAt: string | null;
  completed: boolean;
  hintsUsed: number;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  setup: {
    campaignId: string;
    targetAcos: number;
  };
}
