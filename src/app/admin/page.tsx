'use client';

import { useState } from 'react';

import QuestionsTab from '@/components/admin/questions-tab';
import ScanTab from '@/components/admin/scan-tab';
import SoundsTab from '@/components/admin/sounds-tab';

const TABS = [
  { id: 'questions', label: '❓ Questions' },
  { id: 'scan', label: '📷 Scan cards' },
  { id: 'sounds', label: '🔊 Sounds' }
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('questions');

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-8'>
      <h1 className='text-2xl font-black'>Admin panel</h1>
      <p className='text-foreground/60 mt-1 text-sm'>
        Build your question bank, scan physical Feud cards, and customize the game sounds.
      </p>

      <div className='border-border mt-6 mb-6 flex gap-1 border-b'>
        {TABS.map((entry) => (
          <button
            key={entry.id}
            className={`rounded-t-lg px-4 py-2 text-sm font-bold transition ${
              tab === entry.id
                ? 'border-border bg-background border border-b-transparent'
                : 'text-foreground/60 hover:text-foreground'
            }`}
            type='button'
            onClick={() => {
              setTab(entry.id);
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && <QuestionsTab />}
      {tab === 'scan' && <ScanTab />}
      {tab === 'sounds' && <SoundsTab />}
    </main>
  );
}
