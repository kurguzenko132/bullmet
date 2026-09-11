import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.status === 'string' && ['pending', 'published', 'hidden', 'rejected'].includes(body.status)) {
      update.status = body.status;
    }

    if (typeof body.comment === 'string') {
      update.comment = body.comment.trim();
    }
    for (const key of ['user_name', 'user_email', 'customer_city', 'customer_phone', 'product_slug', 'admin_reply', 'internal_note', 'rejection_reason'] as const) if (typeof body[key] === 'string') update[key] = body[key].trim();
    if (Array.isArray(body.photo_urls)) update.photo_urls = body.photo_urls.map(String).filter(Boolean);
    if (typeof body.show_on_homepage === 'boolean') update.show_on_homepage = body.show_on_homepage;
    if (typeof body.rating === 'number') update.rating = Math.max(1, Math.min(5, Math.round(body.rating)));
    if (typeof body.admin_reply === 'string') update.admin_reply_at = new Date().toISOString();

    if (!Object.keys(update).length) {
      return NextResponse.json({ ok: false, message: 'Нет данных для обновления.' }, { status: 400 });
    }

    const { error } = await serverSupabase.from('product_reviews').update(update).eq('id', params.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: body.action || (body.status === 'published' ? 'review_publish' : body.status === 'hidden' ? 'review_hide' : body.status === 'rejected' ? 'review_reject' : body.admin_reply !== undefined ? 'review_reply' : 'review_update'),
      entity: 'product_reviews',
      entity_id: params.id,
      payload: { patch: update }
    }).then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить отзыв.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const { error } = await serverSupabase.from('product_reviews').delete().eq('id', params.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'review_delete',
      entity: 'product_reviews',
      entity_id: params.id,
      payload: {}
    }).then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось удалить отзыв.' }, { status: 500 });
  }
}
