import { type Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';

import { type GameSnapshot, type GameState } from './types';

type JsonInput = Parameters<typeof JSON.stringify>[0];

/** Strips undefined values and class instances so Prisma's Json columns accept it. */
export function toJson(value: JsonInput): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateGameCode(): string {
  let code = '';
  for (let index = 0; index < 4; index++) {
    code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  }
  return code;
}

export async function getGame(code: string) {
  return prisma.game.findUnique({ where: { code: code.toUpperCase() } });
}

export function toSnapshot(game: {
  code: string;
  name: string;
  teamAName: string;
  teamBName: string;
  status: string;
  state: unknown;
}): GameSnapshot {
  return {
    code: game.code,
    name: game.name,
    teamAName: game.teamAName,
    teamBName: game.teamBName,
    status: game.status,
    state: game.state as GameState
  };
}

interface CommitOptions {
  gameId: string;
  updatedAt: Date;
  state: GameState;
  status?: string;
  sounds: string[];
  extraEvents?: { type: string; payload: Record<string, unknown> }[];
}

/**
 * Persist a new game state with optimistic locking (retried by callers on
 * `false`) and append the state snapshot + sound events for SSE consumers.
 */
export async function commitGameState(options: CommitOptions): Promise<boolean> {
  const { gameId, updatedAt, state, status, sounds, extraEvents = [] } = options;

  const updated = await prisma.game.updateMany({
    where: { id: gameId, updatedAt },
    data: {
      state: toJson(state),
      ...(status ? { status } : {})
    }
  });
  if (updated.count === 0) {
    return false;
  }

  const last = await prisma.gameEvent.findFirst({
    where: { gameId },
    orderBy: { seq: 'desc' },
    select: { seq: true }
  });
  let seq = (last?.seq ?? 0) + 1;

  const events = [
    ...sounds.map((key) => ({ type: 'sound', payload: { key } })),
    ...extraEvents,
    { type: 'state', payload: { state } }
  ];

  await prisma.gameEvent.createMany({
    data: events.map((event) => ({
      gameId,
      seq: seq++,
      type: event.type,
      payload: toJson(event.payload)
    }))
  });

  return true;
}
