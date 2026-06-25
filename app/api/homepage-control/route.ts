import { NextResponse } from 'next/server';
import { getHomepageControlSettings } from '@/lib/homepageControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getHomepageControlSettings();
  return NextResponse.json({ settings });
}
