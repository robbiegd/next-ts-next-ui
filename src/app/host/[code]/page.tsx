'use client';

import { use, useEffect, useMemo, useState } from 'react';

import { fastMoneyTotal } from '@/lib/feud/engine';
import { SOUND_REGISTRY } from '@/lib/feud/sounds';
import { type GameState, type TeamId } from '@/lib/feud/types';
import { useGame } from '@/lib/hooks/use-game';

interface PageProperties {
  params: Promise<{ code: string }>;
}

interface BankAnswer {
  id: string;
  text: string;
  points: number;
  rank: number;
}

interface BankQuestion {
  id: string;
  text: string;
  category: string;
  answers: BankAnswer[];
}

function toQuestionState(question: BankQuestion) {
  return {
    id: question.id,
    text: question.text,
    answers: question.answers.map((answer) => ({
      text: answer.text,
      points: answer.points,
      revealed: false
    }))
  };
}

const buttonBase =
  'rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40';

export default function HostPage({ params }: PageProperties) {
  const { code } = use(params);
  const { snapshot, connected, error, sendAction } = useGame(code);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [category, setCategory] = useState('all');
  const [fmSelection, setFmSelection] = useState<string[]>([]);
  const [fmTeam, setFmTeam] = useState<TeamId>('A');

  useEffect(() => {
    fetch('/api/questions')
      .then(async (response) => (await response.json()) as { questions: BankQuestion[] })
      .then((data) => {
        setQuestions(data.questions);
      })
      .catch(() => undefined);
  }, []);

  const state: GameState | undefined = snapshot?.state;
  const teamName = useMemo(
    () => ({ A: snapshot?.teamAName ?? 'Team A', B: snapshot?.teamBName ?? 'Team B' }),
    [snapshot]
  );

  const categories = useMemo(
    () => ['all', ...new Set(questions.map((question) => question.category))],
    [questions]
  );
  const filteredQuestions = useMemo(
    () =>
      category === 'all'
        ? questions
        : questions.filter((question) => question.category === category),
    [questions, category]
  );

  if (error) {
    return (
      <main className='flex flex-1 items-center justify-center'>
        <p className='text-lg font-bold'>Game “{code}” not found.</p>
      </main>
    );
  }

  if (!state) {
    return (
      <main className='flex flex-1 items-center justify-center'>
        <p className='text-foreground/60'>Loading game…</p>
      </main>
    );
  }

  const act = (action: Record<string, unknown>) => void sendAction(action);

  return (
    <main className='mx-auto w-full max-w-5xl space-y-6 px-4 py-6'>
      {/* Header */}
      <section className='border-border flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4'>
        <div>
          <h1 className='text-xl font-black'>
            Host console <span className='font-mono text-amber-500'>{code}</span>
          </h1>
          <p className='text-foreground/60 text-sm'>
            {connected ? '● live' : '○ reconnecting…'} · Board:{' '}
            <a className='underline' href={`/board/${code}`} rel='noreferrer' target='_blank'>
              /board/{code}
            </a>{' '}
            · Buzzers:{' '}
            <a className='underline' href={`/buzzer/${code}`} rel='noreferrer' target='_blank'>
              /buzzer/{code}
            </a>
          </p>
        </div>
        <div className='flex items-center gap-6 text-center'>
          <div>
            <p className='text-foreground/60 max-w-28 truncate text-xs uppercase'>{teamName.A}</p>
            <p className='font-mono text-3xl font-black'>{state.scores.A}</p>
          </div>
          <div>
            <p className='text-foreground/60 max-w-28 truncate text-xs uppercase'>{teamName.B}</p>
            <p className='font-mono text-3xl font-black'>{state.scores.B}</p>
          </div>
          <div>
            <p className='text-foreground/60 text-xs uppercase'>Phase</p>
            <p className='text-sm font-bold uppercase'>
              {state.phase}
              {state.phase === 'faceoff' && state.round > 0 ? ` R${state.round}` : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Active Face Off round */}
      {state.phase === 'faceoff' && state.question && (
        <section className='border-border space-y-4 rounded-2xl border p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='font-bold'>
              Round {state.round} {state.multiplier > 1 && '· double points'} — pot{' '}
              <span className='font-mono text-amber-500'>{state.pot * state.multiplier}</span>
            </h2>
            <p className='text-sm font-bold text-red-500'>
              Strikes: {'✕'.repeat(state.strikes) || 'none'}
              {state.stealTeam && ` — ${teamName[state.stealTeam]} can steal!`}
            </p>
          </div>

          <p className='text-lg font-semibold'>{state.question.text}</p>

          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {state.question.answers.map((answer, index) => (
              <button
                key={index}
                className={`${buttonBase} flex items-center justify-between border text-left ${
                  answer.revealed
                    ? 'border-green-600 bg-green-600/10 text-green-600'
                    : 'border-border hover:border-amber-500'
                }`}
                disabled={answer.revealed}
                type='button'
                onClick={() => {
                  act({ type: 'reveal', index });
                }}
              >
                <span>
                  {index + 1}. {answer.text}
                </span>
                <span className='font-mono'>{answer.points}</span>
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              className={`${buttonBase} bg-red-600 text-white hover:bg-red-500`}
              type='button'
              onClick={() => {
                act({ type: 'strike' });
              }}
            >
              ✕ Strike
            </button>
            <button
              className={`${buttonBase} border-border border`}
              type='button'
              onClick={() => {
                act({ type: 'set-control', team: 'A' });
              }}
            >
              {teamName.A} plays
            </button>
            <button
              className={`${buttonBase} border-border border`}
              type='button'
              onClick={() => {
                act({ type: 'set-control', team: 'B' });
              }}
            >
              {teamName.B} plays
            </button>
            <button
              className={`${buttonBase} border-border border`}
              disabled={!state.control || state.stealTeam !== null}
              type='button'
              onClick={() => {
                act({ type: 'start-steal' });
              }}
            >
              Offer steal
            </button>
            <button
              className={`${buttonBase} bg-amber-500 text-black hover:bg-amber-400`}
              type='button'
              onClick={() => {
                act({ type: 'award', team: 'A' });
              }}
            >
              Award pot → {teamName.A}
            </button>
            <button
              className={`${buttonBase} bg-amber-500 text-black hover:bg-amber-400`}
              type='button'
              onClick={() => {
                act({ type: 'award', team: 'B' });
              }}
            >
              Award pot → {teamName.B}
            </button>
            <button
              className={`${buttonBase} border-border border`}
              type='button'
              onClick={() => {
                act({ type: 'end-round' });
              }}
            >
              Clear board
            </button>
          </div>

          {/* Buzzer */}
          <div className='border-border rounded-xl border p-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm font-bold'>
                Buzzer: {state.buzzer.armed ? '🟢 armed' : '⚪ off'}
              </span>
              <button
                className={`${buttonBase} border-border border`}
                type='button'
                onClick={() => {
                  act({ type: 'arm-buzzer' });
                }}
              >
                Arm / clear
              </button>
              <button
                className={`${buttonBase} border-border border`}
                type='button'
                onClick={() => {
                  act({ type: 'reset-buzzer' });
                }}
              >
                Disarm
              </button>
              {state.buzzer.winner && (
                <span className='text-sm'>
                  🔔 First: <b>{state.buzzer.winner.name}</b> ({teamName[state.buzzer.winner.team]})
                </span>
              )}
            </div>
            {state.buzzer.entries.length > 1 && (
              <p className='text-foreground/60 mt-1 text-xs'>
                Then:{' '}
                {state.buzzer.entries
                  .slice(1)
                  .map((entry) => `${entry.name} (${entry.team})`)
                  .join(', ')}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Fast Money control */}
      {state.phase === 'fastmoney' && state.fastMoney && (
        <section className='border-border space-y-4 rounded-2xl border p-4'>
          <h2 className='font-bold'>
            Fast Money — {teamName[state.fastMoney.team]} · total{' '}
            <span className='font-mono text-amber-500'>{fastMoneyTotal(state.fastMoney)}</span> × 3
            = {fastMoneyTotal(state.fastMoney) * 3}
          </h2>
          <div className='flex gap-2'>
            {([1, 2] as const).map((playerNumber) => (
              <button
                key={playerNumber}
                className={`${buttonBase} border ${
                  state.fastMoney?.activePlayer === playerNumber
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-border'
                }`}
                type='button'
                onClick={() => {
                  act({ type: 'fm-switch-player', player: playerNumber });
                }}
              >
                Player {playerNumber}
              </button>
            ))}
          </div>

          <div className='space-y-4'>
            {state.fastMoney.questions.map((question, slotIndex) => {
              const playerNumber = state.fastMoney?.activePlayer ?? 1;
              const playerKey = playerNumber === 1 ? 'p1' : 'p2';
              const slot = state.fastMoney?.slots[playerKey][slotIndex];
              return (
                <div key={question.id} className='border-border rounded-xl border p-3'>
                  <p className='text-sm font-semibold'>
                    Q{slotIndex + 1}. {question.text}
                  </p>
                  <div className='mt-2 flex flex-wrap items-center gap-2'>
                    {question.answers.map((answer, answerIndex) => (
                      <button
                        key={answerIndex}
                        className={`${buttonBase} border-border border text-xs`}
                        type='button'
                        onClick={() => {
                          act({
                            type: 'fm-set',
                            player: playerNumber,
                            slot: slotIndex,
                            answer: answer.text,
                            points: answer.points
                          });
                        }}
                      >
                        {answer.text} · {answer.points}
                      </button>
                    ))}
                    <button
                      className={`${buttonBase} border border-red-400 text-xs text-red-500`}
                      type='button'
                      onClick={() => {
                        const custom = prompt('What did they answer? (0 points)') ?? '';
                        if (custom) {
                          act({
                            type: 'fm-set',
                            player: playerNumber,
                            slot: slotIndex,
                            answer: custom,
                            points: 0
                          });
                        }
                      }}
                    >
                      Not on board
                    </button>
                  </div>
                  <div className='mt-2 flex flex-wrap items-center gap-2 text-sm'>
                    <span className='text-foreground/70'>
                      P{playerNumber}: <b>{slot?.answer || '—'}</b> {slot ? `(${slot.points})` : ''}
                    </span>
                    <button
                      className={`${buttonBase} border-border border text-xs`}
                      disabled={!slot?.answer || slot.answerRevealed}
                      type='button'
                      onClick={() => {
                        act({ type: 'fm-reveal-answer', player: playerNumber, slot: slotIndex });
                      }}
                    >
                      Reveal answer
                    </button>
                    <button
                      className={`${buttonBase} border-border border text-xs`}
                      disabled={!slot?.answerRevealed || slot.pointsRevealed}
                      type='button'
                      onClick={() => {
                        act({ type: 'fm-reveal-points', player: playerNumber, slot: slotIndex });
                      }}
                    >
                      Reveal points
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex gap-2'>
            <button
              className={`${buttonBase} bg-amber-500 text-black hover:bg-amber-400`}
              type='button'
              onClick={() => {
                act({ type: 'finish-fastmoney' });
              }}
            >
              Add Fast Money total (×3) to {teamName[state.fastMoney.team]}
            </button>
            <button
              className={`${buttonBase} bg-blue-700 text-white hover:bg-blue-600`}
              type='button'
              onClick={() => {
                act({ type: 'finish-game' });
              }}
            >
              Finish game 🏆
            </button>
          </div>
        </section>
      )}

      {/* Question picker */}
      {state.phase !== 'final' && (
        <section className='border-border space-y-3 rounded-2xl border p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='font-bold'>Question bank</h2>
            <div className='flex items-center gap-2'>
              <select
                className='border-border bg-background rounded-lg border px-2 py-1 text-sm'
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                }}
              >
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <a className='text-sm underline' href='/admin' rel='noreferrer' target='_blank'>
                Manage / scan cards
              </a>
            </div>
          </div>

          <div className='max-h-72 space-y-2 overflow-y-auto pr-1'>
            {filteredQuestions.map((question) => {
              const selected = fmSelection.includes(question.id);
              return (
                <div
                  key={question.id}
                  className='border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2'
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold'>{question.text}</p>
                    <p className='text-foreground/50 text-xs'>
                      {question.category} · {question.answers.length} answers ·{' '}
                      {question.answers.map((answer) => answer.points).join('/')}
                    </p>
                  </div>
                  <div className='flex shrink-0 gap-2'>
                    <button
                      className={`${buttonBase} bg-blue-700 text-xs text-white hover:bg-blue-600`}
                      type='button'
                      onClick={() => {
                        act({
                          type: 'start-round',
                          question: toQuestionState(question)
                        });
                      }}
                    >
                      ▶ Face Off
                    </button>
                    <button
                      className={`${buttonBase} border text-xs ${
                        selected ? 'border-amber-500 bg-amber-500/10' : 'border-border'
                      }`}
                      type='button'
                      onClick={() => {
                        setFmSelection((previous) =>
                          selected
                            ? previous.filter((id) => id !== question.id)
                            : previous.length < 5
                              ? [...previous, question.id]
                              : previous
                        );
                      }}
                    >
                      {selected ? '✓ FM' : '+ FM'}
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredQuestions.length === 0 && (
              <p className='text-foreground/50 text-sm'>
                No questions yet — add some in the admin panel.
              </p>
            )}
          </div>

          <div className='border-border flex flex-wrap items-center gap-2 border-t pt-3'>
            <span className='text-sm font-bold'>Fast Money ({fmSelection.length}/5):</span>
            <select
              className='border-border bg-background rounded-lg border px-2 py-1 text-sm'
              value={fmTeam}
              onChange={(event) => {
                setFmTeam(event.target.value as TeamId);
              }}
            >
              <option value='A'>{teamName.A}</option>
              <option value='B'>{teamName.B}</option>
            </select>
            <button
              className={`${buttonBase} bg-red-600 text-white hover:bg-red-500`}
              disabled={fmSelection.length !== 5}
              type='button'
              onClick={() => {
                const picked = fmSelection
                  .map((id) => questions.find((question) => question.id === id))
                  .filter(Boolean)
                  .map((question) => toQuestionState(question));
                act({ type: 'start-fastmoney', questions: picked, team: fmTeam });
              }}
            >
              💰 Start Fast Money
            </button>
          </div>
        </section>
      )}

      {/* Sound board + game controls */}
      <section className='border-border space-y-3 rounded-2xl border p-4'>
        <h2 className='font-bold'>Sound board</h2>
        <p className='text-foreground/60 text-xs'>
          Sounds play on the TV board (make sure sound is enabled there).
        </p>
        <div className='flex flex-wrap gap-2'>
          {SOUND_REGISTRY.map((sound) => (
            <button
              key={sound.key}
              className={`${buttonBase} border-border border text-xs`}
              type='button'
              onClick={() => {
                act({ type: 'play-sound', key: sound.key });
              }}
            >
              {sound.label}
            </button>
          ))}
        </div>
        <div className='border-border flex flex-wrap gap-2 border-t pt-3'>
          <button
            className={`${buttonBase} bg-blue-700 text-white hover:bg-blue-600`}
            type='button'
            onClick={() => {
              act({ type: 'finish-game' });
            }}
          >
            Finish game 🏆
          </button>
          <button
            className={`${buttonBase} border border-red-500 text-red-500`}
            type='button'
            onClick={() => {
              if (confirm('Reset all scores and start over?')) {
                act({ type: 'reset-game' });
              }
            }}
          >
            Reset game
          </button>
        </div>
      </section>
    </main>
  );
}
