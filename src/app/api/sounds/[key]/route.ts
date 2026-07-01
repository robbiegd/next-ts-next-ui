import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { SOUND_KEYS } from '@/lib/feud/sounds';

export const dynamic = 'force-dynamic';

const MAX_SOUND_BYTES = 4 * 1024 * 1024;

interface RouteContext {
  params: Promise<{ key: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params;
  const sound = await prisma.soundEffect.findUnique({ where: { key } });
  if (!sound) {
    return NextResponse.json({ error: 'No custom sound for this key' }, { status: 404 });
  }
  return new Response(Buffer.from(sound.data), {
    headers: {
      'Content-Type': sound.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { key } = await context.params;
  if (!SOUND_KEYS.has(key)) {
    return NextResponse.json({ error: 'Unknown sound key' }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('audio');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Attach an audio file as "audio"' }, { status: 400 });
  }
  if (!file.type.startsWith('audio/')) {
    return NextResponse.json({ error: 'File must be audio' }, { status: 400 });
  }
  if (file.size > MAX_SOUND_BYTES) {
    return NextResponse.json({ error: 'Sound files are limited to 4 MB' }, { status: 413 });
  }

  const data = Buffer.from(await file.arrayBuffer());
  await prisma.soundEffect.upsert({
    where: { key },
    create: { key, name: file.name, mimeType: file.type, data },
    update: { name: file.name, mimeType: file.type, data }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { key } = await context.params;
  await prisma.soundEffect.delete({ where: { key } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
