// ...existing code...
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function SubmitSuccess({ onClose }: { onClose?: () => void }) {
  return (
    <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
      <div className='w-full max-w-3xl mx-4 text-center py-24'>
        <div className='mx-auto mb-6 w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden flex items-center justify-center'>
          <Image
            src='/verf.png'
            alt='success'
            width={224}
            height={224}
            priority
            className='object-contain w-full h-full'
          />
        </div>
        <h2 className='text-2xl font-semibold mb-2'>
          🎉 Your application was sent!
        </h2>
        <p className='text-sm text-muted-foreground mb-6 w-5/6 mx-auto'>
          Congratulations! You&apos;ve taken the first step towards a rewarding
          career at Rakamin. We look forward to learning more about you during
          the application process.
        </p>
        <div className='flex justify-center gap-3'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
