import { NextResponse } from 'next/server';
import { getAdminProfiles } from '@/lib/adminPeople';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAdminProfiles();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), users });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), users: [], message: error instanceof Error ? error.message : 'Не удалось загрузить пользователей.' }, { status: 500 });
  }
}
