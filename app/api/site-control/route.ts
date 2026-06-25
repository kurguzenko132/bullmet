import { NextResponse } from 'next/server';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSiteControlSettings();
  return NextResponse.json({ settings });
}
