export type TeamId = 'A' | 'B';

export interface AnswerState {
  text: string;
  points: number;
  revealed: boolean;
}

export interface QuestionState {
  id: string;
  text: string;
  answers: AnswerState[];
}

export interface BuzzEntry {
  name: string;
  team: TeamId;
  deviceId: string;
  at: number;
}

export interface FastMoneySlot {
  answer: string;
  points: number;
  answerRevealed: boolean;
  pointsRevealed: boolean;
}

export interface FastMoneyState {
  questions: QuestionState[];
  slots: Record<'p1' | 'p2', FastMoneySlot[]>;
  activePlayer: 1 | 2;
  team: TeamId;
}

export interface GameState {
  phase: 'lobby' | 'faceoff' | 'fastmoney' | 'final';
  round: number;
  multiplier: 1 | 2;
  scores: Record<TeamId, number>;
  pot: number;
  strikes: number;
  control: TeamId | null;
  stealTeam: TeamId | null;
  question: QuestionState | null;
  buzzer: {
    armed: boolean;
    winner: BuzzEntry | null;
    entries: BuzzEntry[];
  };
  fastMoney: FastMoneyState | null;
  winner: TeamId | null;
}

export interface GameSnapshot {
  code: string;
  name: string;
  teamAName: string;
  teamBName: string;
  status: string;
  state: GameState;
}

export interface FeudEvent {
  seq: number;
  type: 'state' | 'sound' | 'buzz';
  payload: Record<string, unknown>;
}

export function initialGameState(): GameState {
  return {
    phase: 'lobby',
    round: 0,
    multiplier: 1,
    scores: { A: 0, B: 0 },
    pot: 0,
    strikes: 0,
    control: null,
    stealTeam: null,
    question: null,
    buzzer: { armed: false, winner: null, entries: [] },
    fastMoney: null,
    winner: null
  };
}
