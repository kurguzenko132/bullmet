import { NextResponse } from 'next/server';
import { getAdminReviews } from '@/lib/adminContent';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getAdminReviews();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), reviews });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), reviews: [], message: error instanceof Error ? error.message : 'Не удалось загрузить отзывы.' }, { status: 500 });
  }
}
