'use client';
import React, { useEffect, useState } from 'react';
import { TiLocationOutline } from 'react-icons/ti';
import { PiMoneyWavy } from 'react-icons/pi';
import axios from 'axios';
import type { typeCardJob } from './type';
import DetailJob from './features/DetailJob';
import Image from 'next/image';
import NotFound from '@/app/user/components/notFound';
const Page: React.FC = () => {
  const [job, setJob] = useState<typeCardJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<typeCardJob | null>(null);
  useEffect(() => {
    axios.get('http://localhost:8000/jobs').then((response) => {
      setJob(response.data);
      setSelectedJob(response.data[0] ?? null);
    });
  }, []);

  return (
    <div className='flex gap-6 items-start p-6 h-[calc(100vh-64px)] min-h-0 scroll-smooth'>
      <div className='w-[600px] min-w-[384px] h-full min-h-0 overflow-y-auto pr-3 space-y-4 '>
        {job.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => setSelectedJob(item)}
            className='w-full bg-[#F7FEFF] rounded-[18px] border-2 border-gray-200 hover:border-[#01777F] overflow-hidden h-auto shrink-0'
          >
            <div className='p-5 flex flex-col gap-4 h-full'>
              <header className='flex items-start gap-4'>
                <Image
                  src={item.logo ?? '/rakamin.png'}
                  alt={`${item.company} logo`}
                  width={56}
                  height={56}
                  className='w-14 h-14 object-cover rounded-lg border border-gray-200'
                />

                <div className='flex text-left flex-col'>
                  <h3 className='text-lg'>{item.title}</h3>
                  <p className='text-gray-500'>{item.company}</p>
                </div>
              </header>

              <div className='border-t border-dashed border-gray-300 pt-3' />

              <div className='flex flex-col gap-2 mt-auto'>
                <div className='flex items-center gap-3 text-gray-600'>
                  <TiLocationOutline
                    className='text-xl text-gray-600'
                    aria-hidden
                  />
                  <span className='text-sm'>{item.location}</span>
                </div>

                <div className='flex items-center gap-3 text-gray-600'>
                  <PiMoneyWavy className='text-xl text-gray-600' aria-hidden />
                  <span className='text-sm'>{item.salary}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {selectedJob ? (
        <DetailJob job={selectedJob} />
      ) : (
        <div className='flex-1 flex items-center justify-center border border-gray-200 rounded-2xl'>
          <NotFound />
        </div>
      )}
    </div>
  );
};

export default Page;
