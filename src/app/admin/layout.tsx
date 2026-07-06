import { type PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import LogoutButton from '@/components/admin/logout-button';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: Readonly<PropsWithChildren>) {
  if (!(await isAuthenticated())) {
    redirect('/login?next=/admin');
  }

  return (
    <div className='relative'>
      <div className='absolute top-8 right-4 sm:right-8'>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
