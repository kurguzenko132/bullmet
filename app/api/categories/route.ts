import { NextResponse } from 'next/server';
import { getCatalogControlSettings } from '@/lib/catalogControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getCatalogControlSettings();
  return NextResponse.json({ settings });
}
