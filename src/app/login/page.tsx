'use client';

import { Suspense, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        setError('Invalid username or password');
        setSubmitting(false);
        return;
      }
      const next = searchParams.get('next');
      router.push(next?.startsWith('/') ? next : '/admin');
      router.refresh();
    } catch {
      setError('Login failed — try again');
      setSubmitting(false);
    }
  }

  return (
    <form
      className='border-border w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-sm'
      onSubmit={(event) => {
        event.preventDefault();
        void login();
      }}
    >
      <div>
        <h1 className='text-xl font-black'>Host login</h1>
        <p className='text-foreground/60 mt-1 text-sm'>
          Sign in to manage questions, card scans, and sounds.
        </p>
      </div>
      <input
        autoFocus
        autoComplete='username'
        className='border-border bg-background w-full rounded-lg border px-3 py-2 text-sm'
        placeholder='Username'
        value={username}
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />
      <input
        autoComplete='current-password'
        className='border-border bg-background w-full rounded-lg border px-3 py-2 text-sm'
        placeholder='Password'
        type='password'
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <button
        className='w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50'
        disabled={submitting || username.length === 0 || password.length === 0}
        type='submit'
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className='flex w-full flex-col items-center px-4 py-16'>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
