import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { getGame, toSnapshot } from '@/lib/feud/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const game = await getGame(code);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const last = await prisma.gameEvent.findFirst({
    where: { gameId: game.id },
    orderBy: { seq: 'desc' },
    select: { seq: true }
  });

  return NextResponse.json({ game: toSnapshot(game), lastSeq: last?.seq ?? 0 });
}
