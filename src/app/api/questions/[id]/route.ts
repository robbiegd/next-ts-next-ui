import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface QuestionInput {
  text?: string;
  category?: string;
  answers?: { text?: string; points?: number }[];
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as QuestionInput | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const answers = (body.answers ?? [])
    .map((answer) => ({
      text: answer.text?.trim() ?? '',
      points: Math.max(0, Math.min(100, Math.round(answer.points ?? 0)))
    }))
    .filter((answer) => answer.text.length > 0);

  const question = await prisma.$transaction(async (tx) => {
    if (body.answers) {
      await tx.answer.deleteMany({ where: { questionId: id } });
    }
    return tx.question.update({
      where: { id },
      data: {
        ...(body.text?.trim() ? { text: body.text.trim() } : {}),
        ...(body.category?.trim() ? { category: body.category.trim() } : {}),
        ...(body.answers
          ? {
              answers: {
                create: answers.map((answer, index) => ({
                  text: answer.text,
                  points: answer.points,
                  rank: index + 1
                }))
              }
            }
          : {})
      },
      include: { answers: { orderBy: { rank: 'asc' } } }
    });
  });

  return NextResponse.json({ question });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  await prisma.question.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
