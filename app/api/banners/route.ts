import { NextResponse } from 'next/server';
import { getBannerControlSettings } from '@/lib/adminContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getBannerControlSettings();
  return NextResponse.json({ settings });
}
