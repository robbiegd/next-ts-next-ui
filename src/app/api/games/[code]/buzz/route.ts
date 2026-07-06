import { NextResponse } from 'next/server';

import { commitGameState, getGame } from '@/lib/feud/store';
import { type GameState, type TeamId } from '@/lib/feud/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    team?: TeamId;
    deviceId?: string;
  } | null;

  if (!body?.name || (body.team !== 'A' && body.team !== 'B')) {
    return NextResponse.json({ error: 'Missing name or team' }, { status: 400 });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const game = await getGame(code);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const state = structuredClone(game.state as unknown as GameState);
    if (!state.buzzer.armed) {
      return NextResponse.json({ accepted: false, reason: 'not-armed' });
    }

    const entry = {
      name: body.name.slice(0, 24),
      team: body.team,
      deviceId: body.deviceId ?? '',
      at: Date.now()
    };

    const isFirst = state.buzzer.winner === null;
    if (isFirst) {
      state.buzzer.winner = entry;
    }
    state.buzzer.entries.push(entry);

    const committed = await commitGameState({
      gameId: game.id,
      updatedAt: game.updatedAt,
      state,
      sounds: isFirst ? ['buzz-in'] : [],
      extraEvents: [{ type: 'buzz', payload: { ...entry, first: isFirst } }]
    });
    if (!committed) {
      continue;
    }

    return NextResponse.json({ accepted: true, first: isFirst });
  }

  return NextResponse.json({ error: 'Conflict, please retry' }, { status: 409 });
}
