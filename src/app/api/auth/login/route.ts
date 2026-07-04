import { NextResponse } from 'next/server';

import { checkCredentials, createSession, destroySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  if (!checkCredentials(body?.username ?? '', body?.password ?? '')) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
