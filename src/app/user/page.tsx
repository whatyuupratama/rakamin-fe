'use client';

import React, { useMemo, useState } from 'react';
import { TiLocationOutline } from 'react-icons/ti';
import { PiMoneyWavy } from 'react-icons/pi';
import Image from 'next/image';

import DetailJob from './features/DetailJob';
import NotFound from '@/app/user/components/notFound';
import type { typeCardJob } from './type';
import type { JobEntry } from '@/lib/jobStorage';
import { useAppSelector } from '@/lib/store/hooks';

const DEFAULT_LOGO = '/rakamin.png';

const formatSalary = (job: JobEntry) => {
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

const Page: React.FC = () => {
  const jobs = useAppSelector((state) => state.jobs.items);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const formattedJobs = useMemo(() => {
    return jobs.map((entry) => ({
      entry,
      salary: formatSalary(entry),
      location: entry.job.meta?.location ?? 'Jakarta, Indonesia',
      company: entry.job.meta?.company ?? 'Internal posting',
    }));
  }, [jobs]);

  const selectedJob = useMemo<typeCardJob | null>(() => {
    if (!jobs.length) return null;
    if (selectedJobId) {
      const matched = jobs.find((entry) => String(entry.id) === selectedJobId);
      if (matched) return matched;
    }
    return jobs[0];
  }, [jobs, selectedJobId]);

  const handleSelectJob = (job: JobEntry) => setSelectedJobId(String(job.id));

  return (
    <div className='flex gap-6 items-start p-6 h-[calc(100vh-64px)] min-h-0 scroll-smooth'>
      <div className='w-[600px] min-w-[384px] h-full min-h-0 overflow-y-auto pr-3 space-y-4 '>
        {formattedJobs.length ? (
          formattedJobs.map(({ entry, salary, location, company }) => (
            <button
              key={entry.id}
              type='button'
              onClick={() => handleSelectJob(entry)}
              className={`w-full bg-[#F7FEFF] rounded-[18px] border-2 overflow-hidden h-auto shrink-0 transition ${
                selectedJob?.id === entry.id
                  ? 'border-[#01777F]'
                  : 'border-gray-200 hover:border-[#01777F]'
              }`}
            >
              <div className='p-5 flex flex-col gap-4 h-full'>
                <header className='flex items-start gap-4'>
                  <Image
                    src={DEFAULT_LOGO}
                    alt='company logo'
                    width={56}
                    height={56}
                    className='w-14 h-14 object-cover rounded-lg border border-gray-200'
                  />

                  <div className='flex text-left flex-col'>
                    <h3 className='text-lg'>
                      {entry.job.name || 'Untitled role'}
                    </h3>
                    <p className='text-gray-500'>{company}</p>
                  </div>
                </header>

                <div className='border-t border-dashed border-gray-300 pt-3' />

                <div className='flex flex-col gap-2 mt-auto'>
                  <div className='flex items-center gap-3 text-gray-600'>
                    <TiLocationOutline
                      className='text-xl text-gray-600'
                      aria-hidden
                    />
                    <span className='text-sm'>{location}</span>
                  </div>

                  <div className='flex items-center gap-3 text-gray-600'>
                    <PiMoneyWavy
                      className='text-xl text-gray-600'
                      aria-hidden
                    />
                    <span className='text-sm'>{salary}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className='rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500'>
            No jobs available yet. Please publish a job from the admin portal.
          </div>
        )}
      </div>
      {selectedJob ? (
        <DetailJob job={selectedJob as JobEntry} />
      ) : (
        <div className='flex-1 flex items-center justify-center border border-gray-200 rounded-2xl'>
          <NotFound />
        </div>
      )}
    </div>
  );
};

export default Page;
