import { NextResponse } from 'next/server';
import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { getSanityPreviewClient } from '@/lib/sanityPreview.server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const client = getSanityPreviewClient();
  if (!client) {
    return NextResponse.json({ ok: false, message: 'Preview is not configured.' }, { status: 503 });
  }

  // defineEnableDraftMode validates Sanity's cryptographic preview secret
  // before it creates the Next.js Draft Mode cookie.
  return defineEnableDraftMode({ client }).GET(request);
}
