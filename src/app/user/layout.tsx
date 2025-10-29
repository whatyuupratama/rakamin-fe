import React from 'react';
import { redirect } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { cookies } from 'next/headers';

interface LayoutProps {
  children: React.ReactNode;
}

const UserLayout = async ({ children }: LayoutProps) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? '';
  const { valid, payload } = verifySessionToken(token);

  if (!valid || !payload) {
    const redirectTarget = encodeURIComponent('/user');
    redirect(`/auth/login?redirect=${redirectTarget}`);
  }

  return (
    <div className='min-h-screen bg-white'>
      <Navbar userEmail={payload.email} />
      <main className='max-w-7xl mx-auto px-4 sm:px-6'>{children}</main>
    </div>
  );
};

export default UserLayout;
