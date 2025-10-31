import { cookies } from 'next/headers';
import type { StoredUser } from './types';
import { signJwt, verifyJwt } from './jwt';

export const SESSION_COOKIE_NAME = 'rakamin_session';
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload extends Record<string, unknown> {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

const getSecret = () => {
  const secret = process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? '';
  if (secret) return secret;
  return 'insecure-development-secret-change-me';
};

export const createSessionToken = (user: StoredUser) => {
  return signJwt<SessionPayload>(
    {
      sub: user.id,
      email: user.email,
    },
    getSecret(),
    {
      expiresInSeconds: SESSION_LIFETIME_SECONDS,
    }
  );
};

export const verifySessionToken = (token: string) => {
  return verifyJwt<SessionPayload>(token, getSecret());
};

export const setSessionCookie = async (token: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_LIFETIME_SECONDS,
    path: '/',
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
};

export const readSessionFromRequest = async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value ?? '';
  if (!token) return null;
  const { valid, payload } = verifySessionToken(token);
  if (!valid || !payload) return null;
  return payload;
};
