'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { IoIosSearch } from 'react-icons/io';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobEntry, JobStatus } from '@/lib/jobStorage';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setSearchTerm } from '@/lib/store/jobsSlice';

const statusStyles: Record<
  JobStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: 'Active',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  inactive: {
    label: 'Inactive',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-600',
    dotClass: 'bg-rose-500',
  },
  draft: {
    label: 'Draft',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-600',
    dotClass: 'bg-amber-500',
  },
};

const formatDate = (value: string) => {
  if (!value) return 'Unknown';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return 'Unknown';
  }
};

const formatSalaryRange = (entry: JobEntry['salary']) => {
  const { formatted, range } = entry;
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

export default function JobList() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.jobs.items);
  const searchText = useAppSelector((state) => state.jobs.searchTerm);

  const filteredJobs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return jobs;
    return jobs.filter((entry) => {
      const name = entry.job.name?.toLowerCase() ?? '';
      return name.includes(keyword);
    });
  }, [jobs, searchText]);

  const hasJobs = jobs.length > 0;
  const hasFilteredJobs = filteredJobs.length > 0;

  return (
    <div className='min-h-[70vh] '>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='flex items-start gap-8'>
          <div className='flex-1'>
            <div className='mb-6'>
              <div className='text-2xl font-semibold text-gray-900 mb-4'>
                Job List
              </div>
              <div className='relative max-w-3xl'>
                <Input
                  placeholder='Search by job details'
                  value={searchText}
                  onChange={(event) =>
                    dispatch(setSearchTerm(event.target.value))
                  }
                  className='pl-11 h-12 rounded-2xl border border-slate-200 shadow-sm'
                />
                <IoIosSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5' />
              </div>
            </div>

            <div className='relative rounded-3xl  bg-white p-4 '>
              <div className='flex items-center justify-between border-b border-slate-100 pb-3 text-sm text-slate-500'>
                <span>
                  {hasFilteredJobs ? `${filteredJobs.length} job(s)` : '0 job'}
                </span>
                {searchText ? (
                  <button
                    className='text-[#01959F] hover:underline'
                    onClick={() => dispatch(setSearchTerm(''))}
                  >
                    Clear search
                  </button>
                ) : null}
              </div>
              {hasFilteredJobs ? (
                <div className='max-h-[60vh] space-y-4 overflow-y-auto pt-4 pr-1 md:pr-2'>
                  {filteredJobs.map((job) => {
                    const status = job.status ?? 'draft';
                    const theme = statusStyles[status] ?? statusStyles.draft;
                    return (
                      <div
                        key={job.id}
                        className='flex items-center gap-4 rounded-3xl border bg-white px-5 py-4 transition hover:border-slate-200'
                      >
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-wrap items-center gap-3 text-xs text-slate-400'>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-medium ${theme.badgeClass}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${theme.dotClass}`}
                              />
                              {theme.label}
                            </span>
                            <span className='text-slate-400 capitalize'>
                              started on {formatDate(job.metadata.createdAt)}
                            </span>
                          </div>
                          <div className='mt-2 flex flex-col gap-1'>
                            <div className='truncate text-lg font-semibold text-gray-900'>
                              {job.job.name || 'Untitled role'}
                            </div>
                            <div className='text-sm text-slate-500'>
                              {formatSalaryRange(job.salary)}
                            </div>
                          </div>
                        </div>
                        <div className='shrink-0'>
                          <Link
                            href={`/admin/jobs/${encodeURIComponent(
                              String(job.id)
                            )}`}
                            className='inline-flex'
                          >
                            <Button className='bg-[#01959F] hover:bg-[#018089] px-5'>
                              Manage Job
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-center text-sm text-slate-500'>
                  <p className='font-medium text-gray-900'>
                    {hasJobs
                      ? `No job name matches “${searchText}”.`
                      : 'No job postings yet.'}
                  </p>
                  <p className='mt-1 max-w-xs text-slate-400'>
                    {hasJobs
                      ? 'Try typing a different keyword or clear the search box.'
                      : 'Publish a job to see it listed here.'}
                  </p>
                  {!hasJobs ? (
                    <Link href='/admin/create-job'>
                      <Button className='mt-4 bg-[#FBC037] text-black hover:*:'>
                        Create a new job
                      </Button>
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className='hidden w-[320px] lg:block'>
            <div className='rounded-3xl bg-black/20 p-6 backdrop-blur-sm text-white'>
              <div className='flex flex-col items-start gap-4'>
                <div>
                  <div className='text-lg font-semibold'>
                    Recruit the best candidates
                  </div>
                  <div className='mt-1 text-sm text-white/80'>
                    Create jobs, invite, and hire with ease
                  </div>
                </div>
                <Link href='/admin/create-job'>
                  <Button className='bg-[#01959F] hover:bg-[#018089]'>
                    Create a new job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
