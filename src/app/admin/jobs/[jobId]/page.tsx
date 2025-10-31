'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PiMoneyWavy } from 'react-icons/pi';
import { TiLocationOutline } from 'react-icons/ti';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { JobEntry } from '@/lib/jobStorage';
import type { ApplicationEntry } from '@/lib/applicationStorage';
import { useAppSelector } from '@/lib/store/hooks';

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '-';
  }
};

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

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobParam = params?.jobId;
  const jobId = jobParam ? decodeURIComponent(String(jobParam)) : '';
  const jobs = useAppSelector((state) => state.jobs.items);
  const applications = useAppSelector((state) => state.applications.entries);

  const job = useMemo(() => {
    return jobs.find((entry) => String(entry.id) === jobId) ?? null;
  }, [jobs, jobId]);

  const filteredCandidates = useMemo<ApplicationEntry[]>(() => {
    if (!job) return [];
    const name = job.job.name?.trim().toLowerCase() ?? '';

    return applications.filter((app) => {
      if (!app) return false;
      if (app.jobId && String(app.jobId) === jobId) return true;
      const appName = app.jobName?.trim().toLowerCase();
      if (appName && name && appName === name) return true;
      return false;
    });
  }, [applications, job, jobId]);

  useEffect(() => {
    if (jobId && !job) {
      const timeout = window.setTimeout(() => {
        router.replace('/admin');
      }, 2000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [job, jobId, router]);

  if (!job) {
    return (
      <div className='min-h-[70vh] bg-slate-50/40'>
        <div className='max-w-6xl mx-auto px-6 py-16 text-center text-slate-500'>
          <h1 className='text-2xl font-semibold text-slate-700'>
            Job not found
          </h1>
          <p className='mt-2'>Redirecting you back to the job list…</p>
          <div className='mt-6'>
            <Link href='/admin'>
              <Button className='bg-[#01959F] hover:bg-[#018089]'>
                Back to Job List
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-[70vh'>
      <div className='max-w-6xl mx-auto px-6 py-8 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-slate-900'>
              Manage Job
            </h1>
            <p className='text-sm text-slate-500'>
              Review candidates for your opening
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/admin'>
              <Button variant='outline'>Job List</Button>
            </Link>
            <Button className='bg-[#01959F] hover:bg-[#018089]' disabled>
              Manage Candidate
            </Button>
          </div>
        </div>

        <Card className='rounded-3xl bg-white p-6'>
          <header className='mb-6 flex items-center justify-between gap-4'>
            <div>
              <h2 className='text-xl font-semibold text-slate-900'>
                {job.job.name || 'Untitled role'}
              </h2>
              <p className='text-sm text-slate-500'>
                {filteredCandidates.length} candidate
              </p>
              <div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500'>
                <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-600 capitalize'>
                  {job.job.type || 'Unspecified'}
                </span>
                <span className='inline-flex items-center gap-2 text-slate-500'>
                  <TiLocationOutline className='text-base text-[#01959F]' />
                  {job.job.meta?.location ?? 'Jakarta, Indonesia'}
                </span>
                <span className='inline-flex items-center gap-2 text-slate-500'>
                  <PiMoneyWavy className='text-base text-[#01959F]' />
                  {formatSalary(job)}
                </span>
              </div>
            </div>
          </header>

          <div className='overflow-x-auto rounded-2xl border border-slate-100'>
            <table className='min-w-full divide-y divide-slate-100 text-sm'>
              <thead className='bg-slate-50 text-slate-500'>
                <tr>
                  <th className='px-4 py-3 text-left font-medium'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-slate-300'
                    />
                  </th>
                  <th className='px-4 py-3 text-left font-medium'>
                    Nama Lengkap
                  </th>
                  <th className='px-4 py-3 text-left font-medium'>
                    Email Address
                  </th>
                  <th className='px-4 py-3 text-left font-medium'>
                    Phone Numbers
                  </th>
                  <th className='px-4 py-3 text-left font-medium'>
                    Date of Birth
                  </th>
                  <th className='px-4 py-3 text-left font-medium'>Domicile</th>
                  <th className='px-4 py-3 text-left font-medium'>Gender</th>
                  <th className='px-4 py-3 text-left font-medium'>
                    Link Linkedin
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 text-slate-700'>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate, index) => (
                    <tr
                      key={`${candidate.email ?? index}-${
                        candidate.submittedAt ?? index
                      }`}
                      className='hover:bg-slate-50'
                    >
                      <td className='px-4 py-3'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-slate-300'
                        />
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {candidate.fullName || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-500'>
                        {candidate.email || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-500'>
                        {candidate.phoneNumber || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-500'>
                        {formatDate(candidate.dateOfBirth)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-500'>
                        {candidate.domicile || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap capitalize text-slate-500'>
                        {candidate.gender || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-500'>
                        {candidate.linkedinUrl ? (
                          <a
                            href={candidate.linkedinUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-[#01959F] hover:underline'
                          >
                            {candidate.linkedinUrl}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-4 py-10 text-center text-slate-400'
                    >
                      No candidates yet for this job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
