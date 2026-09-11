'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Archive, ArchiveRestore, Box, CheckSquare, ChevronDown, Copy, Eye, EyeOff, FileText,
  Filter, GripVertical, Image as ImageIcon, List, MoreHorizontal, Pencil, Plus, Save,
  Search, Square, Trash2, X
} from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import { type CatalogProduct } from '@/lib/products';
import {
  defaultCatalogControl, type CatalogCategory, type CatalogCategoryKind,
  type CatalogCategoryStatus, type CatalogControlSettings
} from '@/lib/catalogControl';

type StatusFilter = 'all' | CatalogCategoryStatus;
type SortMode = 'order' | 'name' | 'products' | 'updated';
type ViewMode = 'list' | 'grid';
type EditorTab = 'base' | 'image' | 'seo' | 'settings';

const statusMeta: Record<CatalogCategoryStatus, { label: string; className: string }> = {
  active: { label: 'Активна', className: 'is-active' },
  hidden: { label: 'Скрыта', className: 'is-hidden' },
  archived: { label: 'В архиве', className: 'is-archived' }
};

function categoryStatus(category: CatalogCategory): CatalogCategoryStatus {
  if (category.status === 'archived' || category.status === 'hidden' || category.status === 'active') return category.status;
  return category.visible ? 'active' : 'hidden';
}

