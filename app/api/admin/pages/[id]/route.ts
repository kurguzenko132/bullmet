import { NextRequest, NextResponse } from 'next/server';
import { normalizePageSlug, validateSitePageInput } from '@/lib/sitePages';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const body = await request.json();
    const next = {
      slug: body.slug,
      title: body.title,
      status: body.status || 'draft',
      sections: body.sections || []
    };
    const validation = validateSitePageInput(next);
    if (validation) return NextResponse.json({ ok: false, message: validation }, { status: 400 });

    const payload = {
      slug: normalizePageSlug(body.slug),
      title: String(body.title || '').trim(),
      status: body.status || 'draft',
      excerpt: String(body.excerpt || '').trim(),
      seo_title: String(body.seo_title || '').trim(),
      seo_description: String(body.seo_description || '').trim(),
      og_image: String(body.og_image || '').trim(),
      sections: Array.isArray(body.sections) ? body.sections : [],
      sort_order: Number(body.sort_order || 100)
    };

    const { data, error } = await serverSupabase
      .from('site_pages')
      .update(payload)
      .eq('id', params.id)
      .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
      .single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'site_page_update',
      entity: 'site_pages',
      entity_id: params.id,
      payload: { slug: payload.slug, title: payload.title, status: payload.status }
    }).then(() => null);

    return NextResponse.json({ ok: true, page: data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить страницу.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const { error } = await serverSupabase.from('site_pages').delete().eq('id', params.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'site_page_delete',
      entity: 'site_pages',
      entity_id: params.id,
      payload: {}
    }).then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось удалить страницу.' }, { status: 500 });
  }
}
