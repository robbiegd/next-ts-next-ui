import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { generateGameCode, toJson, toSnapshot } from '@/lib/feud/store';
import { initialGameState } from '@/lib/feud/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    teamAName?: string;
    teamBName?: string;
  };

  let code = generateGameCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.game.findUnique({ where: { code } });
    if (!existing) {
      break;
    }
    code = generateGameCode();
  }

  const game = await prisma.game.create({
    data: {
      code,
      name: body.name?.trim() || 'Family Feud',
      teamAName: body.teamAName?.trim() || 'Team A',
      teamBName: body.teamBName?.trim() || 'Team B',
      status: 'lobby',
      state: toJson(initialGameState())
    }
  });

  return NextResponse.json({ game: toSnapshot(game) }, { status: 201 });
}
