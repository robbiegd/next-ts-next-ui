'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { type GameSnapshot } from '@/lib/feud/types';

export default function HomePage() {
  const router = useRouter();
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createGame() {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamAName: teamA, teamBName: teamB })
      });
      if (!response.ok) {
        throw new Error('create failed');
      }
      const data = (await response.json()) as { game: GameSnapshot };
      router.push(`/host/${data.game.code}`);
    } catch {
      setError('Could not create a game — is the database running? (pnpm db:dev)');
      setCreating(false);
    }
  }

  return (
    <main className='flex w-full flex-col items-center px-4 py-10'>
      <div className='w-full max-w-xl space-y-8'>
        <div className='text-center'>
          <div className='inline-block rounded-full bg-gradient-to-b from-blue-700 to-blue-950 px-10 py-6 shadow-xl ring-4 ring-amber-400'>
            <h1 className='text-4xl font-black tracking-tight text-amber-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-5xl'>
              FAMILY FEUD
            </h1>
            <p className='mt-1 text-sm font-bold tracking-widest text-blue-100 uppercase'>
              Summer Edition
            </p>
          </div>
          <p className='text-foreground/70 mx-auto mt-6 max-w-md text-sm'>
            Survey says… game night! Put the board on the big TV, run the game from the host
            console, and let everyone join in on their phones as buzzers.
          </p>
        </div>

        <section className='border-border rounded-2xl border p-6 shadow-sm'>
          <h2 className='text-lg font-bold'>Start a new game</h2>
          <p className='text-foreground/60 mb-4 text-sm'>
            You&apos;ll get a room code to share with the TV and everyone&apos;s phones.
          </p>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input
              className='border-border bg-background rounded-lg border px-3 py-2 text-sm'
              maxLength={20}
              placeholder='Team A name (e.g. The Smiths)'
              value={teamA}
              onChange={(event) => {
                setTeamA(event.target.value);
              }}
            />
            <input
              className='border-border bg-background rounded-lg border px-3 py-2 text-sm'
              maxLength={20}
              placeholder='Team B name (e.g. The Does)'
              value={teamB}
              onChange={(event) => {
                setTeamB(event.target.value);
              }}
            />
          </div>
          <button
            className='mt-4 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50'
            disabled={creating}
            type='button'
            onClick={() => void createGame()}
          >
            {creating ? 'Creating…' : 'Create game & open host console'}
          </button>
          {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
        </section>

        <section className='border-border rounded-2xl border p-6 shadow-sm'>
          <h2 className='text-lg font-bold'>Join a game</h2>
          <p className='text-foreground/60 mb-4 text-sm'>
            Enter the room code from the host screen.
          </p>
          <div className='flex gap-3'>
            <input
              className='border-border bg-background w-32 rounded-lg border px-3 py-2 text-center font-mono text-lg tracking-widest uppercase'
              maxLength={4}
              placeholder='CODE'
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value.toUpperCase());
              }}
            />
            <button
              className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50'
              disabled={joinCode.length !== 4}
              type='button'
              onClick={() => {
                router.push(`/buzzer/${joinCode}`);
              }}
            >
              📱 Phone buzzer
            </button>
            <button
              className='flex-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50'
              disabled={joinCode.length !== 4}
              type='button'
              onClick={() => {
                router.push(`/board/${joinCode}`);
              }}
            >
              📺 TV board
            </button>
          </div>
        </section>

        <p className='text-foreground/50 text-center text-xs'>
          Manage questions, scan card photos, and customize sounds in the{' '}
          <a className='underline' href='/admin'>
            admin panel
          </a>
          .
        </p>
      </div>
    </main>
  );
}
