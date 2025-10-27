'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CreateJobModal from '@/components/CreateJobModal';

export default function Page() {
  const router = useRouter();

  return (
    <div>
      <CreateJobModal isOpen={true} onClose={() => router.push('/admin')} />
    </div>
  );
}
