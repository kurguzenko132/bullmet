'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  type CatalogCategoryItem,
  type CatalogSettings,
  type ClockThemeItem,
  defaultCatalogSettings,
  makeSettingSlug,
  normalizeCatalogSettings,
  readCatalogSettingsAsync,
  saveCatalogSettingsAsync,
} from './categoryStore';

function newCategory(order: number): CatalogCategoryItem {
  return {
    id: `category-new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: 'Новая категория',
    slug: 'novaya-kategoriya',
    image: '',
    description: '',
    active: true,
    order,
  };
}

function newTheme(order: number): ClockThemeItem {
  return {
    id: `theme-new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: 'Новая тематика',
    active: true,
    order,
  };
}

function normalizeOrder<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function exportSettings(settings: CatalogSettings) {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bullmet-catalog-settings.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function AdminCategoriesPage() {
  const [settings, setSettings] = useState<CatalogSettings>(defaultCatalogSettings);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'categories' | 'themes' | 'import'>('categories');
  const [jsonImport, setJsonImport] = useState('');

  useEffect(() => {
    let mounted = true;
    readCatalogSettingsAsync().then((next) => {
      if (!mounted) return;
      setSettings(next);
      setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const activeCategoryCount = useMemo(() => settings.categories.filter((item) => item.active).length, [settings.categories]);
  const activeThemeCount = useMemo(() => settings.clockThemes.filter((item) => item.active).length, [settings.clockThemes]);

  function updateCategory(id: string, patch: Partial<CatalogCategoryItem>) {
    setSettings((current) => ({
      ...current,
      categories: current.categories.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (patch.name !== undefined) next.slug = makeSettingSlug(patch.name);
        return next;
      }),
    }));
  }

  function updateTheme(id: string, patch: Partial<ClockThemeItem>) {
    setSettings((current) => ({
      ...current,
      clockThemes: current.clockThemes.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  }

  function moveCategory(id: string, direction: -1 | 1) {
    setSettings((current) => {
      const list = [...current.categories];
      const index = list.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return current;
      [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
      return { ...current, categories: normalizeOrder(list) };
    });
  }

  function moveTheme(id: string, direction: -1 | 1) {
    setSettings((current) => {
      const list = [...current.clockThemes];
      const index = list.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return current;
      [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
      return { ...current, clockThemes: normalizeOrder(list) };
    });
  }

  function removeCategory(id: string) {
    if (!window.confirm('Удалить категорию из списка? Товары не удалятся, но категория пропадет из выбора.')) return;
    setSettings((current) => ({ ...current, categories: normalizeOrder(current.categories.filter((item) => item.id !== id)) }));
  }

  function removeTheme(id: string) {
    if (!window.confirm('Удалить тематику часов из списка? Товары не удалятся, но тематика пропадет из выбора.')) return;
    setSettings((current) => ({ ...current, clockThemes: normalizeOrder(current.clockThemes.filter((item) => item.id !== id)) }));
  }

  async function save() {
    setSaving(true);
    setNotice('');
    try {
      const saved = await saveCatalogSettingsAsync(settings);
      setSettings(saved);
      setNotice('Настройки категорий сохранены. Они появятся в каталоге и форме товара.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  }

  function importJson() {
    try {
      const parsed = JSON.parse(jsonImport);
      setSettings(normalizeCatalogSettings(parsed));
      setNotice('JSON импортирован. Нажми «Сохранить изменения», чтобы применить.');
      setTab('categories');
    } catch {
      setNotice('Не удалось прочитать JSON. Проверь файл или вставленный текст.');
    }
  }

  return (
    <AdminLayout title="Категории и тематики">
      <main className="adminContent adminCategoriesPage">
        <div className="adminPageHead">
          <div>
            <p>Контент / Каталог</p>
            <h2>Категории и тематики</h2>
          </div>
          <div className="adminPageActions">
            <button className="adminSecondaryBtn" type="button" onClick={() => exportSettings(settings)}>Экспорт JSON</button>
            <button className="adminPrimaryBtn" type="button" onClick={save} disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить изменения'}</button>
          </div>
        </div>

        <section className="adminCategoryStats">
          <article className="adminCard"><span>Активные категории</span><b>{ready ? activeCategoryCount : '...'}</b><small>Отображаются в фильтрах и форме товара</small></article>
          <article className="adminCard"><span>Тематики часов</span><b>{ready ? activeThemeCount : '...'}</b><small>Используются только для часов</small></article>
          <article className="adminCard"><span>Источник</span><b>Админка</b><small>Хранится в site_settings / localStorage</small></article>
        </section>

        {notice && <section className="adminUploadError adminUploadError--success">{notice}</section>}

        <section className="adminCard adminCategoryEditor">
          <div className="adminCategoryTabs">
            <button type="button" className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Категории товаров</button>
            <button type="button" className={tab === 'themes' ? 'active' : ''} onClick={() => setTab('themes')}>Тематики часов</button>
            <button type="button" className={tab === 'import' ? 'active' : ''} onClick={() => setTab('import')}>Импорт / резерв</button>
          </div>

          {tab === 'categories' && (
            <div className="adminCategoryList">
              <div className="adminCategoryList__head">
                <div><b>Категории</b><p>Можно менять название, порядок, активность и фото категории.</p></div>
                <button className="adminSecondaryBtn" type="button" onClick={() => setSettings((current) => ({ ...current, categories: [...current.categories, newCategory(current.categories.length + 1)] }))}>Добавить категорию</button>
              </div>
              {settings.categories.map((item, index) => (
                <article className="adminCategoryRow" key={item.id}>
                  <div className="adminCategoryOrder"><button type="button" onClick={() => moveCategory(item.id, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveCategory(item.id, 1)} disabled={index === settings.categories.length - 1}>↓</button></div>
                  <label>Название<input value={item.name} onChange={(event) => updateCategory(item.id, { name: event.target.value })} /></label>
                  <label>Slug<input value={item.slug} onChange={(event) => updateCategory(item.id, { slug: makeSettingSlug(event.target.value) })} /></label>
                  <label>Фото / URL<input value={item.image} onChange={(event) => updateCategory(item.id, { image: event.target.value })} placeholder="/assets/cat-clock.jpg" /></label>
                  <label className="adminCategoryWide">Описание<textarea rows={2} value={item.description} onChange={(event) => updateCategory(item.id, { description: event.target.value })} placeholder="Короткое описание для будущих SEO-блоков" /></label>
                  <div className="adminCategoryActions"><label><input type="checkbox" checked={item.active} onChange={(event) => updateCategory(item.id, { active: event.target.checked })} /> Активна</label><button type="button" onClick={() => removeCategory(item.id)}>Удалить</button></div>
                </article>
              ))}
            </div>
          )}

          {tab === 'themes' && (
            <div className="adminCategoryList">
              <div className="adminCategoryList__head">
                <div><b>Тематики часов</b><p>Эти значения появляются в форме товара и в фильтрах каталога для часов.</p></div>
                <button className="adminSecondaryBtn" type="button" onClick={() => setSettings((current) => ({ ...current, clockThemes: [...current.clockThemes, newTheme(current.clockThemes.length + 1)] }))}>Добавить тематику</button>
              </div>
              {settings.clockThemes.map((item, index) => (
                <article className="adminThemeRow" key={item.id}>
                  <div className="adminCategoryOrder"><button type="button" onClick={() => moveTheme(item.id, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveTheme(item.id, 1)} disabled={index === settings.clockThemes.length - 1}>↓</button></div>
                  <label>Название тематики<input value={item.name} onChange={(event) => updateTheme(item.id, { name: event.target.value })} /></label>
                  <div className="adminCategoryActions"><label><input type="checkbox" checked={item.active} onChange={(event) => updateTheme(item.id, { active: event.target.checked })} /> Активна</label><button type="button" onClick={() => removeTheme(item.id)}>Удалить</button></div>
                </article>
              ))}
            </div>
          )}

          {tab === 'import' && (
            <div className="adminCategoryImport">
              <h3>Резервная копия категорий</h3>
              <p>Можно экспортировать текущие категории в JSON, сохранить файл у себя, а затем восстановить его через это поле.</p>
              <textarea rows={12} value={jsonImport} onChange={(event) => setJsonImport(event.target.value)} placeholder="Вставь JSON категорий" />
              <div className="adminPageActions"><button className="adminSecondaryBtn" type="button" onClick={() => setJsonImport(JSON.stringify(settings, null, 2))}>Вставить текущие настройки</button><button className="adminPrimaryBtn" type="button" onClick={importJson}>Импортировать JSON</button></div>
              <button className="adminDangerLink" type="button" onClick={() => { if (window.confirm('Вернуть стандартные категории и тематики?')) setSettings(defaultCatalogSettings); }}>Сбросить к стандартному списку</button>
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
