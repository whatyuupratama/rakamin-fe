import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  type ApplicationFormShape,
  type JobEntry,
  type JobStorageShape,
  loadJobStorage,
} from '@/lib/jobStorage';

export const ACTIVE_JOB_STORAGE_KEY = 'active_job';

export interface ActiveJobSnapshot {
  id: string | null;
  title: string;
  company: string;
}

const readActiveJobSnapshot = (): ActiveJobSnapshot | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_JOB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveJobSnapshot | null;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      id: parsed.id ?? null,
      title: parsed.title ?? 'Unknown role',
      company: parsed.company ?? '',
    };
  } catch {
    return null;
  }
};

export type JobsState = {
  items: JobEntry[];
  searchTerm: string;
  draftApplicationForm: ApplicationFormShape | null;
  activeJob: ActiveJobSnapshot | null;
};

const initialStorage = loadJobStorage();

const initialState: JobsState = {
  items: initialStorage.jobs.slice().reverse(),
  searchTerm: '',
  draftApplicationForm: initialStorage.draft?.applicationForm ?? null,
  activeJob: readActiveJobSnapshot(),
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    hydrateFromStorage(state, action: PayloadAction<JobStorageShape>) {
      state.items = action.payload.jobs.slice().reverse();
      state.draftApplicationForm =
        action.payload.draft?.applicationForm ?? null;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setDraftApplicationForm(
      state,
      action: PayloadAction<ApplicationFormShape | null>
    ) {
      state.draftApplicationForm = action.payload;
    },
    setActiveJob(state, action: PayloadAction<ActiveJobSnapshot | null>) {
      state.activeJob = action.payload;
    },
    upsertJob(state, action: PayloadAction<JobEntry>) {
      const existingIndex = state.items.findIndex(
        (job) => String(job.id) === String(action.payload.id)
      );
      if (existingIndex >= 0) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items = [action.payload, ...state.items];
      }
    },
  },
});

export const {
  hydrateFromStorage,
  setSearchTerm,
  setDraftApplicationForm,
  setActiveJob,
  upsertJob,
} = jobsSlice.actions;

export { readActiveJobSnapshot };

export default jobsSlice.reducer;
