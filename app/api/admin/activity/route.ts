import { NextResponse } from 'next/server';
import { getAdminActivityLog } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activity = await getAdminActivityLog();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), activity });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), activity: [], message: error instanceof Error ? error.message : 'Не удалось загрузить журнал действий.' }, { status: 500 });
  }
}
