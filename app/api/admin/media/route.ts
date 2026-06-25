import { NextResponse } from 'next/server';
import { getAdminMediaFiles } from '@/lib/adminContent';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await getAdminMediaFiles();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), files });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), files: [], message: error instanceof Error ? error.message : 'Не удалось загрузить медиафайлы.' }, { status: 500 });
  }
}
