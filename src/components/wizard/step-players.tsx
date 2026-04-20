'use client';

import { Button } from '@heroui/button';
import { Minus, Plus } from 'lucide-react';

type TStepPlayers = {
  readonly value: number;
  readonly onChange: (count: number) => void;
  readonly onNext: () => void;
};

const QUICK_SELECT = [6, 10, 15, 20, 25, 30] as const;

function clamp(count: number): number {
  return Math.min(30, Math.max(6, count));
}

export default function StepPlayers({ value, onChange, onNext }: TStepPlayers) {
  return (
    <div className='flex flex-col gap-8'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>How many players?</h2>
        <p className='text-default-500 mt-1 text-sm'>Including yourself — minimum 6, maximum 30</p>
      </div>

      {/* Counter */}
      <div className='flex items-center justify-center gap-6'>
        <Button
          isIconOnly
          aria-label='Decrease player count'
          className='min-h-[44px] min-w-[44px]'
          isDisabled={value <= 6}
          radius='full'
          size='lg'
          variant='bordered'
          onPress={() => {
            onChange(clamp(value - 1));
          }}
        >
          <Minus className='h-5 w-5' />
        </Button>

        <span className='w-16 text-center text-5xl font-black tabular-nums'>{value}</span>

        <Button
          isIconOnly
          aria-label='Increase player count'
          className='min-h-[44px] min-w-[44px]'
          isDisabled={value >= 30}
          radius='full'
          size='lg'
          variant='bordered'
          onPress={() => {
            onChange(clamp(value + 1));
          }}
        >
          <Plus className='h-5 w-5' />
        </Button>
      </div>

      {/* Quick select */}
      <div className='flex flex-wrap justify-center gap-2'>
        {QUICK_SELECT.map((count) => (
          <button
            key={count}
            aria-label={`Set ${count} players`}
            aria-pressed={value === count}
            className={`min-h-[44px] rounded-full border px-5 text-sm font-semibold transition-colors ${
              value === count
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-default-300 hover:border-default-500 text-default-600'
            }`}
            type='button'
            onClick={() => {
              onChange(count);
            }}
          >
            {count}
          </button>
        ))}
      </div>

      <Button
        className='min-h-[48px] font-semibold'
        color='primary'
        fullWidth
        size='lg'
        onPress={onNext}
      >
        Next →
      </Button>
    </div>
  );
}
