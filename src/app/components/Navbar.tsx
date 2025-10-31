'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoIosLogOut } from 'react-icons/io';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [nextIsAdmin, setNextIsAdmin] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      router.push('/auth/login');
      router.refresh();
    }
  };

  return (
    <header className='w-full bg-white shadow'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 '>
        <div className='flex justify-end h-16'>
          <div className='inline-flex items-center p-1 rounded-full cursor-pointer'>
            <div className='w-px h-7 bg-gray-200 mx-2' />

            <div className='relative flex gap-4 items-center'>
              <Link
                href={nextIsAdmin ? '/admin' : '/user'}
                onClick={() => setNextIsAdmin((v) => !v)}
              >
                <Image
                  src={nextIsAdmin ? '/admin.png' : '/rakamin.png'}
                  alt={nextIsAdmin ? '/user.jpeg' : '/rakamin.png'}
                  width={36}
                  height={36}
                  className='rounded-full w-9 h-9 object-cover border border-gray-300'
                />
              </Link>
              <button
                type='button'
                onClick={handleLogout}
                className='flex items-center border rounded-full p-2 cursor-pointer hover:bg-gray-50 transition'
              >
                <IoIosLogOut className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
