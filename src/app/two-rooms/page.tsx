'use client';

import { useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import ResultCard from '@/components/wizard/result-card';
import StepComplexity from '@/components/wizard/step-complexity';
import StepExperience from '@/components/wizard/step-experience';
import StepExtras from '@/components/wizard/step-extras';
import StepPlayers from '@/components/wizard/step-players';
import { type WizardState } from '@/lib/types/wizard';
import { suggest } from '@/lib/utils/suggest';

const INITIAL_STATE: WizardState = {
  step: 0,
  direction: 'forward',
  playerCount: 10,
  experience: null,
  complexity: null,
  includeGrey: true,
  includeBackup: false
};

const STEP_LABELS = ['Players', 'Experience', 'Complexity', 'Extras', 'Result'] as const;

const slideVariants = {
  enter: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? '100%' : '-100%',
    opacity: 0
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? '-100%' : '100%',
    opacity: 0
  })
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function Page() {
  const [state, setState] = useState(INITIAL_STATE);

  const result = useMemo(() => {
    if (state.step !== 4 || state.experience === null || state.complexity === null) {
      return null;
    }
    return suggest({
      playerCount: state.playerCount,
      experience: state.experience,
      complexity: state.complexity,
      includeGrey: state.includeGrey,
      includeBackup: state.includeBackup
    });
  }, [
    state.step,
    state.playerCount,
    state.experience,
    state.complexity,
    state.includeGrey,
    state.includeBackup
  ]);

  function goForward() {
    setState((previous) => ({
      ...previous,
      step: Math.min(previous.step + 1, 4) as WizardState['step'],
      direction: 'forward'
    }));
  }

  function goBack() {
    setState((previous) => ({
      ...previous,
      step: Math.max(previous.step - 1, 0) as WizardState['step'],
      direction: 'back'
    }));
  }

  function reset() {
    setState({ ...INITIAL_STATE, direction: 'back' });
  }

  return (
    <main className='flex h-full w-full flex-col items-center justify-start overflow-y-auto px-4 py-8'>
      <div className='w-full max-w-lg'>
        {/* Progress dots */}
        {state.step < 4 && (
          <div className='mb-8 flex justify-center gap-2'>
            {STEP_LABELS.slice(0, 4).map((label, index) => (
              <div
                key={label}
                aria-label={label}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= state.step ? 'bg-primary w-6' : 'bg-default-200 w-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step container */}
        {state.step < 4 ? (
          <div className='overflow-hidden'>
            <AnimatePresence custom={state.direction} mode='wait'>
              <motion.div
                key={state.step}
                animate='center'
                custom={state.direction}
                exit='exit'
                initial='enter'
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                variants={slideVariants}
              >
                {state.step === 0 && (
                  <StepPlayers
                    value={state.playerCount}
                    onChange={(playerCount) => {
                      setState((previous) => ({ ...previous, playerCount }));
                    }}
                    onNext={goForward}
                  />
                )}
                {state.step === 1 && (
                  <StepExperience
                    value={state.experience}
                    onChange={(experience) => {
                      setState((previous) => ({ ...previous, experience }));
                    }}
                    onBack={goBack}
                    onNext={goForward}
                  />
                )}
                {state.step === 2 && (
                  <StepComplexity
                    value={state.complexity}
                    onChange={(complexity) => {
                      setState((previous) => ({ ...previous, complexity }));
                    }}
                    onBack={goBack}
                    onNext={goForward}
                  />
                )}
                {state.step === 3 && (
                  <StepExtras
                    includeBackup={state.includeBackup}
                    includeGrey={state.includeGrey}
                    onBack={goBack}
                    onNext={goForward}
                    onToggleBackup={() => {
                      setState((previous) => ({
                        ...previous,
                        includeBackup: !previous.includeBackup
                      }));
                    }}
                    onToggleGrey={() => {
                      setState((previous) => ({
                        ...previous,
                        includeGrey: !previous.includeGrey
                      }));
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          result !== null && (
            <motion.div
              animate='visible'
              initial='hidden'
              transition={{ duration: 0.3, ease: 'easeOut' }}
              variants={fadeUpVariants}
            >
              <ResultCard playerCount={state.playerCount} result={result} onReset={reset} />
            </motion.div>
          )
        )}
      </div>
    </main>
  );
}
