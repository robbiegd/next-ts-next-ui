'use client';

import { useCallback, useEffect, useState } from 'react';

import type { EditableQuestion } from './question-form';

import QuestionForm from './question-form';

interface BankQuestion {
  id: string;
  text: string;
  category: string;
  source: string;
  answers: { id: string; text: string; points: number; rank: number }[];
}

const EMPTY: EditableQuestion = {
  text: '',
  category: 'general',
  answers: [
    { text: '', points: 0 },
    { text: '', points: 0 },
    { text: '', points: 0 },
    { text: '', points: 0 }
  ]
};

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const reload = useCallback(async () => {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { questions: BankQuestion[] };
    setQuestions(data.questions);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function create(question: EditableQuestion) {
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    setShowCreate(false);
    await reload();
  }

  async function update(id: string, question: EditableQuestion) {
    await fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    setEditingId(null);
    await reload();
  }

  async function remove(id: string) {
    if (!confirm('Delete this question?')) {
      return;
    }
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    await reload();
  }

  return (
    <div className='space-y-4'>
      {showCreate ? (
        <div className='border-border rounded-2xl border p-4'>
          <h3 className='mb-3 font-bold'>New question</h3>
          <QuestionForm
            initial={EMPTY}
            submitLabel='Create question'
            onCancel={() => {
              setShowCreate(false);
            }}
            onSubmit={create}
          />
        </div>
      ) : (
        <button
          className='rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400'
          type='button'
          onClick={() => {
            setShowCreate(true);
          }}
        >
          + Write a question
        </button>
      )}

      <div className='space-y-3'>
        {questions.map((question) =>
          editingId === question.id ? (
            <div key={question.id} className='border-border rounded-2xl border p-4'>
              <QuestionForm
                initial={{
                  id: question.id,
                  text: question.text,
                  category: question.category,
                  answers: question.answers.map((answer) => ({
                    text: answer.text,
                    points: answer.points
                  }))
                }}
                submitLabel='Save changes'
                onCancel={() => {
                  setEditingId(null);
                }}
                onSubmit={(edited) => update(question.id, edited)}
              />
            </div>
          ) : (
            <div
              key={question.id}
              className='border-border flex items-start justify-between gap-3 rounded-2xl border p-4'
            >
              <div className='min-w-0'>
                <p className='font-semibold'>{question.text}</p>
                <p className='text-foreground/50 text-xs'>
                  {question.category} · {question.source}
                </p>
                <ul className='text-foreground/70 mt-2 space-y-0.5 text-sm'>
                  {question.answers.map((answer) => (
                    <li key={answer.id}>
                      {answer.rank}. {answer.text}{' '}
                      <span className='font-mono text-amber-600'>{answer.points}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='flex shrink-0 gap-2 text-sm'>
                <button
                  className='underline'
                  type='button'
                  onClick={() => {
                    setEditingId(question.id);
                  }}
                >
                  Edit
                </button>
                <button
                  className='text-red-500 underline'
                  type='button'
                  onClick={() => void remove(question.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
        {questions.length === 0 && (
          <p className='text-foreground/50 text-sm'>
            No questions yet. Write one above, or scan a card photo.
          </p>
        )}
      </div>
    </div>
  );
}
