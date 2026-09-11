'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, Clock3, Copy, Eye, EyeOff, ExternalLink, FileText, Filter, Grid2X2, List, MoreHorizontal, Pencil, Plus, Save, Search, Settings2, Trash2 } from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import type { SitePage, SitePageInput, SitePageSection, SitePageSectionType, SitePageStatus } from '@/lib/sitePages';
import { formatDate } from '@/lib/adminCommerce';

type Filter = 'all' | SitePageStatus;
type PageView = 'list' | 'grid';
type PageKind = 'all' | 'standard' | 'system' | 'legal' | 'service';

const sectionTypes: Array<{ value: SitePageSectionType; label: string }> = [
  { value: 'hero', label: 'Hero / первый экран' },
  { value: 'text', label: 'Текстовый блок' },
  { value: 'image_text', label: 'Изображение + текст' },
  { value: 'cards', label: 'Карточки' },
  { value: 'faq', label: 'FAQ' },
  { value: 'cta', label: 'Призыв к действию' }
];

function statusLabel(status?: string) {
  if (status === 'published') return 'Опубликована';
  if (status === 'hidden') return 'В архиве';
  return 'Черновик';
}

function statusClass(status?: string) {
  if (status === 'published') return 'is-published';
  if (status === 'hidden') return 'is-archived';
  return 'is-draft';
}

function getPageType(page: SitePage): Exclude<PageKind, 'all'> {
  const value = `${page.slug} ${page.title}`.toLowerCase();
  if (/(privacy|offer|policy|terms|конфиден|оферт|политик)/.test(value)) return 'legal';
  if (/(contacts|contact|контакт)/.test(value)) return 'system';
  if (/(production|services|service|delivery|производ|услуг|достав)/.test(value)) return 'service';
  return 'standard';
}

function pageTypeLabel(type: Exclude<PageKind, 'all'>) {
  return ({ standard: 'Обычная', system: 'Системная', legal: 'Юридическая', service: 'Сервисная' })[type];
}

function pageImage(page: SitePage) {
  return page.og_image || page.sections.find((section) => section.image)?.image || '';
}

