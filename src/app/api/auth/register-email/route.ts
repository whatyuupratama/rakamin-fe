import { NextRequest, NextResponse } from 'next/server';
import { upsertUserByEmail } from '@/lib/auth/storage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Alamat email tidak valid',
      },
      { status: 400 }
    );
  }

  const user = await upsertUserByEmail(email);

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
}
