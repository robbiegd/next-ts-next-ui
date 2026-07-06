'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SoundEntry {
  key: string;
  label: string;
  description: string;
  loop?: boolean;
  custom: boolean;
  fileName: string | null;
  url: string;
}

export default function SoundsTab() {
  const [sounds, setSounds] = useState<SoundEntry[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const audioReference = useRef<HTMLAudioElement | null>(null);

  const reload = useCallback(async () => {
    const response = await fetch('/api/sounds');
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { sounds: SoundEntry[] };
    setSounds(data.sounds);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  function preview(url: string) {
    audioReference.current?.pause();
    audioReference.current = new Audio(url);
    void audioReference.current.play().catch(() => undefined);
  }

  async function upload(key: string, file: File) {
    setBusyKey(key);
    const formData = new FormData();
    formData.append('audio', file);
    await fetch(`/api/sounds/${key}`, { method: 'POST', body: formData });
    setBusyKey(null);
    await reload();
  }

  async function revert(key: string) {
    setBusyKey(key);
    await fetch(`/api/sounds/${key}`, { method: 'DELETE' });
    setBusyKey(null);
    await reload();
  }

  return (
    <div className='space-y-3'>
      <p className='text-foreground/60 text-sm'>
        Every game event has a bundled placeholder sound. Upload your own audio (MP3/WAV/OGG, up to
        4&nbsp;MB) to replace any of them — perfect for the real Feud sounds if you have them.
      </p>
      {sounds.map((sound) => (
        <div
          key={sound.key}
          className='border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4'
        >
          <div className='min-w-0'>
            <p className='font-bold'>
              {sound.label}{' '}
              {sound.custom && (
                <span className='rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-600'>
                  custom: {sound.fileName}
                </span>
              )}
            </p>
            <p className='text-foreground/60 text-xs'>{sound.description}</p>
          </div>
          <div className='flex shrink-0 items-center gap-2 text-sm'>
            <button
              className='border-border rounded-lg border px-3 py-1.5 font-bold'
              type='button'
              onClick={() => {
                preview(sound.url);
              }}
            >
              ▶ Play
            </button>
            <label className='cursor-pointer rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-black hover:bg-amber-400'>
              {busyKey === sound.key ? '…' : 'Upload'}
              <input
                accept='audio/*'
                className='hidden'
                type='file'
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void upload(sound.key, file);
                  }
                  event.target.value = '';
                }}
              />
            </label>
            {sound.custom && (
              <button
                className='text-red-500 underline'
                type='button'
                onClick={() => void revert(sound.key)}
              >
                Revert
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