function PreviewLines({ value }: { value?: string }) {
  return <>{String(value || '').split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</>;
}

function PageSectionPreview({ section }: { section: SitePageSection }) {
  if (section.type === 'hero') {
    return (
      <section className="site-page-hero">
        {section.image && <img src={section.image} alt="" />}
        <div>
          {section.subtitle && <p>{section.subtitle}</p>}
          <h1>{section.title}</h1>
          {section.text && <span><PreviewLines value={section.text} /></span>}
          {section.buttonLabel && section.buttonHref && <a href={section.buttonHref}>{section.buttonLabel}</a>}
        </div>
      </section>
    );
  }

  if (section.type === 'image_text') {
    return (
      <section className="site-page-image-text">
        <div>
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span><PreviewLines value={section.text} /></span>}
          {section.buttonLabel && section.buttonHref && <a href={section.buttonHref}>{section.buttonLabel}</a>}
        </div>
        {section.image && <img src={section.image} alt="" />}
      </section>
    );
  }

  if (section.type === 'cards') {
    return (
      <section className="site-page-cards">
        <div className="site-page-section-head">
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span>{section.text}</span>}
        </div>
        <div>
          {(section.items || []).map((item, index) => (
            <article key={`${item.title}-${index}`}>
              {item.image && <img src={item.image} alt="" />}
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'faq') {
    return (
      <section className="site-page-faq">
        <div className="site-page-section-head">
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span>{section.text}</span>}
        </div>
        <div>
          {(section.items || []).map((item, index) => (
            <details key={`${item.title}-${index}`} open={index === 0}>
              <summary>{item.title}</summary>
              <p>{item.text}</p>
            </details>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'cta') {
    return (
      <section className="site-page-cta">
        {section.subtitle && <p>{section.subtitle}</p>}
        <h2>{section.title}</h2>
        {section.text && <span><PreviewLines value={section.text} /></span>}
        {section.buttonLabel && section.buttonHref && <a href={section.buttonHref}>{section.buttonLabel}</a>}
      </section>
    );
  }

  return (
    <section className="site-page-text">
      {section.subtitle && <p>{section.subtitle}</p>}
      <h2>{section.title}</h2>
      {section.text && <span><PreviewLines value={section.text} /></span>}
    </section>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9а-яё\-_]+/gi, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function emptySection(type: SitePageSectionType = 'text'): SitePageSection {
  const id = `section-${Date.now()}`;
  if (type === 'hero') {
    return {
      id,
      type,
      subtitle: 'Bullmet',
      title: 'Новая страница',
      text: 'Короткое описание страницы.',
      image: '/assets/hero-machine.jpg',
      buttonLabel: 'Перейти в каталог',
      buttonHref: '/catalog'
    };
  }

  if (type === 'cards') {
    return {
      id,
      type,
      subtitle: 'Преимущества',
      title: 'Что важно знать',
      text: 'Добавьте несколько карточек.',
      items: [
        { title: 'Первый пункт', text: 'Описание первого пункта.' },
        { title: 'Второй пункт', text: 'Описание второго пункта.' }
      ]
    };
  }

  if (type === 'faq') {
    return {
      id,
      type,
      subtitle: 'FAQ',
      title: 'Вопросы и ответы',
      items: [
        { title: 'Первый вопрос', text: 'Ответ на вопрос.' }
      ]
    };
  }

  if (type === 'cta') {
    return {
      id,
      type,
      subtitle: 'Нужна консультация?',
      title: 'Свяжитесь с Bullmet',
      text: 'Поможем выбрать модель или рассчитать индивидуальный заказ.',
      buttonLabel: 'Контакты',
      buttonHref: '/contacts'
    };
  }

  if (type === 'image_text') {
    return {
      id,
      type,
      subtitle: 'О блоке',
      title: 'Заголовок блока',
      text: 'Текст рядом с изображением.',
      image: '/assets/cat-custom.jpg',
      buttonLabel: '',
      buttonHref: ''
    };
  }

  return {
    id,
    type,
    subtitle: '',
    title: 'Текстовый блок',
    text: 'Введите текст страницы.'
  };
}

function emptyMenu(label = 'Новая страница') {
  return {
    label,
    header: false,
    mobile: false,
    footer: false,
    order: 100
  };
}

function emptyPage(): SitePageInput & { id?: string; created_at?: string; updated_at?: string } {
  return {
    slug: `new-page-${Date.now()}`,
    title: 'Новая страница',
    status: 'draft',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    og_image: '',
    sections: [emptySection('hero'), emptySection('text')],
    menu: emptyMenu(),
    sort_order: 100
  };
}

function pageToForm(page: SitePage): SitePageInput & { id?: string; created_at?: string; updated_at?: string } {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: ['published', 'draft', 'hidden'].includes(String(page.status)) ? page.status as SitePageStatus : 'draft',
    excerpt: page.excerpt || '',
    seo_title: page.seo_title || '',
    seo_description: page.seo_description || '',
    og_image: page.og_image || '',
    sections: page.sections?.length ? page.sections : [emptySection('text')],
    menu: page.menu || emptyMenu(page.title),
    sort_order: Number(page.sort_order || 100),
    created_at: page.created_at,
    updated_at: page.updated_at
  };
}

export function AdminPagesClient({ initialPages, supabaseConfigured }: { initialPages: SitePage[]; supabaseConfigured: boolean }) {
  const [pages, setPages] = useState(initialPages);
  const [form, setForm] = useState(() => initialPages[0] ? pageToForm(initialPages[0]) : emptyPage());
  const [filter, setFilter] = useState<Filter>('all');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [pageKind, setPageKind] = useState<PageKind>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<PageView>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(form.sections[0]?.id || '');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput), 320);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    const saved = window.localStorage.getItem('bullmet-admin-pages-view');
    if (saved === 'grid' || saved === 'list') setView(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('bullmet-admin-pages-view', view);
  }, [view]);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return pages.filter((page) => {
      const byStatus = filter === 'all' || page.status === filter;
      const haystack = [page.title, page.slug, page.excerpt, page.status].filter(Boolean).join(' ').toLowerCase();
      const byKind = pageKind === 'all' || getPageType(page) === pageKind;
      const updated = new Date(page.updated_at || page.created_at || 0).getTime();
      const age = Date.now() - updated;
      const byDate = dateFilter === 'all' || (dateFilter === 'week' && age <= 7 * 86400000) || (dateFilter === 'month' && age <= 31 * 86400000);
      return byStatus && byKind && byDate && (!clean || haystack.includes(clean));
    });
  }, [pages, query, filter, pageKind, dateFilter]);

  const activeSection = form.sections.find((section) => section.id === activeSectionId) || form.sections[0];
  const published = pages.filter((page) => page.status === 'published').length;
  const drafts = pages.filter((page) => page.status === 'draft').length;
  const hidden = pages.filter((page) => page.status === 'hidden').length;

  function updateForm(patch: Partial<typeof form>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function updateMenu(patch: Partial<NonNullable<typeof form.menu>>) {
    setForm((current) => ({ ...current, menu: { ...emptyMenu(current.title), ...(current.menu || {}), ...patch } }));
  }

  function selectPage(page: SitePage) {
    const next = pageToForm(page);
    setForm(next);
    setActiveSectionId(next.sections[0]?.id || '');
    setEditorOpen(false);
    setMessage('');
  }

  function newPage() {
    const next = emptyPage();
    setForm(next);
    setActiveSectionId(next.sections[0]?.id || '');
    setEditorOpen(true);
    setMessage('Создан новый черновик. Заполните данные и нажмите “Сохранить”.');
  }

  function duplicatePage() {
    const next = {
      ...form,
      id: undefined,
      title: `${form.title} — копия`,
      slug: `${form.slug}-copy-${Date.now()}`,
      status: 'draft' as SitePageStatus
    };
    setForm(next);
    setActiveSectionId(next.sections[0]?.id || '');
    setEditorOpen(true);
    setMessage('Создана копия как черновик. Нажмите “Сохранить”.');
  }

  function updateSection(id: string, patch: Partial<SitePageSection>) {
    updateForm({
      sections: form.sections.map((section) => section.id === id ? { ...section, ...patch } : section)
    });
  }

  function addSection(type: SitePageSectionType) {
    const section = emptySection(type);
    updateForm({ sections: [...form.sections, section] });
    setActiveSectionId(section.id);
  }

  function removeSection(id: string) {
    if (form.sections.length <= 1) {
      setMessage('На странице должен остаться хотя бы один блок.');
      return;
    }
    const next = form.sections.filter((section) => section.id !== id);
    updateForm({ sections: next });
    setActiveSectionId(next[0]?.id || '');
  }

  function moveSection(id: string, direction: -1 | 1) {
    const index = form.sections.findIndex((section) => section.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= form.sections.length) return;
    const next = [...form.sections];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    updateForm({ sections: next });
  }

  function updateSectionItem(sectionId: string, index: number, patch: Record<string, string>) {
    const section = form.sections.find((item) => item.id === sectionId);
    if (!section) return;
    const items = [...(section.items || [])];
    items[index] = { ...items[index], ...patch };
    updateSection(sectionId, { items });
  }

  function addSectionItem(sectionId: string) {
    const section = form.sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { items: [...(section.items || []), { title: 'Новый пункт', text: '' }] });
  }

  function removeSectionItem(sectionId: string, index: number) {
    const section = form.sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { items: (section.items || []).filter((_, itemIndex) => itemIndex !== index) });
  }

  async function refreshPages() {
    setMessage('');
    try {
      const response = await fetch('/api/admin/pages', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить страницы.');
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setMessage('Список страниц обновлён.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить страницы.');
    }
  }

  async function savePage() {
    setSaving(true);
    setMessage('');

    const payload = {
      ...form,
      slug: slugify(form.slug),
      sort_order: Number(form.sort_order || 100)
    };

    try {
      const response = await fetch(form.id ? `/api/admin/pages/${encodeURIComponent(form.id)}` : '/api/admin/pages', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось сохранить страницу.');

      await refreshPages();
      if (data.page) {
        const next = pageToForm(data.page);
        setForm(next);
        setActiveSectionId(next.sections[0]?.id || activeSectionId);
      }
      setMessage('Страница сохранена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить страницу.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!form.id) {
      newPage();
      return;
    }
    if (!confirm('Удалить страницу полностью?')) return;

    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось удалить страницу.');
      await refreshPages();
      newPage();
      setMessage('Страница удалена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось удалить страницу.');
    }
  }

  async function updateStatus(page: SitePage, status: SitePageStatus) {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(page.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pageToForm(page), status })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось изменить статус страницы.');
      const nextPage = data.page as SitePage;
      setPages((current) => current.map((item) => item.id === page.id ? nextPage : item));
      if (form.id === page.id) setForm(pageToForm(nextPage));
      setMessage(status === 'published' ? 'Страница опубликована.' : status === 'hidden' ? 'Страница перемещена в архив.' : 'Страница сохранена как черновик.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось изменить статус страницы.');
    } finally {
      setSaving(false);
    }
  }

  async function bulkUpdate(status: SitePageStatus | 'delete') {
    if (!selectedIds.length) return;
    const targets = pages.filter((page) => selectedIds.includes(page.id));
    if (status === 'delete' && !confirm(`Удалить страниц: ${targets.length}? Восстановить их будет нельзя.`)) return;
    setSaving(true);
    try {
      await Promise.all(targets.map(async (page) => {
        const url = `/api/admin/pages/${encodeURIComponent(page.id)}`;
        const response = await fetch(url, status === 'delete' ? { method: 'DELETE' } : {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pageToForm(page), status })
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || 'Операция не выполнена.');
      }));
      await refreshPages();
      setSelectedIds([]);
      setMessage(status === 'delete' ? 'Выбранные страницы удалены.' : 'Статус выбранных страниц обновлён.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обработать выбранные страницы.');
    } finally {
      setSaving(false);
    }
  }

  const selectedPage = pages.find((page) => page.id === form.id) || pages[0];
  const allSelected = filtered.length > 0 && filtered.every((page) => selectedIds.includes(page.id));

  function toggleSelection(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAllSelection() {
    setSelectedIds(allSelected ? current => current.filter((id) => !filtered.some((page) => page.id === id)) : current => [...new Set([...current, ...filtered.map((page) => page.id)])]);
  }

  if (editorOpen) return (
    <div className="admin-pages-cms">
      <div className="admin-page-head">
        <div>
          <p>Супер-админка / CMS</p>
          <h1>Страницы сайта</h1>
          <span>Создавайте новые страницы, управляйте SEO и собирайте контент из готовых блоков.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={() => { setEditorOpen(false); setMessage(''); }}>К списку страниц</button>
          <button type="button" onClick={newPage}><Plus size={17} /> Новая страница</button>
          <button type="button" onClick={duplicatePage}><Copy size={17} /> Дублировать</button>
          <button type="button" onClick={savePage} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: страницы не сохранятся в базу.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-pages-stats">
        <article><FileText size={22} /><div><b>{pages.length}</b><span>всего страниц</span></div></article>
        <article><Eye size={22} /><div><b>{published}</b><span>опубликовано</span></div></article>
        <article><FileText size={22} /><div><b>{drafts}</b><span>черновиков</span></div></article>
        <article><EyeOff size={22} /><div><b>{hidden}</b><span>скрыто</span></div></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по странице, slug, статусу или описанию" />
        <div>
          {(['all', 'published', 'draft', 'hidden'] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : statusLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-pages-cms-layout">
        <aside className="admin-pages-list">
          {filtered.map((page) => (
            <button key={page.id} type="button" className={form.id === page.id ? 'is-active' : ''} onClick={() => selectPage(page)}>
              <div>
                <b>{page.title}</b>
                <em className={statusClass(page.status)}>{statusLabel(page.status)}</em>
              </div>
              <span>/{page.slug}</span>
              <small>{formatDate(page.updated_at || page.created_at)}</small>
            </button>
          ))}
        </aside>

        <article className="admin-page-builder">
          <div className="admin-page-builder-top">
            <div>
              <p>{form.id ? 'Редактирование страницы' : 'Новая страница'}</p>
              <h2>{form.title || 'Без названия'}</h2>
              <span>/{slugify(form.slug || '')}</span>
            </div>
            <div>
              <button type="button" onClick={() => setPreviewOpen(true)}>Предпросмотр</button>
              {form.status === 'published' && <Link href={`/${slugify(form.slug)}`} target="_blank">Открыть ↗</Link>}
              <button type="button" onClick={() => updateForm({ status: form.status === 'published' ? 'hidden' : 'published' })}>
                {form.status === 'published' ? 'Скрыть' : 'Опубликовать'}
              </button>
              <button type="button" onClick={deletePage}><Trash2 size={16} />Удалить</button>
            </div>
          </div>

          <div className="admin-page-settings-grid">
            <label>Название страницы
              <input value={form.title} onChange={(event) => updateForm({ title: event.target.value })} />
            </label>
            <label>Slug
              <input value={form.slug} onChange={(event) => updateForm({ slug: slugify(event.target.value) })} />
            </label>
            <label>Статус
              <select value={form.status} onChange={(event) => updateForm({ status: event.target.value as SitePageStatus })}>
                <option value="draft">Черновик</option>
                <option value="published">Опубликована</option>
                <option value="hidden">Скрыта</option>
              </select>
            </label>
            <label>Порядок
              <input type="number" value={form.sort_order} onChange={(event) => updateForm({ sort_order: Number(event.target.value) || 100 })} />
            </label>
            <div className="admin-page-menu-card span-2">
              <div>
                <b>Добавить страницу в меню</b>
                <span>{form.status === 'published' ? 'Опубликованная страница появится в выбранных местах.' : 'Сначала сохраните страницу как опубликованную.'}</span>
              </div>
              <label>Подпись в меню
                <input value={form.menu?.label || form.title} onChange={(event) => updateMenu({ label: event.target.value })} />
              </label>
              <label>Порядок
                <input type="number" value={form.menu?.order || form.sort_order || 100} onChange={(event) => updateMenu({ order: Number(event.target.value) || 100 })} />
              </label>
              <div className="admin-page-menu-toggles">
                <label><input type="checkbox" checked={Boolean(form.menu?.header)} onChange={(event) => updateMenu({ header: event.target.checked })} /> Шапка</label>
                <label><input type="checkbox" checked={Boolean(form.menu?.mobile)} onChange={(event) => updateMenu({ mobile: event.target.checked })} /> Мобильное меню</label>
                <label><input type="checkbox" checked={Boolean(form.menu?.footer)} onChange={(event) => updateMenu({ footer: event.target.checked })} /> Футер</label>
              </div>
            </div>
            <label className="span-2">Краткое описание
              <textarea rows={3} value={form.excerpt || ''} onChange={(event) => updateForm({ excerpt: event.target.value })} />
            </label>
            <label>SEO title
              <input value={form.seo_title || ''} onChange={(event) => updateForm({ seo_title: event.target.value })} />
            </label>
            <div>
              <AdminImagePicker label="SEO-изображение" value={form.og_image || ''} onChange={(value) => updateForm({ og_image: value })} />
            </div>
            <label className="span-2">SEO description
              <textarea rows={3} value={form.seo_description || ''} onChange={(event) => updateForm({ seo_description: event.target.value })} />
            </label>
          </div>

          <section className="admin-page-sections-area">
            <div className="admin-section-inline-head">
              <div>
                <p>Конструктор блоков</p>
                <h2>Блоки страницы</h2>
              </div>
              <div className="admin-page-add-section">
                {sectionTypes.map((type) => <button key={type.value} type="button" onClick={() => addSection(type.value)}>{type.label}</button>)}
              </div>
            </div>

            <div className="admin-page-sections-layout">
              <div className="admin-page-sections-list">
                {form.sections.map((section, index) => (
                  <button key={section.id} type="button" className={activeSection?.id === section.id ? 'is-active' : ''} onClick={() => setActiveSectionId(section.id)}>
                    <b>{index + 1}. {section.title || sectionTypes.find((item) => item.value === section.type)?.label}</b>
                    <span>{section.type}</span>
                  </button>
                ))}
              </div>

              {activeSection && (
                <div className="admin-section-editor">
                  <div className="admin-section-editor-head">
                    <select value={activeSection.type} onChange={(event) => updateSection(activeSection.id, { type: event.target.value as SitePageSectionType })}>
                      {sectionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <button type="button" onClick={() => moveSection(activeSection.id, -1)}>↑</button>
                    <button type="button" onClick={() => moveSection(activeSection.id, 1)}>↓</button>
                    <button type="button" onClick={() => removeSection(activeSection.id)}>Удалить</button>
                  </div>

                  <div className="admin-section-form-grid">
                    <label>Малый заголовок
                      <input value={activeSection.subtitle || ''} onChange={(event) => updateSection(activeSection.id, { subtitle: event.target.value })} />
                    </label>
                    <label>Заголовок
                      <input value={activeSection.title || ''} onChange={(event) => updateSection(activeSection.id, { title: event.target.value })} />
                    </label>
                    <label className="span-2">Текст
                      <textarea rows={5} value={activeSection.text || ''} onChange={(event) => updateSection(activeSection.id, { text: event.target.value })} />
                    </label>
                    <AdminImagePicker label="Изображение блока" value={activeSection.image || ''} onChange={(value) => updateSection(activeSection.id, { image: value })} />
                    <label>Кнопка
                      <input value={activeSection.buttonLabel || ''} onChange={(event) => updateSection(activeSection.id, { buttonLabel: event.target.value })} />
                    </label>
                    <label>Ссылка кнопки
                      <input value={activeSection.buttonHref || ''} onChange={(event) => updateSection(activeSection.id, { buttonHref: event.target.value })} />
                    </label>
                  </div>

                  {['cards', 'faq'].includes(activeSection.type) && (
                    <div className="admin-section-items-editor">
                      <div>
                        <h3>Пункты блока</h3>
                        <button type="button" onClick={() => addSectionItem(activeSection.id)}>Добавить пункт</button>
                      </div>
                      {(activeSection.items || []).map((item, index) => (
                        <article key={`${activeSection.id}-${index}`}>
                          <label>Заголовок<input value={item.title || ''} onChange={(event) => updateSectionItem(activeSection.id, index, { title: event.target.value })} /></label>
                          <label>Текст<textarea rows={3} value={item.text || ''} onChange={(event) => updateSectionItem(activeSection.id, index, { text: event.target.value })} /></label>
                          <AdminImagePicker label="Изображение пункта" value={item.image || ''} onChange={(value) => updateSectionItem(activeSection.id, index, { image: value })} />
                          <label>Ссылка<input value={item.href || ''} onChange={(event) => updateSectionItem(activeSection.id, index, { href: event.target.value })} /></label>
                          <button type="button" onClick={() => removeSectionItem(activeSection.id, index)}>Удалить пункт</button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </article>
      </section>

      {previewOpen && (
        <div className="admin-page-preview-modal" role="dialog" aria-modal="true">
          <button type="button" className="admin-page-preview-backdrop" aria-label="Закрыть предпросмотр" onClick={() => setPreviewOpen(false)} />
          <section className="admin-page-preview-dialog">
            <div className="admin-page-preview-head">
              <div>
                <p>Предпросмотр</p>
                <h2>{form.title || 'Без названия'}</h2>
                <span>/{slugify(form.slug || '')}</span>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)}>Закрыть</button>
            </div>
            <main className="site-page-builder admin-page-preview-surface">
              {(form.sections?.length ? form.sections : [emptySection('text')]).map((section) => (
                <PageSectionPreview key={section.id} section={section} />
              ))}
            </main>
          </section>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-pages-v2">
      <header className="admin-pages-v2-header">
        <div>
          <h1>Страницы</h1>
          <p>Управление статическими страницами сайта. Создавайте, редактируйте и публикуйте контент.</p>
        </div>
        <button type="button" className="admin-pages-v2-primary" onClick={newPage}><Plus size={18} />Добавить страницу</button>
      </header>

      {!supabaseConfigured && <div className="admin-pages-v2-notice is-warning">Supabase не подключен: изменения не сохранятся в базе данных.</div>}
      {message && <div className="admin-pages-v2-notice">{message}</div>}

      <section className="admin-pages-v2-kpis" aria-label="Статистика страниц">
        <article><span><FileText size={22} /></span><div><small>Всего страниц</small><b>{pages.length}</b><em>Все типы страниц</em></div></article>
        <article><span><Eye size={22} /></span><div><small>Опубликовано</small><b>{published}</b><em>{pages.length ? `${Math.round(published / pages.length * 100)}% от всех` : 'Нет страниц'}</em></div></article>
        <article><span><Clock3 size={22} /></span><div><small>Черновики</small><b>{drafts}</b><em>{drafts ? 'Требуют проверки' : 'Всё опубликовано'}</em></div></article>
        <article><span><Archive size={22} /></span><div><small>В архиве</small><b>{hidden}</b><em>{hidden ? 'Скрыты с сайта' : 'Архив пуст'}</em></div></article>
      </section>

      <section className="admin-pages-v2-workspace">
        <div className="admin-pages-v2-list-card">
          <div className="admin-pages-v2-tabs" role="tablist">
            {([
              ['all', 'Все', pages.length],
              ['published', 'Опубликованные', published],
              ['draft', 'Черновики', drafts],
              ['hidden', 'Архив', hidden]
            ] as Array<[Filter, string, number]>).map(([key, label, count]) => <button key={key} type="button" className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>{label} <span>({count})</span></button>)}
            <div className="admin-pages-v2-view-toggle" aria-label="Вид списка">
              <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="Список"><List size={17} /></button>
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Карточки"><Grid2X2 size={16} /></button>
            </div>
            <div className="admin-pages-v2-filter-wrap">
              <button type="button" className={filtersOpen || pageKind !== 'all' || dateFilter !== 'all' ? 'is-active' : ''} onClick={() => setFiltersOpen((current) => !current)}><Filter size={15} />Фильтры</button>
              {filtersOpen && <div className="admin-pages-v2-filters">
                <label>Тип страницы<select value={pageKind} onChange={(event) => setPageKind(event.target.value as PageKind)}><option value="all">Все типы</option><option value="standard">Обычная</option><option value="system">Системная</option><option value="legal">Юридическая</option><option value="service">Сервисная</option></select></label>
                <label>Дата обновления<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)}><option value="all">За всё время</option><option value="week">За неделю</option><option value="month">За месяц</option></select></label>
                <button type="button" onClick={() => { setPageKind('all'); setDateFilter('all'); setFiltersOpen(false); }}>Сбросить фильтры</button>
              </div>}
            </div>
          </div>

          <div className="admin-pages-v2-search-row">
            <label><Search size={18} /><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Поиск по страницам..." /></label>
            <span>{queryInput !== query ? 'Поиск…' : `${filtered.length} из ${pages.length}`}</span>
          </div>

          {selectedIds.length > 0 && <div className="admin-pages-v2-bulk"><b>Выбрано: {selectedIds.length}</b><button type="button" onClick={() => bulkUpdate('published')} disabled={saving}>Опубликовать</button><button type="button" onClick={() => bulkUpdate('draft')} disabled={saving}>В черновик</button><button type="button" onClick={() => bulkUpdate('hidden')} disabled={saving}>Архивировать</button><button type="button" className="is-danger" onClick={() => bulkUpdate('delete')} disabled={saving}>Удалить</button></div>}

          {filtered.length === 0 ? <div className="admin-pages-v2-empty"><FileText size={28} /><b>{pages.length ? 'Ничего не найдено' : 'Страниц пока нет'}</b><span>{pages.length ? 'Измените запрос или сбросьте фильтры.' : 'Создайте первую страницу для сайта Bullmet.'}</span><button type="button" onClick={pages.length ? () => { setQueryInput(''); setQuery(''); setFilter('all'); setPageKind('all'); setDateFilter('all'); } : newPage}>{pages.length ? 'Сбросить фильтры' : 'Добавить страницу'}</button></div> : view === 'list' ? <div className="admin-pages-v2-table">
            <div className="admin-pages-v2-table-head"><label><input type="checkbox" checked={allSelected} onChange={toggleAllSelection} /></label><span>Страница</span><span>URL (slug)</span><span>Статус</span><span>Обновлена</span><span>Действия</span></div>
            {filtered.map((page) => <article key={page.id} className={selectedPage?.id === page.id ? 'is-selected' : ''} onClick={() => selectPage(page)}>
              <label onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(page.id)} onChange={() => toggleSelection(page.id)} /></label>
              <button type="button" className="admin-pages-v2-page-cell" onDoubleClick={() => { selectPage(page); setEditorOpen(true); }}><span className="admin-pages-v2-thumb">{pageImage(page) ? <img src={pageImage(page)} alt="" /> : <FileText size={20} />}</span><span><b>{page.title}</b><em>{page.excerpt || pageTypeLabel(getPageType(page))}</em></span></button>
              <code>/{page.slug}</code><span className={`admin-pages-v2-status ${statusClass(page.status)}`}>{statusLabel(page.status)}</span><span className="admin-pages-v2-date">{formatDate(page.updated_at || page.created_at)}<small>Система</small></span>
              <span className="admin-pages-v2-row-actions" onClick={(event) => event.stopPropagation()}><button type="button" title="Редактировать" onClick={() => { selectPage(page); setEditorOpen(true); }}><Pencil size={16} /></button><button type="button" title="Другие действия" onClick={() => selectPage(page)}><MoreHorizontal size={18} /></button></span>
            </article>)}
          </div> : <div className="admin-pages-v2-grid">{filtered.map((page) => <article key={page.id} className={selectedPage?.id === page.id ? 'is-selected' : ''} onClick={() => selectPage(page)}><div>{pageImage(page) ? <img src={pageImage(page)} alt="" /> : <FileText size={25} />}</div><b>{page.title}</b><span>/{page.slug}</span><em className={`admin-pages-v2-status ${statusClass(page.status)}`}>{statusLabel(page.status)}</em><button type="button" onClick={(event) => { event.stopPropagation(); selectPage(page); setEditorOpen(true); }}>Редактировать</button></article>)}</div>}

          {filtered.length > 0 && <footer className="admin-pages-v2-pagination"><span>Показано {filtered.length} из {pages.length}</span><div><button type="button" disabled>←</button><b>1</b><button type="button" disabled>→</button></div></footer>}
        </div>

        <aside className="admin-pages-v2-preview">
          {selectedPage ? <>
            <header><b>Предпросмотр страницы</b>{selectedPage.status === 'published' && <Link href={`/${selectedPage.slug}`} target="_blank">Открыть на сайте <ExternalLink size={14} /></Link>}</header>
            <button type="button" className="admin-pages-v2-preview-canvas" onClick={() => setPreviewOpen(true)}>
              {pageImage(selectedPage) ? <img src={pageImage(selectedPage)} alt="" /> : <div className="admin-pages-v2-preview-fallback"><FileText size={28} /></div>}
              <div><small>{selectedPage.sections[0]?.subtitle || 'BULLMET'}</small><strong>{selectedPage.sections[0]?.title || selectedPage.title}</strong><span>{selectedPage.sections[0]?.text || selectedPage.excerpt || 'Страница Bullmet'}</span></div>
            </button>
            <section className="admin-pages-v2-preview-meta"><div><b>{selectedPage.title}</b><span className={`admin-pages-v2-status ${statusClass(selectedPage.status)}`}>{statusLabel(selectedPage.status)}</span></div><p>Последнее обновление: {formatDate(selectedPage.updated_at || selectedPage.created_at)}</p><p>URL: <code>/{selectedPage.slug}</code></p><p>Автор: Система</p></section>
            <button type="button" className="admin-pages-v2-edit" onClick={() => { selectPage(selectedPage); setEditorOpen(true); }}><Pencil size={16} />Редактировать страницу</button>
            <div className="admin-pages-v2-preview-actions"><button type="button" onClick={() => { selectPage(selectedPage); setEditorOpen(true); }}><Settings2 size={16} />Настройки SEO</button><button type="button" onClick={() => { selectPage(selectedPage); duplicatePage(); }}><Copy size={16} />Дублировать страницу</button>{selectedPage.status === 'hidden' ? <button type="button" onClick={() => updateStatus(selectedPage, 'draft')} disabled={saving}><ArchiveRestore size={16} />Восстановить из архива</button> : <button type="button" onClick={() => updateStatus(selectedPage, 'hidden')} disabled={saving}><Archive size={16} />Переместить в архив</button>}<button type="button" className="is-danger" onClick={() => { selectPage(selectedPage); deletePage(); }}><Trash2 size={16} />Удалить страницу</button></div>
          </> : null}
        </aside>
      </section>

      {previewOpen && <div className="admin-page-preview-modal" role="dialog" aria-modal="true"><button type="button" className="admin-page-preview-backdrop" aria-label="Закрыть предпросмотр" onClick={() => setPreviewOpen(false)} /><section className="admin-page-preview-dialog"><div className="admin-page-preview-head"><div><p>Предпросмотр</p><h2>{form.title || 'Без названия'}</h2><span>/{slugify(form.slug || '')}</span></div><button type="button" onClick={() => setPreviewOpen(false)}>Закрыть</button></div><main className="site-page-builder admin-page-preview-surface">{(form.sections?.length ? form.sections : [emptySection('text')]).map((section) => <PageSectionPreview key={section.id} section={section} />)}</main></section></div>}
    </div>
  );
}
