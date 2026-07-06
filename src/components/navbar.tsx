'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeToggle from './theme-toggle';

const CHROME_FREE_PREFIXES = ['/board/', '/buzzer'];

export default function Navbar() {
  const pathname = usePathname();

  // The TV board and phone buzzer are full-screen game surfaces
  if (CHROME_FREE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <header className='border-border flex h-16 w-full items-center justify-between border-b px-5'>
      <Link className='text-lg font-black tracking-tight' href='/'>
        Family <span className='text-amber-500'>Feud</span>
      </Link>

      <nav className='flex items-center gap-4 text-sm'>
        <Link className='opacity-80 hover:opacity-100' href='/admin'>
          Admin
        </Link>
        <Link className='opacity-80 hover:opacity-100' href='/two-rooms'>
          Two Rooms
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
