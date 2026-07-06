'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type GameSnapshot, type GameState } from '@/lib/feud/types';

export interface BuzzEventPayload {
  name: string;
  team: 'A' | 'B';
  first: boolean;
  at: number;
}

interface UseGameOptions {
  onSound?: (key: string) => void;
  onBuzz?: (buzz: BuzzEventPayload) => void;
}

/**
 * Subscribes to a game's SSE stream. The server closes each stream after
 * ~55s (Vercel function limits); EventSource reconnects automatically and we
 * resume from the last seen sequence number.
 */
export function useGame(code: string | null, options: UseGameOptions = {}) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSeqReference = useRef(0);
  const optionsReference = useRef(options);
  optionsReference.current = options;

  useEffect(() => {
    if (!code) {
      return;
    }

    let source: EventSource | null = null;
    let stopped = false;

    const connect = () => {
      if (stopped) {
        return;
      }
      source = new EventSource(
        `/api/games/${encodeURIComponent(code)}/stream?lastSeq=${lastSeqReference.current}`
      );

      source.addEventListener('open', () => {
        setConnected(true);
        setError(null);
      });

      source.addEventListener('snapshot', (event) => {
        setSnapshot(JSON.parse((event as MessageEvent<string>).data) as GameSnapshot);
      });

      source.addEventListener('state', (event) => {
        const message = event as MessageEvent<string>;
        if (message.lastEventId) {
          lastSeqReference.current =
            Number.parseInt(message.lastEventId, 10) || lastSeqReference.current;
        }
        const payload = JSON.parse(message.data) as { state: GameState };
        setSnapshot((previous) => (previous ? { ...previous, state: payload.state } : previous));
      });

      source.addEventListener('sound', (event) => {
        const message = event as MessageEvent<string>;
        if (message.lastEventId) {
          lastSeqReference.current =
            Number.parseInt(message.lastEventId, 10) || lastSeqReference.current;
        }
        const payload = JSON.parse(message.data) as { key: string };
        optionsReference.current.onSound?.(payload.key);
      });

      source.addEventListener('buzz', (event) => {
        const message = event as MessageEvent<string>;
        if (message.lastEventId) {
          lastSeqReference.current =
            Number.parseInt(message.lastEventId, 10) || lastSeqReference.current;
        }
        optionsReference.current.onBuzz?.(JSON.parse(message.data) as BuzzEventPayload);
      });

      source.addEventListener('error', () => {
        setConnected(false);
        source?.close();
        if (!stopped) {
          setTimeout(connect, 1000);
        }
      });
    };

    // Fetch once for immediate render, then stream
    fetch(`/api/games/${encodeURIComponent(code)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Game not found');
        }
        const data = (await response.json()) as { game: GameSnapshot; lastSeq: number };
        lastSeqReference.current = data.lastSeq;
        setSnapshot(data.game);
        connect();
      })
      .catch(() => {
        setError('Game not found');
      });

    return () => {
      stopped = true;
      source?.close();
    };
  }, [code]);

  const sendAction = useCallback(
    async (action: Record<string, unknown>) => {
      if (!code) {
        return null;
      }
      const response = await fetch(`/api/games/${encodeURIComponent(code)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as { game?: GameSnapshot };
      if (data.game) {
        setSnapshot(data.game);
      }
      return data;
    },
    [code]
  );

  return { snapshot, connected, error, sendAction };
}
