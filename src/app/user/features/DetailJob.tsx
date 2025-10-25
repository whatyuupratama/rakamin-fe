'use client';
import React from 'react';
import Image from 'next/image';
import type { typeCardJob } from '../type';
import Link from 'next/link';
interface JobSummaryProps {
  job: typeCardJob;
}
export default function DetailJob({ job }: JobSummaryProps) {
  return (
    <div className='w-full h-full min-h-0 border border-gray-300 rounded-xl'>
      <div className='p-6 flex flex-col gap-4 h-full'>
        <header className='flex items-start justify-between gap-5'>
          <div className='flex items-start gap-5'>
            {' '}
            <Image
              src={job.logo ?? '/rakamin.png'}
              alt={`${job.company} logo`}
              width={50}
              height={50}
              className='w-14 h-14 object-cover rounded-lg border border-gray-200'
            />
            <div className='flex flex-col gap-1'>
              <span className='bg-[#43936C] px-2 py-1 text-white inline-flex w-fit rounded-sm'>
                {job.type}
              </span>
              <span className='text-lg'>{job.location}</span>
              <span className='text-gray-500'>{job.company}</span>
            </div>
          </div>

          <Link
            href='/resume'
            className='bg-[#FBC037] text-gray-600 px-4 py-2 font-bold rounded-xl cursor-pointer'
          >
            Apply
          </Link>
        </header>

        <div className='border-t border-gray-200 pt-4' />
        <p className='text-gray-600 whitespace-pre-line'>{job.description}</p>
      </div>
    </div>
  );
}
