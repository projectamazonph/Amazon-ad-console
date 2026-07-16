/**
 * Multi-User Trainee Profiles — types.
 */
export interface TraineeProfile {
  id: string;
  name: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ProfileState {
  activeProfileId: string;
  profiles: TraineeProfile[];
}
