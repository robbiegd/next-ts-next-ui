'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className='text-foreground/60 hover:text-foreground text-sm underline'
      type='button'
      onClick={() => {
        void fetch('/api/auth/login', { method: 'DELETE' }).then(() => {
          router.push('/');
          router.refresh();
        });
      }}
    >
      Sign out
    </button>
  );
}
