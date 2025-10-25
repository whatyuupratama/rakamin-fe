import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
const Page = () => {
  return (
    <div className='max-w-5xl my-16 mx-auto px-6 py-10 border'>
      <div className='flex flex-col'>
        <div className='flex justify-between'>
          <Link href={'/user'} className='cursor-pointer'>
            Apply Front End at Rakamin
          </Link>
          <span>ℹ️ This field required to fill</span>
        </div>
        <div>
          <span>Photo Profile</span>
          <Image
            src='/admin.png'
            alt='Profile photo'
            width={72}
            height={72}
            className='rounded-full border border-gray-200 object-cover'
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
