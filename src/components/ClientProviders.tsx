'use client';

import React, { useEffect, useMemo } from 'react';
import { Provider } from 'react-redux';

import { ToastProvider } from '@/components/ui/toast';
import { APPLICATIONS_KEY, loadApplications } from '@/lib/applicationStorage';
import {
  ACTIVE_JOB_STORAGE_KEY,
  hydrateFromStorage,
  readActiveJobSnapshot,
  setActiveJob,
} from '@/lib/store/jobsSlice';
import { makeStore } from '@/lib/store';
import { setApplications } from '@/lib/store/applicationsSlice';
import { JOB_STORAGE_KEY, loadJobStorage } from '@/lib/jobStorage';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo(() => makeStore(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncJobs = () => {
      store.dispatch(hydrateFromStorage(loadJobStorage()));
    };

    const syncApplications = () => {
      store.dispatch(setApplications(loadApplications()));
    };

    const syncActiveJob = () => {
      store.dispatch(setActiveJob(readActiveJobSnapshot()));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === JOB_STORAGE_KEY) {
        syncJobs();
      }
      if (event.key === APPLICATIONS_KEY) {
        syncApplications();
      }
      if (event.key === ACTIVE_JOB_STORAGE_KEY) {
        syncActiveJob();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncJobs();
        syncApplications();
        syncActiveJob();
      }
    };

    syncJobs();
    syncApplications();
    syncActiveJob();

    window.addEventListener('job-storage:updated', syncJobs);
    window.addEventListener('applications:updated', syncApplications);
    window.addEventListener('active-job:updated', syncActiveJob);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('job-storage:updated', syncJobs);
      window.removeEventListener('applications:updated', syncApplications);
      window.removeEventListener('active-job:updated', syncActiveJob);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [store]);

  return (
    <Provider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
