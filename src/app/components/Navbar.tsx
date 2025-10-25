import React from 'react';
import Image from 'next/image';

const Navbar: React.FC = () => {
  return (
    <header className='w-full bg-white shadow'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 '>
        <div className='flex justify-end h-16'>
          <div className='inline-flex items-center p-1 rounded-full cursor-pointer'>
            <div className='w-px h-7 bg-gray-200 mx-2' />
            <Image
              src='/admin.png'
              alt='admin'
              width={36}
              height={36}
              className='rounded-full w-9 h-9 object-cover border border-gray-300'
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
