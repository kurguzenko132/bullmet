'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { defaultCatalogControl, type CatalogCategory, type CatalogCategoryKind, type CatalogControlSettings } from '@/lib/catalogControl';

type Filter = 'all' | CatalogCategoryKind;

function emptyCategory(): CatalogCategory {
  return {
    id: `category-${Date.now()}`,
    title: 'Новая категория',
    slug: `category-${Date.now()}`,
    kind: 'clock',
    visible: true,
    order: 100,
    description: '',
    image: '/mockup/cat-clock.jpg'
  };
}

function kindLabel(kind?: string) {
  if (kind === 'service') return 'Услуга';
  if (kind === 'product') return 'Направление';
  return 'Часы';
}

function patchCategory(items: CatalogCategory[], id: string, patch: Partial<CatalogCategory>) {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

export function AdminCategoriesClient({ initialSettings, supabaseConfigured }: { initialSettings: CatalogControlSettings; supabaseConfigured: boolean }) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeId, setActiveId] = useState(initialSettings.categories[0]?.id || '');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return settings.categories.filter((item) => {
      const byKind = filter === 'all' || item.kind === filter;
      const haystack = [item.title, item.slug, item.kind, item.description].join(' ').toLowerCase();
      return byKind && (!clean || haystack.includes(clean));
    }).sort((a, b) => a.order - b.order);
  }, [settings.categories, filter, query]);

  const active = settings.categories.find((item) => item.id === activeId) || filtered[0] || settings.categories[0];
  const visibleCount = settings.categories.filter((item) => item.visible).length;
  const clockCount = settings.categories.filter((item) => item.kind === 'clock' && item.visible).length;
  const serviceCount = settings.categories.filter((item) => item.kind === 'service' && item.visible).length;
  const productCount = settings.categories.filter((item) => item.kind === 'product' && item.visible).length;

  function setCategory(id: string, patch: Partial<CatalogCategory>) {
    setSettings((current) => ({ ...current, categories: patchCategory(current.categories, id, patch) }));
  }

  function addCategory() {
    const category = emptyCategory();
    setSettings((current) => ({ ...current, categories: [...current.categories, category] }));
    setActiveId(category.id);
  }

  function removeCategory(id: string) {
    if (!confirm('Удалить категорию?')) return;
    setSettings((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== id) }));
    if (activeId === id) setActiveId('');
  }

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось сохранить категории.');
      setSettings(data.settings || settings);
      setMessage('Категории сохранены. Публичный каталог и sitemap будут использовать эти данные.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить категории.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-page-head">
        <div>
          <p>Категории</p>
          <h1>Категории и публичная видимость</h1>
          <span>Управляйте категориями часов, направлениями и услугами. Скрытые категории не должны попадать на публичный сайт и в sitemap.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={addCategory}><Plus size={17} /> Добавить</button>
          <button type="button" onClick={() => setSettings(defaultCatalogControl)}><RotateCcw size={17} /> Сбросить</button>
          <button type="button" onClick={saveSettings} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: категории не сохранятся в базу.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-categories-stats">
        <article><b>{settings.categories.length}</b><span>всего категорий</span></article>
        <article><b>{visibleCount}</b><span>видно клиентам</span></article>
        <article><b>{clockCount}</b><span>категорий часов</span></article>
        <article><b>{serviceCount}</b><span>услуг включено</span></article>
        <article><b>{productCount}</b><span>направлений включено</span></article>
        <label>
          <input type="checkbox" checked={settings.enabled} onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))} />
          Использовать категории из админки
        </label>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по категории, slug или описанию" />
        <div>
          {(['all', 'clock', 'product', 'service'] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : kindLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-categories-layout">
        <div className="admin-categories-list">
          {filtered.map((category) => (
            <button key={category.id} type="button" className={active?.id === category.id ? 'is-active' : ''} onClick={() => setActiveId(category.id)}>
              <img src={category.image} alt="" />
              <div>
                <b>{category.title}</b>
                <span>{kindLabel(category.kind)} · {category.visible ? 'видно' : 'скрыто'} · {category.slug}</span>
              </div>
            </button>
          ))}
        </div>

        {active && (
          <article className="admin-category-editor">
            <div className="admin-category-preview">
              <img src={active.image} alt="" />
              <div>
                <span>{kindLabel(active.kind)}</span>
                <h2>{active.title}</h2>
                <p>{active.description || 'Описание категории появится здесь.'}</p>
              </div>
            </div>

            <div className="admin-category-form">
              <label>ID<input value={active.id} onChange={(event) => setCategory(active.id, { id: event.target.value })} /></label>
              <label>Название<input value={active.title} onChange={(event) => setCategory(active.id, { title: event.target.value })} /></label>
              <label>Slug / значение фильтра<input value={active.slug} onChange={(event) => setCategory(active.id, { slug: event.target.value })} /></label>
              <label>Тип
                <select value={active.kind} onChange={(event) => setCategory(active.id, { kind: event.target.value as CatalogCategoryKind })}>
                  <option value="clock">Категория часов</option>
                  <option value="product">Направление товаров</option>
                  <option value="service">Услуга</option>
                </select>
              </label>
              <label>Порядок<input type="number" value={active.order} onChange={(event) => setCategory(active.id, { order: Number(event.target.value) || 100 })} /></label>
              <label className="span-2">Изображение<input value={active.image} onChange={(event) => setCategory(active.id, { image: event.target.value })} /></label>
              <label className="span-2">Описание<textarea rows={3} value={active.description} onChange={(event) => setCategory(active.id, { description: event.target.value })} /></label>
              <label className="span-2">SEO title<input value={active.seoTitle || ''} onChange={(event) => setCategory(active.id, { seoTitle: event.target.value })} /></label>
              <label className="span-2">SEO description<textarea rows={3} value={active.seoDescription || ''} onChange={(event) => setCategory(active.id, { seoDescription: event.target.value })} /></label>
            </div>

            <div className="admin-category-actions">
              <button type="button" onClick={() => setCategory(active.id, { visible: !active.visible })}>
                {active.visible ? <EyeOff size={17} /> : <Eye size={17} />}
                {active.visible ? 'Скрыть' : 'Показать'}
              </button>
              <Link href={active.kind === 'clock' ? `/catalog?category=${encodeURIComponent(active.slug)}` : '/services'} target="_blank">Открыть на сайте ↗</Link>
              <button type="button" onClick={() => removeCategory(active.id)}><Trash2 size={17} />Удалить</button>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
