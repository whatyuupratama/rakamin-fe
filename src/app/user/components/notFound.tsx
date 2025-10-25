import React from 'react';
import Image from 'next/image';

const NotFound: React.FC = () => {
  return (
    <section className='flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-600'>
      <Image
        src='/notfound.png'
        alt='No job openings illustration'
        width={250}
        height={250}
        className='object-contain'
        priority
      />
      <span className='text-lg font-semibold text-gray-700'>
        No job openings available
      </span>
      <span>Please wait for the next batch of openings.</span>
    </section>
  );
};

export default NotFound;
