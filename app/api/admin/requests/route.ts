import { NextResponse } from 'next/server';
import { getAdminRequests } from '@/lib/adminCommerce';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const requests = await getAdminRequests();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), requests });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), requests: [], message: error instanceof Error ? error.message : 'Не удалось загрузить заявки.' }, { status: 500 });
  }
}
