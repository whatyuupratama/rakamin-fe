'use client';
import React, { useCallback } from 'react';
import Image from 'next/image';
import type { typeCardJob } from '../type';
import Link from 'next/link';
import { PiMoneyWavy } from 'react-icons/pi';
import { TiLocationOutline } from 'react-icons/ti';

const DEFAULT_LOGO = '/rakamin.png';

const formatSalary = (job: typeCardJob) => {
  const { formatted, range } = job.salary;
  if (formatted.min || formatted.max) {
    if (formatted.min && formatted.max) {
      return `${formatted.min} - ${formatted.max}`;
    }
    return formatted.min || formatted.max;
  }

  if (range.min || range.max) {
    const formatter = new Intl.NumberFormat('id-ID');
    const min =
      typeof range.min === 'number' ? `Rp ${formatter.format(range.min)}` : '';
    const max =
      typeof range.max === 'number' ? `Rp ${formatter.format(range.max)}` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  }

  return 'Salary undisclosed';
};

interface JobSummaryProps {
  job: typeCardJob;
}

export default function DetailJob({ job }: JobSummaryProps) {
  const handleApply = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        id: job.id ?? null,
        title: job.job.name ?? 'Unknown role',
        company: job.job.meta?.company ?? '',
      };
      window.localStorage.setItem('active_job', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('active-job:updated'));
    } catch {
      // ignore localStorage errors
    }
  }, [job]);

  return (
    <div className='w-full h-full min-h-0 border border-gray-300 rounded-xl overflow-y-auto'>
      <div className='p-6 flex flex-col gap-4 h-full'>
        <header className='flex items-start justify-between gap-5'>
          <div className='flex items-start gap-5'>
            {' '}
            <Image
              src={DEFAULT_LOGO}
              alt={`${job.job.meta?.company ?? 'company'} logo`}
              width={50}
              height={50}
              className='w-14 h-14 object-cover rounded-lg border border-gray-200'
            />
            <div className='flex flex-col gap-1'>
              <span className='bg-[#43936C] px-2 py-1 text-white inline-flex w-fit rounded-sm capitalize'>
                {job.job.type || 'Unspecified'}
              </span>
              <span className='text-lg'>
                {job.job.meta?.location ?? 'Jakarta '}
              </span>
              <span className='text-gray-500 capitalize'>
                {job.job.meta?.company ?? 'Internal posting'}
              </span>
            </div>
          </div>

          <Link
            href='/resume'
            onClick={handleApply}
            className='bg-[#FBC037] text-gray-600 px-4 py-2 font-bold rounded-xl cursor-pointer'
          >
            Apply
          </Link>
        </header>

        <div className='border-t border-gray-200 pt-4' />
        <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
          <div className='flex items-center gap-2'>
            <PiMoneyWavy className='text-base' />
            {formatSalary(job)}
          </div>
          <div className='flex items-center gap-2'>
            <TiLocationOutline className='text-base' />
            {job.job.meta?.location ?? 'Jakarta, Indonesia'}
          </div>
        </div>

        <div className='border-t border-gray-200 pt-4' />
        <p className='text-gray-600 whitespace-pre-line'>
          {job.job.description}
        </p>
      </div>
    </div>
  );
}
