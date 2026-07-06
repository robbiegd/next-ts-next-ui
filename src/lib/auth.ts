import { createHash, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const AUTH_COOKIE = 'feud-auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getCredentials() {
  return {
    username: process.env['AUTH_USERNAME'] ?? 'admin',
    password: process.env['AUTH_PASSWORD'] ?? 'hunter2'
  };
}

/** Session token derived from the configured credentials — changing the
 * username or password invalidates every existing session. */
export function authToken(): string {
  const { username, password } = getCredentials();
  return createHash('sha256').update(`${username}:${password}:feud-auth-v1`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function checkCredentials(username: string, password: string): boolean {
  const expected = getCredentials();
  const usernameOk = safeEqual(username, expected.username);
  const passwordOk = safeEqual(password, expected.password);
  return usernameOk && passwordOk;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return typeof token === 'string' && safeEqual(token, authToken());
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, authToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    path: '/'
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

/** For route handlers: returns a 401 response when not signed in, else null. */
export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthenticated()) {
    return null;
  }
  return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
}
