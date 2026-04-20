'use client';

import { type Experience } from '@/lib/types/wizard';

type TStepExperience = {
  readonly value: Experience | null;
  readonly onChange: (value: Experience) => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
};

const OPTIONS: { value: Experience; label: string; emoji: string; description: string }[] = [
  {
    value: 'first-time',
    label: 'First Time',
    emoji: '👋',
    description: "We've never played — keep it simple!"
  },
  {
    value: 'some-experience',
    label: "We've Played Before",
    emoji: '🎲',
    description: 'We know the basics and want a bit more variety'
  },
  {
    value: 'know-it',
    label: 'We Know This Game',
    emoji: '🔥',
    description: 'Bring on the tricky roles and special powers'
  }
];

export default function StepExperience({ value, onChange, onNext, onBack }: TStepExperience) {
  function handleSelect(option: Experience) {
    onChange(option);
    setTimeout(onNext, 120);
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>How familiar is your group?</h2>
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
