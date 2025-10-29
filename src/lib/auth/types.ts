export type MagicLinkPurpose = 'login' | 'register';

export interface StoredUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface StoredMagicLink {
  tokenHash: string;
  email: string;
  redirectTo: string;
  expiresAt: string;
  createdAt: string;
  consumedAt?: string;
  purpose: MagicLinkPurpose;
  metadata?: {
    previewUrl?: string;
    requestIp?: string | null;
    userAgent?: string | null;
  };
}

export interface AuthDatabaseFile {
  jobs?: unknown;
  users?: StoredUser[];
  magicLinks?: StoredMagicLink[];
}

export interface AuthDatabaseShape {
  jobs: unknown;
  users: StoredUser[];
  magicLinks: StoredMagicLink[];
}
