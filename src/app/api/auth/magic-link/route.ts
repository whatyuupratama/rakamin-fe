import { NextRequest } from 'next/server';
import { createMagicLinkRequest } from '@/lib/auth/magic-link';
import type { MagicLinkPurpose } from '@/lib/auth/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildOrigin = (req: NextRequest) => {
  const headerOrigin = req.headers.get('origin');
  if (headerOrigin) return headerOrigin;
  return req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const redirectTo = typeof body?.redirectTo === 'string' ? body.redirectTo : '/user';
  const purpose = (body?.purpose === 'register' ? 'register' : 'login') as MagicLinkPurpose;

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json(
      {
        ok: false,
        error: 'INVALID_EMAIL',
        message: 'Alamat email tidak valid',
      },
      { status: 400 }
    );
  }

  const origin = buildOrigin(req);

  try {
    const result = await createMagicLinkRequest({
      email,
      origin,
      redirectTo,
      purpose,
      metadata: {
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        userAgent: req.headers.get('user-agent'),
      },
    });

    return Response.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
      verificationUrl:
        process.env.NODE_ENV !== 'production' ? result.verificationUrl : undefined,
      debugToken: result.debugToken,
    });
  } catch (error) {
    console.error('Failed to create magic link', error);
    return Response.json(
      {
        ok: false,
        error: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat membuat magic link',
      },
      { status: 500 }
    );
  }
}
