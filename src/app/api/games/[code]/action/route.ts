import type { HostAction } from '@/lib/feud/engine';

import { NextResponse } from 'next/server';

import { applyAction } from '@/lib/feud/engine';
import { SOUND_KEYS } from '@/lib/feud/sounds';
import { commitGameState, getGame, toSnapshot } from '@/lib/feud/store';
import { type GameState } from '@/lib/feud/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ code: string }>;
}

function statusForPhase(phase: GameState['phase']): string {
  switch (phase) {
    case 'lobby': {
      return 'lobby';
    }
    case 'faceoff': {
      return 'faceoff';
    }
    case 'fastmoney': {
      return 'fast-money';
    }
    case 'final': {
      return 'finished';
    }
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | (HostAction & { type: string })
    | { type: 'play-sound'; key: string }
    | null;

  if (!body?.type) {
    return NextResponse.json({ error: 'Missing action type' }, { status: 400 });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const game = await getGame(code);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const state = game.state as unknown as GameState;

    // Sound-only actions do not mutate game state
    if (body.type === 'play-sound') {
      const key = (body as { key?: string }).key ?? '';
      if (!SOUND_KEYS.has(key)) {
        return NextResponse.json({ error: 'Unknown sound' }, { status: 400 });
      }
      const committed = await commitGameState({
        gameId: game.id,
        updatedAt: game.updatedAt,
        state,
        sounds: [key]
      });
      if (!committed) {
        continue;
      }
      return NextResponse.json({ ok: true });
    }

    const { state: nextState, sounds } = applyAction(state, body as HostAction);
    const committed = await commitGameState({
      gameId: game.id,
      updatedAt: game.updatedAt,
      state: nextState,
      status: statusForPhase(nextState.phase),
      sounds
    });
    if (!committed) {
      continue;
    }

    return NextResponse.json({
      game: { ...toSnapshot(game), status: statusForPhase(nextState.phase), state: nextState }
    });
  }

  return NextResponse.json({ error: 'Conflict, please retry' }, { status: 409 });
}
