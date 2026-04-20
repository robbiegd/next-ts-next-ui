'use client';

import { Button } from '@heroui/button';

type TStepExtras = {
  readonly includeGrey: boolean;
  readonly includeBackup: boolean;
  readonly onToggleGrey: () => void;
  readonly onToggleBackup: () => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
};

type TToggleRow = {
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onToggle: () => void;
};

function ToggleRow({ label, description, checked, onToggle }: TToggleRow) {
  return (
    <button
      aria-checked={checked}
      className='border-default-200 hover:border-default-400 flex min-h-[64px] w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition-colors'
      role='switch'
      type='button'
      onClick={onToggle}
    >
      <div className='flex flex-col gap-0.5'>
        <span className='font-semibold'>{label}</span>
        <span className='text-default-500 text-xs'>{description}</span>
      </div>

      {/* Pill toggle */}
      <div
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-default-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function StepExtras({
  includeGrey,
  includeBackup,
  onToggleGrey,
  onToggleBackup,
  onNext,
  onBack
}: TStepExtras) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>Any extras?</h2>
        <p className='text-default-500 mt-1 text-sm'>Optional additions to spice things up</p>
      </div>

      <div className='flex flex-col gap-3'>
        <ToggleRow
          checked={includeGrey}
          description='Neutral characters with individual win conditions — not Blue or Red'
          label='Include grey (neutral) characters'
          onToggle={onToggleGrey}
        />
        <ToggleRow
          checked={includeBackup}
          description="Backup roles like the President's Daughter or the Witness"
          label='Include backup / redundant roles'
          onToggle={onToggleBackup}
        />
      </div>

      <Button
        className='min-h-[48px] font-semibold'
        color='primary'
        fullWidth
        size='lg'
        onPress={onNext}
      >
        Generate Setup →
      </Button>

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
