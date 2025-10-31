export const APPLICATIONS_KEY = 'applications';

export interface ApplicationEntry {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null;
  domicile?: string;
  gender?: string;
  linkedinUrl?: string;
  submittedAt?: string;
  jobId?: string | number | null;
  jobName?: string;
  countryCode?: string;
  photoProfile?: string | null;
}

const isBrowser = () => typeof window !== 'undefined';

export const loadApplications = (): ApplicationEntry[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ApplicationEntry[];
  } catch {
    return [];
  }
};

export const saveApplications = (entries: ApplicationEntry[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent('applications:updated'));
};
