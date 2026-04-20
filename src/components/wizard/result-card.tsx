'use client';

import { Button } from '@heroui/button';

import { type Character, type SuggestResult } from '@/lib/types/wizard';

type TResultCard = {
  readonly result: SuggestResult;
  readonly playerCount: number;
  readonly onReset: () => void;
};

const TEAM_STYLES = {
  blue: {
    section: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40',
    dot: 'bg-blue-500',
    label: 'text-blue-700 dark:text-blue-300',
    heading: 'Blue Team'
  },
  red: {
    section: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40',
    dot: 'bg-red-500',
    label: 'text-red-700 dark:text-red-300',
    heading: 'Red Team'
  },
  grey: {
    section: 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40',
    dot: 'bg-zinc-400',
    label: 'text-zinc-600 dark:text-zinc-400',
    heading: 'Neutral (Grey)'
  }
} as const;

function CharacterRow({ character }: { readonly character: Character }) {
  const styles = TEAM_STYLES[character.team];
  return (
    <div className='flex gap-3 py-2'>
      <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${styles.dot}`} />
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='font-semibold'>{character.name}</span>
          {character.isPrimary && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${styles.label} bg-current/10`}
            >
              PRIMARY
            </span>
          )}
        </div>
        <p className='text-default-500 mt-0.5 text-xs leading-snug'>{character.ability}</p>
      </div>
    </div>
  );
}

function TeamSection({
  characters,
  team
}: {
  readonly characters: Character[];
  readonly team: 'blue' | 'red' | 'grey';
}) {
  if (characters.length === 0) {
    return null;
  }
  const styles = TEAM_STYLES[team];
  const primaries = characters.filter((character) => character.isPrimary);
  const rest = characters.filter((character) => !character.isPrimary);

  return (
    <div className={`rounded-2xl border-2 p-4 ${styles.section}`}>
      <h3 className={`mb-2 text-xs font-bold tracking-wider uppercase ${styles.label}`}>
        {styles.heading} · {characters.length} card{characters.length === 1 ? '' : 's'}
      </h3>
      <div className='divide-default-100 divide-y'>
        {[...primaries, ...rest].map((character) => (
          <CharacterRow key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}

export default function ResultCard({ result, playerCount, onReset }: TResultCard) {
  const {
    characters,
    totalCards,
    buriedCount,
    hostagesPerRound,
    colorSharingAllowed,
    roundTimingSuggestion
  } = result;

  const blueChars = characters.filter((character) => character.team === 'blue');
  const redChars = characters.filter((character) => character.team === 'red');
  const greyChars = characters.filter((character) => character.team === 'grey');

  return (
    <div className='flex flex-col gap-5'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>Setup for {playerCount} players</h2>
        <p className='text-default-500 mt-1 text-sm'>
          {totalCards} cards total · {buriedCount} buried face-down
        </p>
      </div>

      {/* Info chips */}
      <div className='flex flex-wrap justify-center gap-2 text-xs'>
        <span className='border-default-200 bg-default-100 rounded-full border px-3 py-1 font-medium'>
          ⏱ {roundTimingSuggestion}
        </span>
        <span className='border-default-200 bg-default-100 rounded-full border px-3 py-1 font-medium'>
          🤝 Hostages: {hostagesPerRound[0]}·{hostagesPerRound[1]}·{hostagesPerRound[2]} per round
        </span>
        <span
          className={`rounded-full border px-3 py-1 font-medium ${
            colorSharingAllowed
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400'
              : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400'
          }`}
        >
          {colorSharingAllowed ? '✓ Color sharing OK' : '✗ No color sharing'}
        </span>
      </div>

      {/* Team sections */}
      <div className='flex flex-col gap-3 sm:grid sm:grid-cols-2'>
        <TeamSection characters={blueChars} team='blue' />
        <TeamSection characters={redChars} team='red' />
      </div>
      {greyChars.length > 0 && <TeamSection characters={greyChars} team='grey' />}

      {/* How to play reminder */}
      <div className='border-default-200 bg-default-50 dark:bg-default-100/5 rounded-2xl border p-4'>
        <h3 className='text-default-500 mb-2 text-xs font-bold tracking-wider uppercase'>
          Quick Reminder
        </h3>
        <ul className='text-default-600 space-y-1 text-xs leading-relaxed'>
          <li>• Deal one card to each player, bury one face-down</li>
          <li>• Split into two rooms; leaders exchange hostages each round</li>
          <li>• After the last exchange, everyone reveals their card</li>
          <li>• Blue wins if President and Bomber end in different rooms</li>
        </ul>
      </div>

      <Button
        className='min-h-[48px] font-semibold'
        fullWidth
        size='lg'
        variant='bordered'
        onPress={onReset}
      >
        ← Start Over
      </Button>
    </div>
  );
}
