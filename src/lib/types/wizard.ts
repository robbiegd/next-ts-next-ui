export type Team = 'blue' | 'red' | 'grey';
export type Tier = 'beginner' | 'intermediate' | 'advanced';
export type Experience = 'first-time' | 'some-experience' | 'know-it';
export type Complexity = 'simple' | 'mix' | 'chaos';

export type Character = {
  readonly id: string;
  readonly name: string;
  readonly team: Team;
  readonly tier: Tier;
  readonly ability: string;
  readonly isPrimary: boolean;
  readonly requiresPair?: string;
  readonly isBackup?: boolean;
};

export type WizardState = {
  step: 0 | 1 | 2 | 3 | 4;
  direction: 'forward' | 'back';
  playerCount: number;
  experience: Experience | null;
  complexity: Complexity | null;
  includeGrey: boolean;
  includeBackup: boolean;
};

export type SuggestInput = {
  playerCount: number;
  experience: Experience;
  complexity: Complexity;
  includeGrey: boolean;
  includeBackup: boolean;
};

export type HostageCounts = [number, number, number];

export type SuggestResult = {
  characters: Character[];
  totalCards: number;
  buriedCount: 1;
  hostagesPerRound: HostageCounts;
  colorSharingAllowed: boolean;
  roundTimingSuggestion: string;
};
