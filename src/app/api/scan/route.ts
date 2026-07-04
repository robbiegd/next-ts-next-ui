import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ScannedCardSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string(),
      answers: z.array(
        z.object({
          text: z.string(),
          points: z.number()
        })
      )
    })
  )
});

const SUPPORTED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  if (!process.env['ANTHROPIC_API_KEY']) {
    return NextResponse.json(
      {
        error:
          'Card scanning needs an ANTHROPIC_API_KEY environment variable. Add one to .env (or your Vercel project settings) or enter the card manually.'
      },
      { status: 501 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('image');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Attach an image file as "image"' }, { status: 400 });
  }

  const mediaType = SUPPORTED_MEDIA_TYPES.has(file.type) ? file.type : 'image/jpeg';
  const data = Buffer.from(await file.arrayBuffer()).toString('base64');

  const client = new Anthropic();

  const response = await client.messages.parse({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data
            }
          },
          {
            type: 'text',
            text: 'This is a photo of a Family Feud survey question card. The card may be rotated. Extract every survey question on the card along with its answers and their survey point values (the numbers next to each answer). Fast Money cards contain multiple questions (Q1, Q2, Q3...); Face Off cards contain a single question with numbered answers. Transcribe answers exactly as printed, in the printed order.'
          }
        ]
      }
    ],
    output_config: {
      format: zodOutputFormat(ScannedCardSchema)
    }
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    return NextResponse.json(
      {
        error: 'Could not read the card from that photo — try a clearer shot or enter it manually.'
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ questions: response.parsed_output.questions });
}
