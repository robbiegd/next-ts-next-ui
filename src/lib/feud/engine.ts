import { type FastMoneyState, type GameState, type QuestionState, type TeamId } from './types';

export interface ActionResult {
  state: GameState;
  sounds: string[];
}

export type HostAction =
  | { type: 'start-round'; question: QuestionState }
  | { type: 'arm-buzzer' }
  | { type: 'reset-buzzer' }
  | { type: 'set-control'; team: TeamId }
  | { type: 'reveal'; index: number }
  | { type: 'strike' }
  | { type: 'start-steal' }
  | { type: 'award'; team: TeamId }
  | { type: 'end-round' }
  | { type: 'start-fastmoney'; questions: QuestionState[]; team: TeamId }
  | {
      type: 'fm-set';
      player: 1 | 2;
      slot: number;
      answer: string;
      points: number;
    }
  | { type: 'fm-reveal-answer'; player: 1 | 2; slot: number }
  | { type: 'fm-reveal-points'; player: 1 | 2; slot: number }
  | { type: 'fm-switch-player'; player: 1 | 2 }
  | { type: 'finish-fastmoney' }
  | { type: 'finish-game' }
  | { type: 'reset-game' };

const MAX_STRIKES = 3;

function otherTeam(team: TeamId): TeamId {
  return team === 'A' ? 'B' : 'A';
}

export function fastMoneyTotal(fm: FastMoneyState): number {
  let total = 0;
  for (const player of ['p1', 'p2'] as const) {
    for (const slot of fm.slots[player]) {
      if (slot.pointsRevealed) {
        total += slot.points;
      }
    }
  }
  return total;
}

function emptySlots() {
  return Array.from({ length: 5 }, () => ({
    answer: '',
    points: 0,
    answerRevealed: false,
    pointsRevealed: false
  }));
}

/**
 * Pure reducer for the Family Feud game — Big Buzzer Edition rules:
 * 3 Face Off rounds (rounds 2 & 3 double points, 3 strikes then a steal),
 * then Fast Money worth triple points for the team that plays it.
 */
export function applyAction(current: GameState, action: HostAction): ActionResult {
  const state: GameState = structuredClone(current);
  const sounds: string[] = [];

  switch (action.type) {
    case 'start-round': {
      state.phase = 'faceoff';
      state.round = Math.min(state.round + 1, 3);
      state.multiplier = state.round >= 2 ? 2 : 1;
      state.pot = 0;
      state.strikes = 0;
      state.control = null;
      state.stealTeam = null;
      state.question = action.question;
      state.buzzer = { armed: true, winner: null, entries: [] };
      sounds.push('faceoff');
      break;
    }
    case 'arm-buzzer': {
      state.buzzer = { armed: true, winner: null, entries: [] };
      break;
    }
    case 'reset-buzzer': {
      state.buzzer = { armed: false, winner: null, entries: [] };
      break;
    }
    case 'set-control': {
      state.control = action.team;
      state.stealTeam = null;
      state.buzzer.armed = false;
      break;
    }
    case 'reveal': {
      const answer = state.question?.answers[action.index];
      if (answer && !answer.revealed) {
        answer.revealed = true;
        state.pot += answer.points;
        sounds.push('reveal');
      }
      break;
    }
    case 'strike': {
      if (state.strikes < MAX_STRIKES) {
        state.strikes += 1;
        sounds.push('strike');
      }
      if (state.strikes >= MAX_STRIKES && state.control) {
        state.stealTeam = otherTeam(state.control);
        sounds.push('steal');
      }
      break;
    }
    case 'start-steal': {
      if (state.control) {
        state.stealTeam = otherTeam(state.control);
        sounds.push('steal');
      }
      break;
    }
    case 'award': {
      state.scores[action.team] += state.pot * state.multiplier;
      state.pot = 0;
      state.control = null;
      state.stealTeam = null;
      if (state.question) {
        for (const answer of state.question.answers) {
          answer.revealed = true;
        }
      }
      sounds.push('applause');
      break;
    }
    case 'end-round': {
      state.question = null;
      state.pot = 0;
      state.strikes = 0;
      state.control = null;
      state.stealTeam = null;
      state.buzzer = { armed: false, winner: null, entries: [] };
      break;
    }
    case 'start-fastmoney': {
      state.phase = 'fastmoney';
      state.question = null;
      state.fastMoney = {
        questions: action.questions,
        slots: { p1: emptySlots(), p2: emptySlots() },
        activePlayer: 1,
        team: action.team
      };
      sounds.push('fastmoney');
      break;
    }
    case 'fm-set': {
      const slot = state.fastMoney?.slots[action.player === 1 ? 'p1' : 'p2'][action.slot];
      if (slot) {
        slot.answer = action.answer;
        slot.points = action.points;
      }
      break;
    }
    case 'fm-reveal-answer': {
      const slot = state.fastMoney?.slots[action.player === 1 ? 'p1' : 'p2'][action.slot];
      if (slot && !slot.answerRevealed) {
        slot.answerRevealed = true;
        sounds.push('reveal');
      }
      break;
    }
    case 'fm-reveal-points': {
      const slot = state.fastMoney?.slots[action.player === 1 ? 'p1' : 'p2'][action.slot];
      if (slot && slot.answerRevealed && !slot.pointsRevealed) {
        slot.pointsRevealed = true;
        sounds.push(slot.points > 0 ? 'reveal' : 'strike');
      }
      break;
    }
    case 'fm-switch-player': {
      if (state.fastMoney) {
        state.fastMoney.activePlayer = action.player;
      }
      break;
    }
    case 'finish-fastmoney': {
      if (state.fastMoney) {
        state.scores[state.fastMoney.team] += fastMoneyTotal(state.fastMoney) * 3;
        sounds.push('applause');
      }
      break;
    }
    case 'finish-game': {
      state.phase = 'final';
      if (state.scores.A === state.scores.B) {
        state.winner = null;
      } else {
        state.winner = state.scores.A > state.scores.B ? 'A' : 'B';
      }
      sounds.push('applause');
      break;
    }
    case 'reset-game': {
      return {
        state: {
          ...state,
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
        },
        sounds
      };
    }
  }

  return { state, sounds };
}
