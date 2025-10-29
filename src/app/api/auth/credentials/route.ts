import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { recordUserLogin, upsertUserByEmail } from '@/lib/auth/storage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRedirect = (value: string | undefined) => {
  if (!value) return '/user';
  return value.startsWith('/') ? value : '/user';
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const emailRaw = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const redirectTo = normalizeRedirect(
    typeof body?.redirectTo === 'string' ? body.redirectTo : undefined
  );

  const email = emailRaw.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Alamat email tidak valid.',
      },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Password wajib diisi.',
      },
      { status: 400 }
    );
  }

  try {
    const user = await upsertUserByEmail(email);
    const hydratedUser = (await recordUserLogin(email)) ?? user;
    const sessionToken = createSessionToken(hydratedUser);
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      ok: true,
      email: hydratedUser.email,
      redirectTo,
    });
  } catch (error) {
    console.error('Failed to create credential session', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Tidak bisa membuat sesi login saat ini.',
      },
      { status: 500 }
    );
  }
}
