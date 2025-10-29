import crypto from 'node:crypto';
import { sendMagicLinkEmail } from './email';
import {
  appendMagicLink,
  consumeMagicLink,
  purgeExpiredMagicLinks,
  upsertUserByEmail,
} from './storage';
import type { MagicLinkPurpose } from './types';

const MAGIC_LINK_TTL_MS = 30 * 60 * 1000; // 30 minutes

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export interface MagicLinkRequestOptions {
  email: string;
  origin: string;
  purpose?: MagicLinkPurpose;
  redirectTo?: string;
  metadata?: {
    ip?: string | null;
    userAgent?: string | null;
  };
}

export interface MagicLinkRequestResult {
  email: string;
  expiresAt: string;
  verificationUrl: string;
  debugToken?: string;
}

export const createMagicLinkRequest = async (
  options: MagicLinkRequestOptions
): Promise<MagicLinkRequestResult> => {
  const { email, origin } = options;

  if (!email) {
    throw new Error('Email is required');
  }

  await purgeExpiredMagicLinks();
  const user = await upsertUserByEmail(email);

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAGIC_LINK_TTL_MS);

  const verificationUrl = new URL('/auth/magic-link/verify', origin);
  verificationUrl.searchParams.set('token', token);

  await appendMagicLink({
    tokenHash,
    email: user.email,
    redirectTo: options.redirectTo ?? '/user',
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    purpose: options.purpose ?? 'login',
    metadata: {
      previewUrl: verificationUrl.toString(),
      requestIp: options.metadata?.ip ?? null,
      userAgent: options.metadata?.userAgent ?? null,
    },
  });

  try {
    await sendMagicLinkEmail({
      email: user.email,
      magicLinkUrl: verificationUrl.toString(),
      expiresAt,
      purpose: options.purpose ?? 'login',
    });
  } catch (error) {
    console.error('Failed to deliver magic link email', error);
  }

  return {
    email: user.email,
    expiresAt: expiresAt.toISOString(),
    verificationUrl: verificationUrl.toString(),
    debugToken: process.env.NODE_ENV === 'development' ? token : undefined,
  };
};

type VerifyMagicLinkError =
  | { ok: false; reason: 'invalid_token' }
  | { ok: false; reason: 'expired' }
  | { ok: false; reason: 'already_used' };

type VerifyMagicLinkSuccess = {
  ok: true;
  user: Awaited<ReturnType<typeof upsertUserByEmail>>;
  redirectTo: string;
  purpose: MagicLinkPurpose;
};
export type VerifyMagicLinkResult =
  | VerifyMagicLinkError
  | VerifyMagicLinkSuccess;

export const verifyMagicLinkToken = async (
  token: string
): Promise<VerifyMagicLinkResult> => {
  const tokenHash = hashToken(token);
  const { link, user } = await consumeMagicLink(tokenHash);

  if (!link || !user) {
    return {
      ok: false,
      reason: 'invalid_token' as const,
    };
  }

  const expiresAt = new Date(link.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return {
      ok: false,
      reason: 'expired' as const,
    };
  }

  if (
    link.consumedAt &&
    new Date(link.consumedAt).getTime() + 1000 < Date.now()
  ) {
    return {
      ok: false,
      reason: 'already_used' as const,
    };
  }

  return {
    ok: true,
    user,
    redirectTo: link.redirectTo,
    purpose: link.purpose,
  };
};
