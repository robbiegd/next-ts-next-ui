'use client';

import { useState } from 'react';

export interface EditableAnswer {
  text: string;
  points: number;
}

export interface EditableQuestion {
  id?: string;
  text: string;
  category: string;
  answers: EditableAnswer[];
}

interface QuestionFormProperties {
  initial: EditableQuestion;
  submitLabel: string;
  onSubmit: (question: EditableQuestion) => Promise<void> | void;
  onCancel?: () => void;
}

export default function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel
}: QuestionFormProperties) {
  const [question, setQuestion] = useState(initial);
  const [saving, setSaving] = useState(false);

  const setAnswer = (index: number, patch: Partial<EditableAnswer>) => {
    setQuestion((previous) => ({
      ...previous,
      answers: previous.answers.map((answer, answerIndex) =>
        answerIndex === index ? { ...answer, ...patch } : answer
      )
    }));
  };

  return (
    <div className='space-y-3'>
      <textarea
        className='border-border bg-background w-full rounded-lg border px-3 py-2 text-sm'
        placeholder='Survey question (e.g. Name something you bring to the beach.)'
        rows={2}
        value={question.text}
        onChange={(event) => {
          setQuestion((previous) => ({ ...previous, text: event.target.value }));
        }}
      />
      <input
        className='border-border bg-background w-full rounded-lg border px-3 py-2 text-sm'
        placeholder='Category (general, summer, fast-money…)'
        value={question.category}
        onChange={(event) => {
          setQuestion((previous) => ({ ...previous, category: event.target.value }));
        }}
      />
      <div className='space-y-2'>
        {question.answers.map((answer, index) => (
          <div key={index} className='flex items-center gap-2'>
            <span className='text-foreground/50 w-5 text-right text-sm'>{index + 1}.</span>
            <input
              className='border-border bg-background flex-1 rounded-lg border px-3 py-1.5 text-sm'
              placeholder='Answer'
              value={answer.text}
              onChange={(event) => {
                setAnswer(index, { text: event.target.value });
              }}
            />
            <input
              className='border-border bg-background w-20 rounded-lg border px-2 py-1.5 text-right font-mono text-sm'
              max={100}
              min={0}
              type='number'
              value={answer.points}
              onChange={(event) => {
                setAnswer(index, { points: Number(event.target.value) });
              }}
            />
            <button
              className='text-red-500'
              type='button'
              onClick={() => {
                setQuestion((previous) => ({
                  ...previous,
                  answers: previous.answers.filter((_, answerIndex) => answerIndex !== index)
                }));
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className='border-border rounded-lg border px-3 py-1 text-xs font-bold'
          disabled={question.answers.length >= 8}
          type='button'
          onClick={() => {
            setQuestion((previous) => ({
              ...previous,
              answers: [...previous.answers, { text: '', points: 0 }]
            }));
          }}
        >
          + Add answer
        </button>
      </div>
      <div className='flex gap-2'>
        <button
          className='rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50'
          disabled={
            saving ||
            question.text.trim().length === 0 ||
            question.answers.every((answer) => answer.text.trim().length === 0)
          }
          type='button'
          onClick={() => {
            setSaving(true);
            void Promise.resolve(onSubmit(question)).finally(() => {
              setSaving(false);
            });
          }}
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            className='border-border rounded-lg border px-4 py-2 text-sm font-bold'
            type='button'
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
