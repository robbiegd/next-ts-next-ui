'use client';

import { type Complexity } from '@/lib/types/wizard';

type TStepComplexity = {
  readonly value: Complexity | null;
  readonly onChange: (value: Complexity) => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
};

const OPTIONS: { value: Complexity; label: string; emoji: string; description: string }[] = [
  {
    value: 'simple',
    label: 'Keep It Simple',
    emoji: '😌',
    description: 'Straightforward roles, easy to understand'
  },
  {
    value: 'mix',
    label: 'Mix It Up',
    emoji: '😏',
    description: 'A balanced blend of simple and tricky roles'
  },
  {
    value: 'chaos',
    label: 'Full Chaos',
    emoji: '🤯',
    description: 'Wild powers, conditions, and mayhem'
  }
];

export default function StepComplexity({ value, onChange, onNext, onBack }: TStepComplexity) {
  function handleSelect(option: Complexity) {
    onChange(option);
    setTimeout(onNext, 120);
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>How complex do you want it?</h2>
        <p className='text-default-500 mt-1 text-sm'>Tap to select and continue</p>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            aria-pressed={value === option.value}
            className={`flex min-h-[80px] flex-1 flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
              value === option.value
                ? 'border-primary bg-primary/10'
                : 'border-default-200 hover:border-default-400'
            }`}
            type='button'
            onClick={() => {
              handleSelect(option.value);
            }}
          >
            <span className='text-2xl'>{option.emoji}</span>
            <span className='font-bold'>{option.label}</span>
            <span className='text-default-500 text-xs'>{option.description}</span>
          </button>
        ))}
      </div>

      <button
        className='text-default-400 hover:text-default-600 min-h-[44px] text-sm transition-colors'
        type='button'
        onClick={onBack}
      >
        ← Back
      </button>
    </div>
  );
}
