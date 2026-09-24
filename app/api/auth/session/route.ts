import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, serverSessionCookie } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = typeof body?.accessToken === 'string' ? body.accessToken : '';
  if (!accessToken) return NextResponse.json({ ok: false, message: 'Не передана сессия.' }, { status: 400 });

  const authenticatedRequest = new Request(request.url, { headers: { authorization: `Bearer ${accessToken}` } });
  const user = await getAuthenticatedUser(authenticatedRequest);
  if (!user) return NextResponse.json({ ok: false, message: 'Недействительная сессия.' }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(serverSessionCookie, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(serverSessionCookie, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
