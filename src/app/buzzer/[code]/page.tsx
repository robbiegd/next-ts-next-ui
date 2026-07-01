'use client';

import { use, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { type TeamId } from '@/lib/feud/types';
import { useGame } from '@/lib/hooks/use-game';

interface PageProperties {
  params: Promise<{ code: string }>;
}

function getDeviceId(): string {
  const key = 'feud-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

export default function BuzzerPage({ params }: PageProperties) {
  const { code } = use(params);
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamId | null>(null);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'first' | 'late'>('idle');

  const { snapshot, connected, error } = useGame(code);
  const state = snapshot?.state;
  const armed = state?.buzzer.armed ?? false;
  const winner = state?.buzzer.winner ?? null;

  useEffect(() => {
    const savedName = localStorage.getItem('feud-player-name');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  useEffect(() => {
    // A newly armed buzzer clears local feedback
    if (armed && !winner) {
      setStatus('idle');
    }
  }, [armed, winner]);

  async function buzz() {
    if (!armed || status !== 'idle') {
      return;
    }
    setStatus('sent');
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
    try {
      const response = await fetch(`/api/games/${code}/buzz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, team, deviceId: getDeviceId() })
      });
      const data = (await response.json()) as { accepted?: boolean; first?: boolean };
      setStatus(data.accepted && data.first ? 'first' : 'late');
    } catch {
      setStatus('idle');
    }
  }

  if (error) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-blue-950 px-6 text-white'>
        <p className='text-xl font-bold'>Game “{code}” not found.</p>
      </main>
    );
  }

  if (!joined) {
    return (
      <main className='flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#1e3a8a_0%,_#0b1020_100%)] px-6 text-white'>
        <h1 className='text-2xl font-black text-amber-300'>Room {code}</h1>
        <input
          className='mt-6 w-full max-w-xs rounded-xl border-2 border-blue-400 bg-blue-950 px-4 py-3 text-center text-xl'
          maxLength={24}
          placeholder='Your name'
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <div className='mt-4 flex w-full max-w-xs gap-3'>
          {(['A', 'B'] as const).map((teamId) => (
            <button
              key={teamId}
              className={`flex-1 rounded-xl border-2 py-3 text-lg font-black uppercase transition ${
                team === teamId
                  ? 'border-amber-400 bg-amber-400 text-blue-950'
                  : 'border-blue-400 bg-blue-900 text-white'
              }`}
              type='button'
              onClick={() => {
                setTeam(teamId);
              }}
            >
              {teamId === 'A'
                ? (snapshot?.teamAName ?? 'Team A')
                : (snapshot?.teamBName ?? 'Team B')}
            </button>
          ))}
        </div>
        <button
          className='mt-6 w-full max-w-xs rounded-xl bg-red-600 py-4 text-xl font-black text-white uppercase disabled:opacity-40'
          disabled={name.trim().length === 0 || team === null}
          type='button'
          onClick={() => {
            localStorage.setItem('feud-player-name', name.trim());
            setJoined(true);
          }}
        >
          Let&apos;s feud!
        </button>
      </main>
    );
  }

  const indexAmWinner = winner !== null && status === 'first';
  const label = (() => {
    if (indexAmWinner) {
      return 'YOU BUZZED FIRST!';
    }
    if (winner) {
      return `${winner.name} buzzed first`;
    }
    if (armed) {
      return 'BUZZ!';
    }
    return 'Wait for it…';
  })();

  return (
    <main className='flex min-h-dvh flex-col items-center justify-between bg-[radial-gradient(ellipse_at_center,_#1e3a8a_0%,_#0b1020_100%)] px-6 py-8 text-white'>
      <div className='text-center'>
        <p className='text-sm font-bold tracking-widest text-blue-200 uppercase'>
          {name} · {team === 'A' ? snapshot?.teamAName : snapshot?.teamBName} · room {code}
        </p>
        <p className='mt-1 text-xs text-blue-300'>
          {connected ? '● connected' : '○ reconnecting…'}
        </p>
      </div>

      <motion.button
        animate={armed && !winner ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        className={`flex aspect-square w-full max-w-xs items-center justify-center rounded-full border-8 text-3xl font-black tracking-wide uppercase shadow-2xl transition-colors select-none ${
          indexAmWinner
            ? 'border-amber-300 bg-amber-400 text-blue-950'
            : winner
              ? 'border-blue-700 bg-blue-800 text-blue-300'
              : armed
                ? 'border-red-400 bg-gradient-to-b from-red-500 to-red-700 text-white active:from-red-600 active:to-red-800'
                : 'border-blue-800 bg-blue-900 text-blue-400'
        }`}
        transition={{ repeat: Infinity, duration: 1.6 }}
        type='button'
        onPointerDown={() => void buzz()}
      >
        {label}
      </motion.button>

      <p className='h-6 text-sm text-blue-200'>
        {armed && !winner
          ? 'Buzzer is live — smack it!'
          : winner
            ? 'Watch the board for what happens next.'
            : 'The host will arm the buzzer for the next Face Off.'}
      </p>
    </main>
  );
}
