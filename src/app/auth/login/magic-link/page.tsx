import React, { Suspense } from 'react';
import MagicLinkAuthCard from '../../components/MagicLinkAuthCard';

const MagicLinkLoginPage = () => {
  return (
    <div className='min-h-screen flex justify-center items-center bg-white-50'>
      <Suspense fallback={null}>
        <MagicLinkAuthCard mode='login' />
      </Suspense>
    </div>
  );
};

export default MagicLinkLoginPage;
