import React, { Suspense } from 'react';
import RegisForm from './RegisForm';
const Page = () => {
  return (
    <div className='min-h-screen flex justify-center items-center bg-white-50'>
      <Suspense fallback={null}>
        <RegisForm />
      </Suspense>
    </div>
  );
};

export default Page;
