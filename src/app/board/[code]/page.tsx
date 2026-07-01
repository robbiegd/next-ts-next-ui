'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { fastMoneyTotal } from '@/lib/feud/engine';
import { type AnswerState, type GameState } from '@/lib/feud/types';
import { useGame } from '@/lib/hooks/use-game';
import { SoundPlayer } from '@/lib/sound/player';

interface PageProperties {
  params: Promise<{ code: string }>;
}

function AnswerSlot({ answer, index }: { answer: AnswerState; index: number }) {
  return (
    <div className='relative h-16 [perspective:800px] sm:h-20'>
      <motion.div
        animate={{ rotateX: answer.revealed ? 180 : 0 }}
        className='absolute inset-0 [transform-style:preserve-3d]'
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Face down: numbered oval */}
        <div className='absolute inset-0 flex items-center justify-center rounded-lg border-2 border-blue-300/40 bg-gradient-to-b from-blue-600 to-blue-800 shadow-inner [backface-visibility:hidden]'>
          <span className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-blue-400 to-blue-600 text-2xl font-black text-white shadow sm:h-12 sm:w-12'>
            {index + 1}
          </span>
        </div>
        {/* Revealed: answer + points */}
        <div className='absolute inset-0 flex [transform:rotateX(180deg)] items-center justify-between rounded-lg border-2 border-amber-300/60 bg-gradient-to-b from-blue-500 to-blue-700 px-4 [backface-visibility:hidden]'>
          <span className='truncate text-lg font-extrabold tracking-wide text-white uppercase sm:text-2xl'>
            {answer.text}
          </span>
          <span className='ml-3 rounded bg-gradient-to-b from-amber-300 to-amber-500 px-3 py-1 text-xl font-black text-blue-950 sm:text-2xl'>
            {answer.points}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Strikes({ count, flash }: { count: number; flash: number }) {
  return (
    <>
      {/* Persistent small strikes */}
      <div className='flex items-center justify-center gap-2'>
        {Array.from({ length: 3 }, (_, index) => (
          <span
            key={index}
            className={`text-4xl font-black ${index < count ? 'text-red-500' : 'text-blue-900/60'}`}
          >
            ✕
          </span>
        ))}
      </div>
      {/* Full-screen flash on new strike */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            animate={{ opacity: 1, scale: 1 }}
            className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'
            exit={{ opacity: 0, scale: 1.4 }}
            initial={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.25 }}
          >
            <div className='flex gap-6'>
              {Array.from({ length: Math.min(count, 3) }, (_, index) => (
                <span
                  key={index}
                  className='rounded-3xl border-[10px] border-red-600 bg-black/70 px-10 py-4 text-[10rem] leading-none font-black text-red-600 shadow-2xl'
                >
                  X
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ScorePanel({ name, score, active }: { name: string; score: number; active: boolean }) {
  return (
    <div
      className={`flex min-w-36 flex-col items-center rounded-2xl border-4 px-6 py-4 shadow-xl transition sm:min-w-44 ${
        active
          ? 'border-amber-400 bg-gradient-to-b from-blue-600 to-blue-900'
          : 'border-blue-400/40 bg-gradient-to-b from-blue-800 to-blue-950'
      }`}
    >
      <span className='max-w-40 truncate text-sm font-bold tracking-widest text-blue-100 uppercase'>
        {name}
      </span>
      <span className='font-mono text-5xl font-black text-amber-300 sm:text-6xl'>{score}</span>
      {active && (
        <span className='mt-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-widest text-blue-950 uppercase'>
          Playing
        </span>
      )}
    </div>
  );
}

function FastMoneyBoard({ state }: { state: GameState }) {
  const fm = state.fastMoney;
  if (!fm) {
    return null;
  }
  const total = fastMoneyTotal(fm);

  return (
    <div className='w-full max-w-5xl'>
      <h2 className='mb-6 text-center text-5xl font-black tracking-widest text-red-500 uppercase drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]'>
        Fast Money
      </h2>
      <div className='grid grid-cols-2 gap-6'>
        {(['p1', 'p2'] as const).map((player, playerIndex) => (
          <div
            key={player}
            className={`space-y-2 rounded-2xl border-4 p-4 ${
              fm.activePlayer === playerIndex + 1
                ? 'border-amber-400 bg-blue-900/60'
                : 'border-blue-500/30 bg-blue-950/60'
            }`}
          >
            <p className='text-center text-sm font-black tracking-widest text-blue-100 uppercase'>
              Player {playerIndex + 1}
            </p>
            {fm.slots[player].map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className='flex items-center justify-between gap-2 rounded-lg bg-blue-800/80 px-3 py-2'
              >
                <span className='truncate text-lg font-bold text-white uppercase'>
                  {slot.answerRevealed ? slot.answer || '—' : `Q${slotIndex + 1}.`}
                </span>
                <span className='min-w-10 rounded bg-gradient-to-b from-amber-300 to-amber-500 px-2 text-center text-lg font-black text-blue-950'>
                  {slot.pointsRevealed ? slot.points : ''}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className='mt-6 flex items-center justify-center gap-4'>
        <span className='text-2xl font-black tracking-widest text-blue-100 uppercase'>Total</span>
        <span className='rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-2 font-mono text-5xl font-black text-blue-950'>
          {total}
        </span>
        <span className='text-xl font-bold text-blue-200'>× 3 = {total * 3}</span>
      </div>
    </div>
  );
}

export default function BoardPage({ params }: PageProperties) {
  const { code } = use(params);
  const playerReference = useRef<SoundPlayer | null>(null);
  playerReference.current ??= new SoundPlayer();
  const player = playerReference.current;

  const [soundOn, setSoundOn] = useState(false);
  const [strikeFlash, setStrikeFlash] = useState(0);
  const [buzzBanner, setBuzzBanner] = useState<{ name: string; team: 'A' | 'B' } | null>(null);

  const { snapshot, connected, error } = useGame(code, {
    onSound: (key) => {
      player.play(key);
      if (key === 'strike') {
        setStrikeFlash(Date.now());
        setTimeout(() => {
          setStrikeFlash(0);
        }, 1600);
      }
    },
    onBuzz: (buzz) => {
      if (buzz.first) {
        setBuzzBanner({ name: buzz.name, team: buzz.team });
        setTimeout(() => {
          setBuzzBanner(null);
        }, 4000);
      }
    }
  });

  useEffect(() => {
    void player.loadManifest();
  }, [player]);

  const state = snapshot?.state;
  const teamName = useMemo(
    () => ({ A: snapshot?.teamAName ?? 'Team A', B: snapshot?.teamBName ?? 'Team B' }),
    [snapshot]
  );

  if (error) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-blue-950 text-white'>
        <p className='text-2xl font-bold'>Game “{code}” not found.</p>
      </main>
    );
  }

  return (
    <main className='relative flex min-h-dvh flex-col items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1e3a8a_0%,_#172554_55%,_#0b1020_100%)] px-4 py-6 text-white'>
      {/* Tile texture */}
      <div className='pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px] opacity-20' />

      {/* Header */}
      <div className='relative z-10 flex w-full max-w-6xl items-center justify-between'>
        <ScorePanel
          active={state?.control === 'A'}
          name={teamName.A}
          score={state?.scores.A ?? 0}
        />
        <div className='flex flex-col items-center'>
          <div className='rounded-full bg-gradient-to-b from-blue-600 to-blue-900 px-8 py-3 shadow-xl ring-4 ring-amber-400'>
            <span className='text-3xl font-black tracking-tight text-amber-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-4xl'>
              FAMILY FEUD
            </span>
          </div>
          {state?.phase === 'faceoff' && state.round > 0 && (
            <span className='mt-2 rounded-full bg-red-600 px-4 py-1 text-sm font-black tracking-widest uppercase'>
              Round {state.round}
              {state.multiplier > 1 ? ` · Double points` : ''}
            </span>
          )}
        </div>
        <ScorePanel
          active={state?.control === 'B'}
          name={teamName.B}
          score={state?.scores.B ?? 0}
        />
      </div>

      {/* Main area */}
      <div className='relative z-10 mt-6 flex w-full max-w-5xl flex-1 flex-col items-center justify-center'>
        {!state || state.phase === 'lobby' || (state.phase === 'faceoff' && !state.question) ? (
          <div className='text-center'>
            <p className='text-3xl font-bold text-blue-100'>Get ready to play!</p>
            <p className='mt-4 text-xl text-blue-200'>
              Join with your phone at{' '}
              <span className='rounded bg-blue-800 px-2 py-1 font-mono font-bold text-amber-300'>
                /buzzer/{code}
              </span>
            </p>
            <p className='mt-2 font-mono text-7xl font-black tracking-[0.3em] text-amber-300'>
              {code}
            </p>
          </div>
        ) : state.phase === 'fastmoney' ? (
          <FastMoneyBoard state={state} />
        ) : state.phase === 'final' ? (
          <div className='text-center'>
            <p className='text-2xl font-bold tracking-widest text-blue-100 uppercase'>
              Survey says…
            </p>
            <p className='mt-4 text-6xl font-black text-amber-300'>
              {state.winner ? `${teamName[state.winner]} wins!` : "It's a tie!"}
            </p>
            <p className='mt-6 text-3xl font-bold text-blue-100'>
              {teamName.A} {state.scores.A} — {state.scores.B} {teamName.B}
            </p>
          </div>
        ) : (
          <div className='w-full'>
            <div className='mx-auto mb-5 max-w-3xl rounded-2xl border-2 border-amber-400/70 bg-blue-950/70 px-6 py-4 text-center'>
              <p className='text-2xl font-extrabold text-white uppercase sm:text-3xl'>
                {state.question?.text}
              </p>
            </div>

            <div className='mx-auto grid max-w-4xl grid-cols-1 gap-3 rounded-3xl border-8 border-blue-400/30 bg-blue-950/60 p-5 shadow-2xl sm:grid-cols-2'>
              {state.question?.answers.map((answer, index) => (
                <AnswerSlot key={index} answer={answer} index={index} />
              ))}
            </div>

            <div className='mt-5 flex items-center justify-center gap-8'>
              <Strikes count={state.strikes} flash={strikeFlash} />
              <div className='flex items-center gap-3'>
                <span className='text-sm font-black tracking-widest text-blue-200 uppercase'>
                  Pot
                </span>
                <span className='rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-1 font-mono text-4xl font-black text-blue-950'>
                  {state.pot * state.multiplier}
                </span>
              </div>
              {state.stealTeam && (
                <span className='animate-pulse rounded-full bg-red-600 px-4 py-2 text-lg font-black tracking-widest uppercase'>
                  {teamName[state.stealTeam]} can steal!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buzz banner */}
      <AnimatePresence>
        {buzzBanner && (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className='fixed bottom-10 z-50 rounded-2xl border-4 border-amber-400 bg-red-600 px-10 py-4 shadow-2xl'
            exit={{ y: 80, opacity: 0 }}
            initial={{ y: 80, opacity: 0 }}
          >
            <p className='text-3xl font-black text-white uppercase'>
              🔔 {buzzBanner.name} — {teamName[buzzBanner.team]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer controls */}
      <div className='relative z-10 mt-4 flex items-center gap-3 text-xs text-blue-300'>
        <button
          className={`rounded-full px-4 py-1.5 font-bold uppercase ${
            soundOn ? 'bg-amber-400 text-blue-950' : 'bg-blue-800 text-blue-100'
          }`}
          type='button'
          onClick={() => {
            if (soundOn) {
              player.enabled = false;
              player.stopTheme();
              setSoundOn(false);
            } else {
              player.enabled = true;
              player.unlock();
              setSoundOn(true);
            }
          }}
        >
          {soundOn ? '🔊 Sound on' : '🔇 Tap to enable sound'}
        </button>
        <span>{connected ? '● live' : '○ reconnecting…'}</span>
        <span className='font-mono'>room {code}</span>
      </div>
    </main>
  );
}
