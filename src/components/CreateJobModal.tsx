'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import {
  appendJobEntry,
  ApplicationFormShape,
  JobEntry,
  loadJobStorage,
  saveJobStorage,
} from '@/lib/jobStorage';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// mapping of internal keys to friendly labels
const profileFieldMap: Array<{ key: string; label: string }> = [
  { key: 'full_name', label: 'Full name' },
  { key: 'photo_profile', label: 'Photo Profile' },
  { key: 'gender', label: 'Gender' },
  { key: 'domicile', label: 'Domicile' },
  { key: 'email', label: 'Email' },
  { key: 'phone_number', label: 'Phone number' },
  { key: 'linkedin_link', label: 'Linkedin link' },
  { key: 'date_of_birth', label: 'Date of birth' },
];

const DEFAULT_APPLICATION_FORM: ApplicationFormShape = {
  sections: [
    {
      title: 'Minimum Profile Information Required',
      fields: [
        { key: 'full_name', validation: { required: true } },
        { key: 'photo_profile', validation: { required: true } },
        { key: 'gender', validation: { required: true } },
        { key: 'domicile', validation: { required: false } },
        { key: 'email', validation: { required: true } },
        { key: 'phone_number', validation: { required: true } },
        { key: 'linkedin_link', validation: { required: true } },
        { key: 'date_of_birth', validation: { required: false } },
      ],
    },
  ],
};

