'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar: React.FC = () => {
  // Minimal: a boolean to alternate profiles. Use Link for navigation.
  const [nextIsAdmin, setNextIsAdmin] = useState(true);
  return (
    <header className='w-full bg-white shadow'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 '>
        <div className='flex justify-end h-16'>
          <div className='inline-flex items-center p-1 rounded-full cursor-pointer'>
            <div className='w-px h-7 bg-gray-200 mx-2' />

            <div className='relative'>
              <Link
                href={nextIsAdmin ? '/admin' : '/user'}
                onClick={() => setNextIsAdmin((v) => !v)}
              >
                <Image
                  // show which profile will be navigated to next (simple visual cue)
                  src={nextIsAdmin ? '/admin.png' : '/rakamin.png'}
                  alt={nextIsAdmin ? '/user.jpeg' : '/rakamin.png'}
                  width={36}
                  height={36}
                  className='rounded-full w-9 h-9 object-cover border border-gray-300'
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
