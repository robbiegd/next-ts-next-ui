import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { SOUND_REGISTRY } from '@/lib/feud/sounds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const custom = await prisma.soundEffect.findMany({
    select: { key: true, name: true, mimeType: true, updatedAt: true }
  });
  const customByKey = new Map(custom.map((sound) => [sound.key, sound]));

  const sounds = SOUND_REGISTRY.map((definition) => {
    const override = customByKey.get(definition.key);
    return {
      ...definition,
      custom: Boolean(override),
      fileName: override?.name ?? null,
      url: override
        ? `/api/sounds/${definition.key}?v=${override.updatedAt.getTime()}`
        : `/sounds/${definition.key}.wav`
    };
  });

  return NextResponse.json({ sounds });
}