function normalized(value?: string) {
  return (value || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchesCategory(product: CatalogProduct, category: CatalogCategory) {
  const categoryKeys = [category.title, category.slug].map(normalized).filter(Boolean);
  const productKeys = [product.category, product.clockTheme].map(normalized).filter(Boolean);
  return productKeys.some((productKey) => categoryKeys.some((categoryKey) => productKey === categoryKey));
}

function emptyCategory(order: number): CatalogCategory {
  const id = `category-${Date.now()}`;
  return {
    id,
    title: 'Новая категория',
    slug: `new-category-${Date.now()}`,
    kind: 'clock',
    visible: true,
    status: 'active',
    order,
    description: 'Кратко опишите, какие товары объединяет категория.',
    image: '/mockup/cat-clock.jpg',
    showInCatalog: true,
    showInFilter: true,
    showOnHomepage: false,
    showWhenEmpty: true
  };
}

function kindLabel(kind: CatalogCategoryKind) {
  return kind === 'service' ? 'Услуга' : kind === 'product' ? 'Направление' : 'Категория часов';
}

function patchCategory(categories: CatalogCategory[], id: string, patch: Partial<CatalogCategory>) {
  return categories.map((category) => category.id === id ? { ...category, ...patch } : category);
}

export function AdminCategoriesClient({
  initialSettings,
  initialProducts,
  supabaseConfigured
}: {
  initialSettings: CatalogControlSettings;
  initialProducts: CatalogProduct[];
  supabaseConfigured: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [kindFilter, setKindFilter] = useState<'all' | CatalogCategoryKind>('all');
  const [sortMode, setSortMode] = useState<SortMode>('order');
  const [view, setView] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(initialSettings.categories[0]?.id || '');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('base');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput), 250);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    const saved = window.localStorage.getItem('admin-categories-view');
    if (saved === 'list' || saved === 'grid') setView(saved);
  }, []);

  function setViewMode(next: ViewMode) {
    setView(next);
    window.localStorage.setItem('admin-categories-view', next);
  }

  const productsFor = (category: CatalogCategory) => initialProducts.filter((product) => matchesCategory(product, category));

  const categories = useMemo(() => {
    const clean = normalized(query);
    const filtered = settings.categories.filter((category) => {
      const byStatus = statusFilter === 'all' || categoryStatus(category) === statusFilter;
      const byKind = kindFilter === 'all' || category.kind === kindFilter;
      const haystack = normalized([category.title, category.slug, category.description, category.kind].join(' '));
      return byStatus && byKind && (!clean || haystack.includes(clean));
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'name') return a.title.localeCompare(b.title, 'ru');
      if (sortMode === 'products') return productsFor(b).length - productsFor(a).length || a.order - b.order;
      if (sortMode === 'updated') return b.id.localeCompare(a.id);
      return a.order - b.order;
    });
  // initialProducts is read-only server data and deliberately not part of state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.categories, query, statusFilter, kindFilter, sortMode]);

  const active = settings.categories.find((category) => category.id === activeId) || categories[0] || settings.categories[0];
  const activeProducts = active ? productsFor(active) : [];
  const activeCount = settings.categories.filter((category) => categoryStatus(category) === 'active').length;
  const archivedCount = settings.categories.filter((category) => categoryStatus(category) === 'archived').length;
  const allSelected = categories.length > 0 && categories.every((category) => selectedIds.includes(category.id));

  function changeCategories(nextCategories: CatalogCategory[]) {
    setSettings((current) => ({ ...current, categories: nextCategories }));
  }

  function updateCategory(id: string, patch: Partial<CatalogCategory>) {
    changeCategories(patchCategory(settings.categories, id, patch));
  }

  async function persist(nextSettings = settings, success = 'Изменения сохранены.') {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: nextSettings })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось сохранить изменения.');
      setSettings(data.settings || nextSettings);
      setMessage(success);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function nextSettingsWith(categoryId: string, patch: Partial<CatalogCategory>) {
    return { ...settings, categories: patchCategory(settings.categories, categoryId, patch) };
  }

  async function changeStatus(category: CatalogCategory, status: CatalogCategoryStatus) {
    const next = nextSettingsWith(category.id, { status, visible: status === 'active' });
    await persist(next, status === 'active' ? 'Категория опубликована.' : status === 'hidden' ? 'Категория скрыта.' : 'Категория перемещена в архив.');
  }

  function addCategory() {
    const category = emptyCategory(Math.max(0, ...settings.categories.map((item) => item.order)) + 1);
    changeCategories([...settings.categories, category]);
    setActiveId(category.id);
    setEditorTab('base');
    setEditorOpen(true);
  }

  async function duplicateCategory(category: CatalogCategory) {
    const copy: CatalogCategory = {
      ...category,
      id: `${category.id}-copy-${Date.now()}`,
      title: `${category.title} — копия`,
      slug: `${category.slug}-copy`,
      order: Math.max(...settings.categories.map((item) => item.order)) + 1,
      visible: false,
      status: 'hidden'
    };
    const next = { ...settings, categories: [...settings.categories, copy] };
    if (await persist(next, 'Создана скрытая копия категории.')) {
      setActiveId(copy.id);
      setEditorOpen(true);
    }
  }

  async function deleteCategory(category: CatalogCategory) {
    const count = productsFor(category).length;
    if (count > 0) {
      setMessage(`В категории «${category.title}» есть товары (${count}). Сначала переместите её в архив.`);
      return;
    }
    if (!window.confirm(`Удалить категорию «${category.title}» без возможности восстановления?`)) return;
    const next = { ...settings, categories: settings.categories.filter((item) => item.id !== category.id) };
    if (await persist(next, 'Категория удалена.')) {
      setSelectedIds((current) => current.filter((id) => id !== category.id));
      setActiveId(next.categories[0]?.id || '');
      setEditorOpen(false);
    }
  }

  async function bulkStatus(status: CatalogCategoryStatus) {
    if (!selectedIds.length) return;
    const next = {
      ...settings,
      categories: settings.categories.map((category) => selectedIds.includes(category.id)
        ? { ...category, status, visible: status === 'active' }
        : category)
    };
    if (await persist(next, `${selectedIds.length} категорий обновлено.`)) setSelectedIds([]);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : categories.map((category) => category.id));
  }

  function reorder(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const ordered = [...settings.categories].sort((a, b) => a.order - b.order);
    const sourceIndex = ordered.findIndex((category) => category.id === sourceId);
    const targetIndex = ordered.findIndex((category) => category.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [source] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, source);
    changeCategories(ordered.map((category, index) => ({ ...category, order: index + 1 })));
    setMessage('Порядок изменён. Нажмите «Сохранить», чтобы опубликовать его.');
  }

  async function saveEditor() {
    if (!active) return;
    const duplicateSlug = settings.categories.some((category) => category.id !== active.id && normalized(category.slug) === normalized(active.slug));
    if (!active.title.trim() || !active.slug.trim()) {
      setMessage('Укажите название и URL (slug) категории.');
      return;
    }
    if (duplicateSlug) {
      setMessage('Этот slug уже используется другой категорией. Укажите уникальный URL.');
      return;
    }
    if (await persist(settings, 'Категория сохранена и синхронизирована с каталогом.')) setEditorOpen(false);
  }

  return (
    <div className="admin-categories-v2">
      <header className="admin-categories-head-v2">
        <div><p>Каталог</p><h1>Категории товаров</h1><span>Создавайте, редактируйте и задавайте порядок отображения категорий каталога.</span></div>
        <button type="button" className="admin-primary-v2" onClick={addCategory}><Plus size={18} />Добавить категорию</button>
      </header>

      {!supabaseConfigured && <div className="admin-categories-message-v2">Supabase не подключен: изменения доступны для просмотра, но не будут сохранены в базу.</div>}
      {message && <div className="admin-categories-message-v2">{message}<button type="button" onClick={() => setMessage('')} aria-label="Закрыть"><X size={15} /></button></div>}

      <section className="admin-category-kpis-v2">
        <article><span className="admin-kpi-icon-v2"><FileText size={22} /></span><div><small>Всего категорий</small><b>{settings.categories.length}</b><em>в структуре каталога</em></div></article>
        <article><span className="admin-kpi-icon-v2"><Box size={22} /></span><div><small>Всего товаров</small><b>{initialProducts.length}</b><em>в текущем каталоге</em></div></article>
        <article><span className="admin-kpi-icon-v2"><Eye size={22} /></span><div><small>Отображаются</small><b>{activeCount}</b><em>{settings.categories.length ? Math.round(activeCount / settings.categories.length * 100) : 0}% от всех</em></div></article>
        <article><span className="admin-kpi-icon-v2"><Archive size={22} /></span><div><small>В архиве</small><b>{archivedCount}</b><em>{settings.categories.length ? Math.round(archivedCount / settings.categories.length * 100) : 0}% от всех</em></div></article>
      </section>

      <section className="admin-categories-workspace-v2">
        <div className="admin-categories-main-v2">
          <div className="admin-category-toolbar-v2">
            <label><Search size={18} /><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Поиск по категориям..." /></label>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Сортировка"><option value="order">По порядку</option><option value="name">По названию</option><option value="products">По товарам</option><option value="updated">Недавно добавленные</option></select>
            <button type="button" className={filtersOpen ? 'is-active' : ''} onClick={() => setFiltersOpen((value) => !value)}><Filter size={16} />Фильтры</button>
            <div className="admin-view-switch-v2"><button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} aria-label="Список"><List size={18} /></button><button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} aria-label="Карточки"><Box size={17} /></button></div>
          </div>
          {filtersOpen && <div className="admin-category-filters-v2"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="all">Все статусы</option><option value="active">Активные</option><option value="hidden">Скрытые</option><option value="archived">В архиве</option></select><select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as 'all' | CatalogCategoryKind)}><option value="all">Все типы</option><option value="clock">Категории часов</option><option value="product">Направления</option><option value="service">Услуги</option></select><button type="button" onClick={() => { setStatusFilter('all'); setKindFilter('all'); setQueryInput(''); }}>Сбросить</button></div>}

          {selectedIds.length > 0 && <div className="admin-category-bulk-v2"><b>Выбрано: {selectedIds.length}</b><button type="button" onClick={() => bulkStatus('active')}><Eye size={15} />Показать</button><button type="button" onClick={() => bulkStatus('hidden')}><EyeOff size={15} />Скрыть</button><button type="button" onClick={() => bulkStatus('archived')}><Archive size={15} />В архив</button><button type="button" onClick={() => setSelectedIds([])}>Отменить</button></div>}

          {view === 'list' ? <div className="admin-category-table-v2"><div className="admin-category-table-head-v2"><button type="button" onClick={toggleAll} aria-label="Выбрать все">{allSelected ? <CheckSquare size={18} /> : <Square size={18} />}</button><span>Категория</span><span>Товаров</span><span>Порядок</span><span>Статус</span><span>Обновлена</span><span>Действия</span></div>
            {categories.map((category) => {
              const status = categoryStatus(category); const count = productsFor(category).length;
              return <article key={category.id} draggable onDragStart={() => setDraggedId(category.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedId) reorder(draggedId, category.id); setDraggedId(null); }} className={active?.id === category.id ? 'is-current' : ''}>
                <button type="button" className="admin-row-check-v2" onClick={() => toggleSelected(category.id)} aria-label="Выбрать категорию">{selectedIds.includes(category.id) ? <CheckSquare size={18} /> : <Square size={18} />}</button>
                <button type="button" className="admin-category-title-cell-v2" onClick={() => { setActiveId(category.id); setEditorOpen(true); }}><GripVertical size={17} /><img src={category.image} alt="" /><span><b>{category.title}</b><small>/{category.slug}</small></span></button>
                <button type="button" className="admin-count-cell-v2" onClick={() => setActiveId(category.id)}>{count}</button>
                <input aria-label="Порядок" type="number" value={category.order} onChange={(event) => updateCategory(category.id, { order: Number(event.target.value) || category.order })} />
                <button type="button" className={`admin-category-status-v2 ${statusMeta[status].className}`} onClick={() => changeStatus(category, status === 'active' ? 'hidden' : 'active')}>{statusMeta[status].label}</button>
                <span className="admin-category-update-v2">Текущая сессия<br /><small>Администратор</small></span>
                <span className="admin-row-actions-v2"><button type="button" onClick={() => { setActiveId(category.id); setEditorOpen(true); }} aria-label="Редактировать"><Pencil size={16} /></button><button type="button" onClick={() => duplicateCategory(category)} aria-label="Дублировать"><Copy size={16} /></button><button type="button" onClick={() => changeStatus(category, status === 'archived' ? 'hidden' : 'archived')} aria-label="Архивировать">{status === 'archived' ? <ArchiveRestore size={16} /> : <Archive size={16} />}</button><button type="button" onClick={() => deleteCategory(category)} aria-label="Удалить"><Trash2 size={16} /></button></span>
              </article>;
            })}
          </div> : <div className="admin-category-grid-v2">{categories.map((category) => { const status = categoryStatus(category); return <article key={category.id} className={active?.id === category.id ? 'is-current' : ''}><img src={category.image} alt="" /><div><span className={`admin-category-status-v2 ${statusMeta[status].className}`}>{statusMeta[status].label}</span><h3>{category.title}</h3><p>{productsFor(category).length} товаров · {kindLabel(category.kind)}</p><button type="button" onClick={() => { setActiveId(category.id); setEditorOpen(true); }}>Редактировать</button></div></article>; })}</div>}
          {!categories.length && <div className="admin-category-empty-v2"><ImageIcon size={28} /><b>Ничего не найдено</b><span>Измените параметры фильтра или создайте новую категорию.</span></div>}
          <footer className="admin-category-list-footer-v2"><span>Показано {categories.length} из {settings.categories.length}</span><button type="button" onClick={() => persist(settings, 'Порядок и параметры категорий сохранены.')} disabled={saving}><Save size={16} />{saving ? 'Сохраняем...' : 'Сохранить изменения'}</button></footer>
        </div>

        <aside className="admin-category-preview-v2">{active ? <><header><div><h2>Предпросмотр категории</h2><span>Так карточка выглядит в каталоге.</span></div><Link href={`/catalog?category=${encodeURIComponent(active.slug)}`} target="_blank">Открыть на сайте ↗</Link></header><div className="admin-category-public-preview-v2"><img src={active.image} alt="" /><div><span>{kindLabel(active.kind)}</span><h3>{active.title}</h3><p>{active.description || 'Добавьте описание категории.'}</p><b>{activeProducts.length} товаров</b></div></div><div className="admin-category-preview-products-v2">{activeProducts.slice(0, 3).map((product) => <article key={product.slug}><img src={product.image} alt="" /><span>{product.title}</span><b>{product.price} BYN</b></article>)}{!activeProducts.length && <span className="admin-preview-empty-v2">В этой категории пока нет товаров.</span>}</div><section><h3>Информация</h3><dl><div><dt>Название</dt><dd>{active.title}</dd></div><div><dt>URL (slug)</dt><dd>/{active.slug}</dd></div><div><dt>Товаров</dt><dd>{activeProducts.length}</dd></div><div><dt>Статус</dt><dd><span className={`admin-category-status-v2 ${statusMeta[categoryStatus(active)].className}`}>{statusMeta[categoryStatus(active)].label}</span></dd></div><div><dt>Порядок</dt><dd>{active.order}</dd></div></dl></section><section className="admin-preview-actions-v2"><h3>Действия</h3><button type="button" onClick={() => { setEditorOpen(true); setEditorTab('base'); }}><Pencil size={16} />Редактировать</button><button type="button" onClick={() => duplicateCategory(active)}><Copy size={16} />Дублировать категорию</button><button type="button" onClick={() => changeStatus(active, categoryStatus(active) === 'archived' ? 'hidden' : 'archived')}><Archive size={16} />{categoryStatus(active) === 'archived' ? 'Вернуть из архива' : 'Переместить в архив'}</button><button type="button" className="is-danger" onClick={() => deleteCategory(active)}><Trash2 size={16} />Удалить категорию</button></section></> : <div className="admin-category-empty-v2"><ImageIcon size={28} /><b>Выберите категорию</b></div>}</aside>
      </section>

      {editorOpen && active && <div className="admin-category-modal-v2" role="dialog" aria-modal="true" aria-label="Редактирование категории"><button type="button" className="admin-category-modal-backdrop-v2" onClick={() => setEditorOpen(false)} aria-label="Закрыть" /><section><header><div><p>Категория каталога</p><h2>{active.title}</h2><span>Изменения отразятся на публичном каталоге после сохранения.</span></div><button type="button" onClick={() => setEditorOpen(false)} aria-label="Закрыть"><X size={20} /></button></header><nav>{([['base', 'Основное'], ['image', 'Изображение'], ['seo', 'SEO'], ['settings', 'Настройки']] as [EditorTab, string][]).map(([tab, label]) => <button type="button" key={tab} className={editorTab === tab ? 'is-active' : ''} onClick={() => setEditorTab(tab)}>{label}</button>)}</nav><div className="admin-category-editor-body-v2">
        {editorTab === 'base' && <div className="admin-category-form-v2"><label>Название категории<input value={active.title} onChange={(event) => updateCategory(active.id, { title: event.target.value })} /></label><label>URL (slug)<input value={active.slug} onChange={(event) => updateCategory(active.id, { slug: event.target.value })} /></label><label>Тип категории<select value={active.kind} onChange={(event) => updateCategory(active.id, { kind: event.target.value as CatalogCategoryKind })}><option value="clock">Категория часов</option><option value="product">Направление товаров</option><option value="service">Услуга</option></select></label><label>Порядок отображения<input type="number" min="1" value={active.order} onChange={(event) => updateCategory(active.id, { order: Number(event.target.value) || 1 })} /></label><label className="span-2">Описание<textarea rows={5} value={active.description} onChange={(event) => updateCategory(active.id, { description: event.target.value })} /></label></div>}
        {editorTab === 'image' && <div className="admin-category-image-editor-v2"><img src={active.image} alt="" /><AdminImagePicker label="Изображение категории" value={active.image} onChange={(image) => updateCategory(active.id, { image })} hint="Используйте горизонтальное изображение, оно будет показано в карточке категории." /></div>}
        {editorTab === 'seo' && <div className="admin-category-form-v2"><label className="span-2">SEO title<input value={active.seoTitle || ''} onChange={(event) => updateCategory(active.id, { seoTitle: event.target.value })} /></label><label className="span-2">SEO description<textarea rows={4} value={active.seoDescription || ''} onChange={(event) => updateCategory(active.id, { seoDescription: event.target.value })} /></label><label className="span-2">Open Graph изображение<input value={active.ogImage || ''} onChange={(event) => updateCategory(active.id, { ogImage: event.target.value })} /></label></div>}
        {editorTab === 'settings' && <div className="admin-category-settings-form-v2"><label>Статус<select value={categoryStatus(active)} onChange={(event) => { const status = event.target.value as CatalogCategoryStatus; updateCategory(active.id, { status, visible: status === 'active' }); }}><option value="active">Активна</option><option value="hidden">Скрыта</option><option value="archived">В архиве</option></select></label><label><input type="checkbox" checked={active.showInCatalog !== false} onChange={(event) => updateCategory(active.id, { showInCatalog: event.target.checked })} />Показывать в каталоге</label><label><input type="checkbox" checked={active.showInFilter !== false} onChange={(event) => updateCategory(active.id, { showInFilter: event.target.checked })} />Показывать в фильтре</label><label><input type="checkbox" checked={active.showOnHomepage === true} onChange={(event) => updateCategory(active.id, { showOnHomepage: event.target.checked })} />Показывать на главной</label><label><input type="checkbox" checked={active.showWhenEmpty !== false} onChange={(event) => updateCategory(active.id, { showWhenEmpty: event.target.checked })} />Показывать, если товаров нет</label><button type="button" className="admin-reset-category-v2" onClick={() => { const original = defaultCatalogControl.categories.find((item) => item.id === active.id); if (original) updateCategory(active.id, original); }}>Сбросить настройки категории</button></div>}
      </div><footer><button type="button" onClick={() => setEditorOpen(false)}>Отмена</button><button type="button" className="admin-primary-v2" onClick={saveEditor} disabled={saving}><Save size={16} />{saving ? 'Сохраняем...' : 'Сохранить категорию'}</button></footer></section></div>}
    </div>
  );
}
