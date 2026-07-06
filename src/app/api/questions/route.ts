import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const questions = await prisma.question.findMany({
    include: { answers: { orderBy: { rank: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ questions });
}

interface QuestionInput {
  text?: string;
  category?: string;
  source?: string;
  answers?: { text?: string; points?: number }[];
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => null)) as QuestionInput | null;
  const text = body?.text?.trim();
  const answers = (body?.answers ?? [])
    .map((answer) => ({
      text: answer.text?.trim() ?? '',
      points: Math.max(0, Math.min(100, Math.round(answer.points ?? 0)))
    }))
    .filter((answer) => answer.text.length > 0);

  if (!text || answers.length === 0) {
    return NextResponse.json(
      { error: 'A question and at least one answer are required' },
      { status: 400 }
    );
  }

  const question = await prisma.question.create({
    data: {
      text,
      category: body?.category?.trim() || 'general',
      source: body?.source?.trim() || 'custom',
      answers: {
        create: answers.map((answer, index) => ({
          text: answer.text,
          points: answer.points,
          rank: index + 1
        }))
      }
    },
    include: { answers: { orderBy: { rank: 'asc' } } }
  });

  return NextResponse.json({ question }, { status: 201 });
}
