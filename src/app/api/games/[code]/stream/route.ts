import { prisma } from '@/lib/db';
import { getGame } from '@/lib/feud/store';

export const dynamic = 'force-dynamic';
// Vercel: keep each SSE connection under the function limit; the browser's
// EventSource reconnects automatically with Last-Event-ID.
export const maxDuration = 60;

const POLL_INTERVAL_MS = 400;
const MAX_STREAM_MS = 55_000;

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { code } = await context.params;
  const game = await getGame(code);
  if (!game) {
    return new Response('Game not found', { status: 404 });
  }

  const url = new URL(request.url);
  const headerLastId = request.headers.get('last-event-id');
  const queryLastId = url.searchParams.get('lastSeq');
  let lastSeq = Number.parseInt(headerLastId ?? queryLastId ?? '0', 10);
  if (Number.isNaN(lastSeq)) {
    lastSeq = 0;
  }

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: { seq: number; type: string; payload: unknown }) => {
        controller.enqueue(
          encoder.encode(
            `id: ${event.seq}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`
          )
        );
      };

      // Initial snapshot so late joiners render immediately
      const fresh = await getGame(code);
      if (fresh) {
        controller.enqueue(
          encoder.encode(
            `event: snapshot\ndata: ${JSON.stringify({
              code: fresh.code,
              name: fresh.name,
              teamAName: fresh.teamAName,
              teamBName: fresh.teamBName,
              status: fresh.status,
              state: fresh.state
            })}\n\n`
          )
        );
      }

      let closed = false;
      const abort = () => {
        closed = true;
      };
      request.signal.addEventListener('abort', abort);

      try {
        while (!closed && Date.now() - startedAt < MAX_STREAM_MS) {
          const events = await prisma.gameEvent.findMany({
            where: { gameId: game.id, seq: { gt: lastSeq } },
            orderBy: { seq: 'asc' },
            take: 100
          });
          for (const event of events) {
            send({ seq: event.seq, type: event.type, payload: event.payload });
            lastSeq = event.seq;
          }
          if (events.length === 0) {
            controller.enqueue(encoder.encode(': ping\n\n'));
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      } catch {
        // Client disconnected mid-write — nothing to clean up beyond closing.
      } finally {
        request.signal.removeEventListener('abort', abort);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
