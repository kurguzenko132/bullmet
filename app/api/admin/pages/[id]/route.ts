import { NextRequest, NextResponse } from 'next/server';
import { normalizePageSlug, normalizeSitePage, preserveSitePageSlugRedirect, syncSitePageNavigation, validateSitePageInput } from '@/lib/sitePages';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

    const { data: previous, error: previousError } = await serverSupabase
      .from('site_pages')
      .select('slug, updated_at')
      .eq('id', id)
      .maybeSingle();
    if (previousError) return NextResponse.json({ ok: false, message: previousError.message }, { status: 500 });
    if (!previous) return NextResponse.json({ ok: false, message: 'Страница не найдена.' }, { status: 404 });

    const { data: existingPage, error: existingPageError } = await serverSupabase
      .from('site_pages')
      .select('id')
      .eq('slug', payload.slug)
      .neq('id', id)
      .maybeSingle();
    if (existingPageError) return NextResponse.json({ ok: false, message: existingPageError.message }, { status: 500 });
    if (existingPage) return NextResponse.json({ ok: false, message: 'Страница с таким slug уже существует.' }, { status: 409 });

    const expectedUpdatedAt = typeof body.updated_at === 'string' && body.updated_at ? body.updated_at : previous.updated_at;
    let updateQuery = serverSupabase
      .from('site_pages')
      .update(payload)
      .eq('id', id);
    if (expectedUpdatedAt) updateQuery = updateQuery.eq('updated_at', expectedUpdatedAt);

    const { data, error } = await updateQuery
      .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ ok: false, message: 'Страница уже изменена в другой вкладке или другим сотрудником. Обновите список и повторите изменения.' }, { status: 409 });

    const page = normalizeSitePage(data);
    const navigationWarning = await syncSitePageNavigation(page, body.menu, previous.slug);
    const redirectWarning = previous.slug !== page.slug
      ? await preserveSitePageSlugRedirect(previous.slug, page.slug)
      : null;

    await serverSupabase.from('admin_activity_log').insert({
      action: 'site_page_update',
      entity: 'site_pages',
      entity_id: id,
      payload: { slug: payload.slug, title: payload.title, status: payload.status }
    }).then(() => null);

    return NextResponse.json({
      ok: true,
      page: { ...page, menu: body.menu || page.menu },
      warning: [
        navigationWarning ? `Страница сохранена, но ссылка в навигации не синхронизирована: ${navigationWarning}` : '',
        redirectWarning ? `Страница сохранена, но старый адрес не перенаправлен: ${redirectWarning}` : ''
      ].filter(Boolean).join(' ') || undefined
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить страницу.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const { data: previous } = await serverSupabase
      .from('site_pages')
      .select('id, slug, title, status, excerpt, seo_title, seo_description, og_image, sections, sort_order, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    const { error } = await serverSupabase.from('site_pages').delete().eq('id', id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    if (previous) {
      const page = normalizeSitePage(previous);
      await syncSitePageNavigation(page, { label: page.title, header: false, mobile: false, footer: false, order: Number(page.sort_order || 100) }, page.slug);
    }

    await serverSupabase.from('admin_activity_log').insert({
      action: 'site_page_delete',
      entity: 'site_pages',
      entity_id: id,
      payload: {}
    }).then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось удалить страницу.' }, { status: 500 });
  }
}