export default function CreateJobModal({
  isOpen,
  onClose,
}: CreateJobModalProps) {
  const [jobName, setJobName] = useState('');
  const [jobType, setJobType] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const { publish } = useToast();
  // helpers for IDR formatting
  const formatIDR = (value: string) => {
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    // insert dot as thousand separator
    const withSep = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${withSep}`;
  };

  const numericFromFormatted = (value: string) => {
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return 0;
    return Number(digits);
  };
  const [applicationForm, setApplicationForm] =
    useState<ApplicationFormShape | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const ensureApplicationForm = () => {
      // prefer draft form, then latest job form, then legacy keys, then default
      const storage = loadJobStorage();
      const latestJob = storage.jobs?.[storage.jobs.length - 1];
      const draftForm = storage.draft?.applicationForm;
      const latestForm = latestJob?.applicationForm;

      const candidateForms: Array<ApplicationFormShape | null> = [
        draftForm,
        latestForm,
      ];

      try {
        const legacy = localStorage.getItem('application_form');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          candidateForms.push(parsed?.application_form ?? parsed ?? null);
        }
      } catch {
        candidateForms.push(null);
      }

      candidateForms.push(DEFAULT_APPLICATION_FORM);

      const resolvedForm = candidateForms.find(
        (form): form is ApplicationFormShape =>
          Boolean(form?.sections && Array.isArray(form.sections))
      );

      const nextForm = resolvedForm ?? DEFAULT_APPLICATION_FORM;
      setApplicationForm(nextForm);
      saveJobStorage({
        ...storage,
        draft: { applicationForm: nextForm },
      });
    };

    ensureApplicationForm();
  }, [isOpen]);

  // helper to persist applicationForm to localStorage
  const persistApplicationForm = (next: ApplicationFormShape) => {
    setApplicationForm(next);
    try {
      const storage = loadJobStorage();
      saveJobStorage({
        ...storage,
        draft: { applicationForm: next },
      });
    } catch {
      // ignore localStorage errors
      // console.warn('Failed to save application_form', e);
    }
  };

  const section = applicationForm?.sections?.[0];

  // helper to get field entry by key
  const getFieldEntry = (key: string) => {
    return section?.fields?.find((field) => field.key === key) ?? null;
  };

  const setFieldRequired = (key: string, required: boolean) => {
    const current = applicationForm ?? DEFAULT_APPLICATION_FORM;
    const sec = current.sections?.[0] ?? { title: '', fields: [] };
    const fields = Array.isArray(sec.fields) ? [...sec.fields] : [];
    const idx = fields.findIndex((field) => field.key === key);
    if (idx >= 0) {
      // when setting required/optional, ensure field is visible
      fields[idx] = { ...fields[idx], validation: { required }, hidden: false };
    } else {
      fields.push({ key, validation: { required }, hidden: false });
    }
    const next: ApplicationFormShape = {
      ...current,
      sections: [{ ...sec, fields }],
    };
    persistApplicationForm(next);
  };

  // mark field as hidden (Off) without removing it from storage
  const setFieldHidden = (key: string, hidden: boolean) => {
    const current = applicationForm ?? DEFAULT_APPLICATION_FORM;
    const sec = current.sections?.[0] ?? { title: '', fields: [] };
    const fields = Array.isArray(sec.fields) ? [...sec.fields] : [];
    const idx = fields.findIndex((field) => field.key === key);
    if (idx >= 0) {
      fields[idx] = { ...fields[idx], hidden };
    } else {
      // create entry as hidden (default optional)
      fields.push({ key, validation: { required: false }, hidden });
    }
    const next: ApplicationFormShape = {
      ...current,
      sections: [{ ...sec, fields }],
    };
    persistApplicationForm(next);
  };

  const canPublish = useMemo(() => {
    // basic checks: required job fields must be filled
    if (
      !jobName.trim() ||
      !jobType.trim() ||
      !description.trim() ||
      !candidates.trim()
    ) {
      return false;
    }
    // ensure all applicationForm mandatory fields are present in the form structure (not relevant to job posting inputs)
    // since this modal edits which profile fields are required, we don't verify applicant values here
    return true;
  }, [jobName, jobType, description, candidates]);

  const handlePublish = () => {
    const createdAt = new Date().toISOString();
    const candidatesNeeded = Number(candidates);
    const minSalaryNumber = numericFromFormatted(minSalary) || null;
    const maxSalaryNumber = numericFromFormatted(maxSalary) || null;
    const applicationFormSnapshot = applicationForm ?? DEFAULT_APPLICATION_FORM;

    const jobEntry: JobEntry = {
      id: `job-${Date.now()}`,
      status: 'draft',
      metadata: {
        createdAt,
      },
      job: {
        name: jobName.trim(),
        type: jobType.trim(),
        description: description.trim(),
        meta: undefined,
      },
      hiring: {
        candidatesNeeded: Number.isFinite(candidatesNeeded) ? candidatesNeeded : 0,
      },
      salary: {
        currency: 'IDR',
        range: {
          min: minSalaryNumber,
          max: maxSalaryNumber,
        },
        formatted: {
          min: minSalary.trim(),
          max: maxSalary.trim(),
        },
      },
      applicationForm: applicationFormSnapshot,
    };

    try {
      const nextStorage = appendJobEntry(jobEntry);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('job_posting', JSON.stringify(jobEntry));
        window.localStorage.setItem(
          'application_form',
          JSON.stringify(applicationFormSnapshot)
        );
      }

      // quick dev helper so the user can inspect the saved payload
      console.info('Job publish storage snapshot', {
        latestJob: jobEntry,
        history: nextStorage,
      });

      publish({
        title: 'Job vacancy successfully created',
        description: 'Your posting is saved to this device.',
        variant: 'success',
      });
      onClose();
    } catch {
      // fallback: notify user
      // console.error(e);
      publish({
        title: 'Failed to save job data',
        description: 'Please check storage availability and try again.',
        variant: 'error',
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      {/* force white background for native select dropdown + option text using a small scoped rule */}
      <style jsx global>{`
        /* Ensure native select dropdown options render with white bg and dark text on platforms that respect option styling */
        .create-job-select,
        .create-job-select option {
          background: #ffffff !important;
          color: #111827 !important; /* text-gray-900 */
        }
        /* Restore menulist appearance on webkit so the control looks like a select */
        .create-job-select {
          -webkit-appearance: menulist-button;
          appearance: menulist-button;
        }
      `}</style>
      <div className='bg-white rounded-lg w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] shadow-lg'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-lg font-semibold'>Job Opening</h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        {/* Scrollable content */}
        <div className='px-6 py-6 overflow-y-auto max-h-[70vh] space-y-6'>
          <div className='space-y-2'>
            <Label>Job Name*</Label>
            <Input
              placeholder='Ex. Front End Engineer'
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Job Type*</Label>
            <div className='relative'>
              <select
                className='create-job-select w-full bg-white text-gray-900 border rounded px-3 py-2 pr-10'
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value=''>Select job type</option>
                <option value='full-time'>Full-time</option>
                <option value='part-time'>Part-time</option>
                <option value='contract'>Contract</option>
              </select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Job Description*</Label>
            <textarea
              className='w-full border rounded px-3 py-2 mt-2 min-h-[90px] resize-none'
              placeholder='Ex.'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Number of Candidate Needed*</Label>
            <Input
              placeholder='Ex. 2'
              value={candidates}
              onChange={(e) => setCandidates(e.target.value)}
            />
          </div>

          <div className='border-t pt-4'>
            <div className='text-sm text-muted-foreground mb-4'>Job Salary</div>
            <div className='grid grid-cols-2 gap-4 items-start'>
              <div>
                <Label className='text-xs'>Minimum Estimated Salary</Label>
                <Input
                  placeholder='Rp 7.000.000'
                  value={minSalary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const formatted = formatIDR(e.target.value);
                    setMinSalary(formatted);
                  }}
                />
              </div>
              <div>
                <Label className='text-xs'>Maximum Estimated Salary</Label>
                <Input
                  placeholder='Rp 8.000.000'
                  value={maxSalary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const formatted = formatIDR(e.target.value);
                    setMaxSalary(formatted);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Profile information box: render all possible fields (missing entries default to Off) */}
          <div className='border rounded-lg p-4'>
            <div className='font-semibold mb-4'>
              {section?.title ?? 'Minimum Profile Information Required'}
            </div>
            <div className='space-y-2'>
              {profileFieldMap.map((m) => {
                const f = getFieldEntry(m.key) ?? {
                  key: m.key,
                  validation: { required: false },
                  hidden: true,
                };
                const required = !!f?.validation?.required;
                const hidden = !!f.hidden;
                return (
                  <div
                    key={m.key}
                    className='flex items-center justify-between border-b last:border-b-0 pb-3'
                  >
                    <div
                      className={`text-sm ${
                        hidden ? 'text-gray-400 italic' : ''
                      }`}
                    >
                      {m.label}
                      {hidden ? ' (Off)' : ''}
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setFieldRequired(m.key, true)}
                        className={`px-3 py-1 rounded-full border text-xs ${
                          required && !hidden
                            ? 'bg-teal-50 border-teal-400 text-teal-700'
                            : 'text-teal-600'
                        }`}
                      >
                        Mandatory
                      </button>
                      <button
                        onClick={() => setFieldRequired(m.key, false)}
                        className={`px-3 py-1 rounded-full border text-xs ${
                          !required && !hidden
                            ? 'bg-gray-50 border-gray-300 text-gray-700'
                            : 'text-gray-500'
                        }`}
                      >
                        Optional
                      </button>
                      <button
                        onClick={() => setFieldHidden(m.key, !hidden)}
                        className={`px-3 py-1 rounded-full border text-xs ${
                          hidden
                            ? 'bg-gray-50 border-gray-200 text-gray-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {hidden ? 'Show' : 'Off'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t flex items-center justify-end'>
          <Button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`${!canPublish ? 'bg-gray-200 text-gray-500' : ''}`}
          >
            Publish Job
          </Button>
        </div>
      </div>
    </div>
  );
}
