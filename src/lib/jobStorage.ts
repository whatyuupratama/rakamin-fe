export const JOB_STORAGE_KEY = 'job_publish_history';
export const JOB_STORAGE_VERSION = 1;

export type JobStatus = 'draft' | 'active' | 'inactive';

export interface ApplicationFormField {
  key: string;
  validation?: {
    required?: boolean;
  };
  hidden?: boolean;
  [key: string]: unknown;
}

export interface ApplicationFormSection {
  title: string;
  fields: ApplicationFormField[];
}

export interface ApplicationFormShape {
  sections: ApplicationFormSection[];
}

export interface JobEntry {
  id: string;
  status: JobStatus;
  metadata: {
    createdAt: string;
  };
  job: {
    name: string;
    type: string;
    description: string;
    meta?: {
      company?: string;
      location?: string;
    };
  };
  hiring: {
    candidatesNeeded: number;
  };
  salary: {
    currency: string;
    range: {
      min: number | null;
      max: number | null;
    };
    formatted: {
      min: string;
      max: string;
    };
  };
  applicationForm: ApplicationFormShape | null;
}

export interface JobStorageShape {
  version: number;
  jobs: JobEntry[];
  draft: {
    applicationForm: ApplicationFormShape | null;
  };
}

const emptyDraft = { applicationForm: null };

export const emptyJobStorage = (): JobStorageShape => ({
  version: JOB_STORAGE_VERSION,
  jobs: [],
  draft: emptyDraft,
});

const isBrowser = () => typeof window !== 'undefined';

const normalizeJobEntry = (entry: unknown): JobEntry => {
  const source = entry as Partial<JobEntry> & {
    metadata?: Partial<JobEntry['metadata']>;
    job?: Partial<JobEntry['job']> & {
      meta?: JobEntry['job']['meta'];
    };
    hiring?: Partial<JobEntry['hiring']>;
    salary?: Partial<JobEntry['salary']> & {
      range?: Partial<JobEntry['salary']['range']>;
      formatted?: Partial<JobEntry['salary']['formatted']>;
    };
  };

  return {
    id: String(source?.id ?? `job-${Date.now()}`),
    status: (source?.status as JobStatus) ?? 'draft',
    metadata: {
      createdAt: String(
        source?.metadata?.createdAt ?? new Date().toISOString()
      ),
    },
    job: {
      name: String(source?.job?.name ?? 'Untitled Role'),
      type: String(source?.job?.type ?? ''),
      description: String(source?.job?.description ?? ''),
      meta: source?.job?.meta ?? undefined,
    },
    hiring: {
      candidatesNeeded: Number.isFinite(source?.hiring?.candidatesNeeded)
        ? Number(source?.hiring?.candidatesNeeded)
        : 0,
    },
    salary: {
      currency: String(source?.salary?.currency ?? 'IDR'),
      range: {
        min:
          typeof source?.salary?.range?.min === 'number'
            ? source.salary.range.min
            : null,
        max:
          typeof source?.salary?.range?.max === 'number'
            ? source.salary.range.max
            : null,
      },
      formatted: {
        min: String(source?.salary?.formatted?.min ?? ''),
        max: String(source?.salary?.formatted?.max ?? ''),
      },
    },
    applicationForm: source?.applicationForm ?? null,
  };
};

export const loadJobStorage = (): JobStorageShape => {
  if (!isBrowser()) return emptyJobStorage();

  try {
    const raw = window.localStorage.getItem(JOB_STORAGE_KEY);
    if (!raw) return emptyJobStorage();

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.jobs)) {
      return emptyJobStorage();
    }

    const jobs: JobEntry[] = parsed.jobs.map(normalizeJobEntry);

    return {
      version: parsed.version ?? JOB_STORAGE_VERSION,
      jobs,
      draft: parsed.draft ?? emptyDraft,
    };
  } catch {
    return emptyJobStorage();
  }
};

export const saveJobStorage = (storage: JobStorageShape) => {
  if (!isBrowser()) return;

  const payload: JobStorageShape = {
    version: storage.version,
    jobs: storage.jobs.map(normalizeJobEntry),
    draft: storage.draft ?? emptyDraft,
  };

  window.localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('job-storage:updated'));
};

export const appendJobEntry = (entry: JobEntry): JobStorageShape => {
  const current = loadJobStorage();
  const next: JobStorageShape = {
    version: JOB_STORAGE_VERSION,
    jobs: [...current.jobs, normalizeJobEntry(entry)],
    draft: {
      applicationForm: entry.applicationForm ?? current.draft.applicationForm ?? null,
    },
  };
  saveJobStorage(next);
  return next;
};
