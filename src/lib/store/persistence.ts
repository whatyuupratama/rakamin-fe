import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { saveApplications } from '@/lib/applicationStorage';
import {
  saveJobStorage,
  JOB_STORAGE_VERSION,
  type JobStorageShape,
} from '@/lib/jobStorage';
import {
  ACTIVE_JOB_STORAGE_KEY,
  setActiveJob,
  setDraftApplicationForm,
  upsertJob,
  type JobsState,
} from './jobsSlice';
import { addApplication, type ApplicationsState } from './applicationsSlice';

type StoreState = {
  jobs: JobsState;
  applications: ApplicationsState;
};

const listenerMiddleware = createListenerMiddleware<StoreState>();

const buildJobStoragePayload = (state: StoreState): JobStorageShape => ({
  version: JOB_STORAGE_VERSION,
  jobs: state.jobs.items.slice().reverse(),
  draft: {
    applicationForm: state.jobs.draftApplicationForm,
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(upsertJob, setDraftApplicationForm),
  effect: async (_, api) => {
    const snapshot = buildJobStoragePayload(api.getState());
    saveJobStorage(snapshot);
  },
});

listenerMiddleware.startListening({
  actionCreator: addApplication,
  effect: async (_, api) => {
    const state = api.getState();
    saveApplications(state.applications.entries);
  },
});

listenerMiddleware.startListening({
  actionCreator: setActiveJob,
  effect: async (action) => {
    if (typeof window === 'undefined') return;
    if (action.payload) {
      window.localStorage.setItem(
        ACTIVE_JOB_STORAGE_KEY,
        JSON.stringify(action.payload)
      );
    } else {
      window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('active-job:updated'));
  },
});

export default listenerMiddleware;
