import { NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';

export async function GET() {
  const session = readSessionFromRequest();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, session });
}
