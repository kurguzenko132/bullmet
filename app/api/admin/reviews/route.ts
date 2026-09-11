import { NextRequest, NextResponse } from 'next/server';
import { getAdminReviews } from '@/lib/adminContent';
import { isSupabaseConfigured, serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getAdminReviews();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), reviews });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), reviews: [], message: error instanceof Error ? error.message : 'Не удалось загрузить отзывы.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Хранилище отзывов пока не подключено.' }, { status: 500 });
  try {
    const body = await request.json();
    const rating = Math.max(1, Math.min(5, Number(body.rating || 5)));
    const source = ['website', 'instagram', 'telegram', 'offline', 'import'].includes(body.source) ? body.source : 'offline';
    const status = ['published', 'pending', 'hidden', 'rejected'].includes(body.status) ? body.status : 'published';
    const insert = { product_slug: String(body.product_slug || 'general-review'), user_name: String(body.user_name || 'Покупатель').trim(), user_email: body.user_email ? String(body.user_email).trim() : null, customer_city: body.customer_city ? String(body.customer_city).trim() : null, customer_phone: body.customer_phone ? String(body.customer_phone).trim() : null, rating, comment: String(body.comment || '').trim(), photo_urls: Array.isArray(body.photo_urls) ? body.photo_urls.map(String).filter(Boolean) : [], status, source, internal_note: body.internal_note ? String(body.internal_note) : null, show_on_homepage: body.show_on_homepage === true };
    const { data, error } = await serverSupabase.from('product_reviews').insert(insert).select('*').single();
    if (error) throw error;
    await serverSupabase.from('admin_activity_log').insert({ action: 'review_create', entity: 'product_reviews', entity_id: data.id, payload: { source, status } }).then(() => null);
    return NextResponse.json({ ok: true, review: data });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось добавить отзыв.' }, { status: 500 }); }
}
