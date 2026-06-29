'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Eye, EyeOff, FileText, Plus, Save, Trash2 } from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import type { SitePage, SitePageInput, SitePageSection, SitePageSectionType, SitePageStatus } from '@/lib/sitePages';
import { formatDate } from '@/lib/adminCommerce';

type Filter = 'all' | SitePageStatus;

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
  if (status === 'hidden') return 'Скрыта';
  return 'Черновик';
}

function statusClass(status?: string) {
  if (status === 'published') return 'is-published';
  if (status === 'hidden') return 'is-hidden';
  return 'is-draft';
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
  const [form, setForm] = useState(emptyPage());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(form.sections[0]?.id || '');
  const [previewOpen, setPreviewOpen] = useState(false);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return pages.filter((page) => {
      const byStatus = filter === 'all' || page.status === filter;
      const haystack = [page.title, page.slug, page.excerpt, page.status].filter(Boolean).join(' ').toLowerCase();
      return byStatus && (!clean || haystack.includes(clean));
    });
  }, [pages, query, filter]);

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
    setMessage('');
  }

  function newPage() {
    const next = emptyPage();
    setForm(next);
    setActiveSectionId(next.sections[0]?.id || '');
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

  return (
    <div className="admin-pages-cms">
      <div className="admin-page-head">
        <div>
          <p>Супер-админка / CMS</p>
          <h1>Страницы сайта</h1>
          <span>Создавайте новые страницы, управляйте SEO и собирайте контент из готовых блоков.</span>
        </div>
        <div className="admin-head-actions">
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
}
