'use client';

const STORAGE_KEY = 'rakamin_email_credentials';

export interface StoredCredential {
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const loadCredentials = (): StoredCredential[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.email === 'string')
      .map((item) => ({
        email: String(item.email).trim().toLowerCase(),
        password: String(item.password ?? ''),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
        updatedAt: String(item.updatedAt ?? new Date().toISOString()),
      }));
  } catch (error) {
    console.warn('Failed to read credentials from localStorage', error);
    return [];
  }
};

const saveCredentials = (credentials: StoredCredential[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
};

export const findCredential = (email: string): StoredCredential | null => {
  const normalized = email.trim().toLowerCase();
  return loadCredentials().find((item) => item.email === normalized) ?? null;
};

export const upsertCredential = (email: string, password: string) => {
  const normalized = email.trim().toLowerCase();
  const credentials = loadCredentials();
  const now = new Date().toISOString();
  const index = credentials.findIndex((item) => item.email === normalized);

  if (index >= 0) {
    credentials[index] = {
      ...credentials[index],
      password,
      updatedAt: now,
    };
  } else {
    credentials.push({
      email: normalized,
      password,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveCredentials(credentials);
};
