'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function BuzzerJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#1e3a8a_0%,_#0b1020_100%)] px-6 text-white'>
      <h1 className='text-3xl font-black text-amber-300'>Join as a buzzer</h1>
      <p className='mt-2 text-sm text-blue-200'>Enter the room code from the TV or host screen.</p>
      <input
        autoFocus
        className='mt-6 w-48 rounded-xl border-2 border-blue-400 bg-blue-950 px-4 py-3 text-center font-mono text-3xl tracking-[0.4em] text-amber-300 uppercase'
        maxLength={4}
        placeholder='CODE'
        value={code}
        onChange={(event) => {
          setCode(event.target.value.toUpperCase());
        }}
      />
      <button
        className='mt-4 w-48 rounded-xl bg-red-600 py-3 text-lg font-black text-white uppercase disabled:opacity-40'
        disabled={code.length !== 4}
        type='button'
        onClick={() => {
          router.push(`/buzzer/${code}`);
        }}
      >
        Join
      </button>
    </main>
  );
}
