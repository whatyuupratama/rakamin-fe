import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AuthDatabaseFile,
  AuthDatabaseShape,
  MagicLinkPurpose,
  StoredMagicLink,
  StoredUser,
} from './types';

const DB_PATH = path.join(process.cwd(), 'db.json');

const createUserId = () => crypto.randomUUID();

const normalizeUsers = (users: StoredUser[] | undefined | null): StoredUser[] => {
  if (!Array.isArray(users)) return [];
  return users
    .filter((user) => typeof user?.email === 'string')
    .map((user) => ({
      id: user.id ?? createUserId(),
      email: user.email.trim().toLowerCase(),
      createdAt: user.createdAt ?? new Date().toISOString(),
      updatedAt: user.updatedAt ?? new Date().toISOString(),
      lastLoginAt: user.lastLoginAt,
    }));
};

const normalizeMagicLinks = (
  links: StoredMagicLink[] | undefined | null
): StoredMagicLink[] => {
  if (!Array.isArray(links)) return [];
  return links
    .filter((link) => typeof link?.tokenHash === 'string')
    .map((link) => ({
      ...link,
      email: link.email.trim().toLowerCase(),
      redirectTo: link.redirectTo ?? '/user',
      expiresAt: link.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: link.createdAt ?? new Date().toISOString(),
      purpose: link.purpose ?? 'login',
    }));
};

const readRawDatabase = async (): Promise<AuthDatabaseFile> => {
  try {
    const payload = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(payload) as AuthDatabaseFile;
    return parsed ?? {};
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

const writeDatabase = async (data: AuthDatabaseShape) => {
  const serialized = JSON.stringify(
    {
      jobs: data.jobs ?? [],
      users: data.users,
      magicLinks: data.magicLinks,
    },
    null,
    2
  );
  await fs.writeFile(DB_PATH, `${serialized}\n`, 'utf-8');
};

export const loadDatabase = async (): Promise<AuthDatabaseShape> => {
  const raw = await readRawDatabase();
  const jobs = raw.jobs ?? [];
  const users = normalizeUsers(raw.users);
  const magicLinks = normalizeMagicLinks(raw.magicLinks);
  return {
    jobs,
    users,
    magicLinks,
  };
};

export const saveDatabase = async (data: AuthDatabaseShape) => {
  await writeDatabase(data);
};

export const getUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const database = await loadDatabase();
  const user = database.users.find((entry) => entry.email === normalizedEmail);
  return user ?? null;
};

export const upsertUserByEmail = async (email: string): Promise<StoredUser> => {
  const normalizedEmail = email.trim().toLowerCase();
  const database = await loadDatabase();
  const existing = database.users.find((user) => user.email === normalizedEmail);

  if (existing) {
    existing.updatedAt = new Date().toISOString();
    await saveDatabase(database);
    return existing;
  }

  const now = new Date().toISOString();
  const nextUser: StoredUser = {
    id: createUserId(),
    email: normalizedEmail,
    createdAt: now,
    updatedAt: now,
  };

  database.users.push(nextUser);
  await saveDatabase(database);
  return nextUser;
};

export const appendMagicLink = async (link: StoredMagicLink) => {
  const database = await loadDatabase();
  database.magicLinks.push(link);
  await saveDatabase(database);
};

export const consumeMagicLink = async (
  tokenHash: string
): Promise<{ link: StoredMagicLink | null; user: StoredUser | null }> => {
  const database = await loadDatabase();
  const link = database.magicLinks.find((entry) => entry.tokenHash === tokenHash);

  if (!link) {
    return { link: null, user: null };
  }

  if (link.consumedAt) {
    return { link, user: database.users.find((user) => user.email === link.email) ?? null };
  }

  link.consumedAt = new Date().toISOString();

  const user = database.users.find((entry) => entry.email === link.email) ?? null;
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = user.lastLoginAt;
  }

  await saveDatabase(database);

  return { link, user };
};

export const recordUserLogin = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const database = await loadDatabase();
  const user = database.users.find((entry) => entry.email === normalizedEmail);
  if (!user) {
    return null;
  }

  const now = new Date().toISOString();
  user.lastLoginAt = now;
  user.updatedAt = now;
  await saveDatabase(database);
  return user;
};

export const purgeExpiredMagicLinks = async () => {
  const database = await loadDatabase();
  const now = Date.now();
  const activeLinks = database.magicLinks.filter((link) => {
    const expires = new Date(link.expiresAt).getTime();
    return Number.isFinite(expires) && expires > now && !link.consumedAt;
  });

  if (activeLinks.length === database.magicLinks.length) {
    return;
  }

  database.magicLinks = activeLinks;
  await saveDatabase(database);
};

export const listMagicLinksForEmail = async (
  email: string,
  purpose?: MagicLinkPurpose
) => {
  const database = await loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  return database.magicLinks.filter((link) => {
    if (link.email !== normalizedEmail) return false;
    if (purpose && link.purpose !== purpose) return false;
    return true;
  });
};
