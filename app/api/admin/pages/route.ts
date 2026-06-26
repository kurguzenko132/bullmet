import { NextRequest, NextResponse } from 'next/server';
import { getAdminSitePages, normalizePageSlug, validateSitePageInput } from '@/lib/sitePages';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = await getAdminSitePages();
    return NextResponse.json({ ok: true, configured: Boolean(serverSupabase), pages });
  } catch (error) {
    return NextResponse.json({ ok: false, pages: [], message: error instanceof Error ? error.message : 'Не удалось загрузить страницы.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const body = await request.json();
    const validation = validateSitePageInput(body);
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
      .insert(payload)
      .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
      .single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'site_page_create',
      entity: 'site_pages',
      entity_id: data.id,
      payload: { slug: data.slug, title: data.title, status: data.status }
    }).then(() => null);

    return NextResponse.json({ ok: true, page: data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось создать страницу.' }, { status: 500 });
  }
}
