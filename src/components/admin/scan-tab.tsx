'use client';

import { useState } from 'react';

import type { EditableQuestion } from './question-form';

import QuestionForm from './question-form';

interface ScannedQuestion {
  text: string;
  answers: { text: string; points: number }[];
}

export default function ScanTab() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<EditableQuestion[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  async function scan(file: File) {
    setScanning(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/scan', { method: 'POST', body: formData });
      const data = (await response.json()) as {
        questions?: ScannedQuestion[];
        error?: string;
      };
      if (!response.ok || !data.questions) {
        setError(data.error ?? 'Scan failed');
        return;
      }
      setDrafts(
        data.questions.map((question) => ({
          text: question.text,
          category: question.answers.length <= 4 ? 'fast-money' : 'general',
          answers: question.answers.map((answer) => ({
            text: answer.text,
            points: Math.round(answer.points)
          }))
        }))
      );
    } catch {
      setError('Scan failed — check your connection and try again.');
    } finally {
      setScanning(false);
    }
  }

  async function saveDraft(index: number, question: EditableQuestion) {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...question, source: 'card-scan' })
    });
    if (response.ok) {
      setDrafts((previous) => previous.filter((_, draftIndex) => draftIndex !== index));
      setSavedCount((previous) => previous + 1);
    }
  }

  return (
    <div className='space-y-4'>
      <div className='border-border rounded-2xl border border-dashed p-6 text-center'>
        <p className='font-bold'>Scan a Family Feud card</p>
        <p className='text-foreground/60 mx-auto mt-1 max-w-md text-sm'>
          Take a photo of a Face Off or Fast Money card and Claude will read the questions, answers,
          and point values. You can edit everything before saving to the question bank.
        </p>
        <label className='mt-4 inline-block cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400'>
          {scanning ? 'Reading card…' : '📷 Choose photo'}
          <input
            accept='image/*'
            capture='environment'
            className='hidden'
            disabled={scanning}
            type='file'
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void scan(file);
              }
              event.target.value = '';
            }}
          />
        </label>
        {error && <p className='mt-3 text-sm text-red-500'>{error}</p>}
        {savedCount > 0 && (
          <p className='mt-3 text-sm text-green-600'>
            Saved {savedCount} question{savedCount === 1 ? '' : 's'} to the bank ✓
          </p>
        )}
      </div>

      {drafts.map((draft, index) => (
        <div key={index} className='border-border rounded-2xl border p-4'>
          <h3 className='mb-3 font-bold'>Scanned question {index + 1}</h3>
          <QuestionForm
            initial={draft}
            submitLabel='Save to question bank'
            onCancel={() => {
              setDrafts((previous) => previous.filter((_, draftIndex) => draftIndex !== index));
            }}
            onSubmit={(question) => saveDraft(index, question)}
          />
        </div>
      ))}
    </div>
  );
}
