import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function matchesWebhookSecret(authorization: string | null, expected: string) {
  const received = authorization?.replace(/^Bearer\s+/i, '') || '';
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, message: 'Sanity webhook is not configured.' }, { status: 503 });
  }
  if (!matchesWebhookSecret(request.headers.get('authorization'), secret)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  revalidateTag('sanity');
  return NextResponse.json({ ok: true, revalidated: ['sanity'] });
}
