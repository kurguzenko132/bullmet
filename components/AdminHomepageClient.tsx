'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, CheckCircle2, ChevronLeft, ChevronRight, Copy, Eye, EyeOff,
  GripVertical, Image as ImageIcon, LayoutTemplate, Monitor, MoreVertical, Plus,
  RotateCcw, Save, Settings2, Smartphone, Trash2
} from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import {
  defaultHomepageControl, type HomeControlSettings, type HomeFeatureItem,
  type HomeHeroSlide, type HomeIcon, type HomeLayoutSection
} from '@/lib/homepageControl';

type Tab = 'structure' | 'seo' | 'settings';
type Device = 'desktop' | 'tablet' | 'mobile';

const iconOptions: HomeIcon[] = ['factory', 'clock', 'materials', 'truck', 'shield', 'tools', 'search', 'request', 'hammer', 'package', 'spark', 'custom', 'ruler', 'calculator'];

function updateItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

function sortItems<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function moveItem<T extends { id: string; order: number }>(items: T[], id: string, direction: -1 | 1) {
  const sorted = sortItems(items);
  const index = sorted.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= sorted.length) return sorted;
  const copy = [...sorted];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  return copy.map((item, position) => ({ ...item, order: position + 1 }));
}

function Field({ label, value, onChange, rows, max = 0, hint }: { label: string; value: string; onChange: (value: string) => void; rows?: number; max?: number; hint?: string }) {
  const count = value.length;
  return <label className="homepage-cms-field"><span>{label}{max > 0 && <em>{count}/{max}</em>}</span>{rows ? <textarea rows={rows} maxLength={max || undefined} value={value} onChange={(event) => onChange(event.target.value)} /> : <input maxLength={max || undefined} value={value} onChange={(event) => onChange(event.target.value)} />}{hint && <small>{hint}</small>}</label>;
}

function Visibility({ visible, onClick, locked = false }: { visible: boolean; onClick: () => void; locked?: boolean }) {
  return <button type="button" disabled={locked} className={`homepage-cms-visibility ${visible ? 'is-visible' : ''}`} onClick={onClick} title={visible ? 'Скрыть блок' : 'Показать блок'}>{visible ? <Eye size={16} /> : <EyeOff size={16} />}{visible ? 'Показан' : 'Скрыт'}</button>;
}

function FeatureRow({ item, onChange, onMove }: { item: HomeFeatureItem; onChange: (patch: Partial<HomeFeatureItem>) => void; onMove: (direction: -1 | 1) => void }) {
  return <article className="homepage-cms-sort-row">
    <GripVertical size={17} aria-hidden="true" />
    <select value={item.icon} onChange={(event) => onChange({ icon: event.target.value as HomeIcon })}>{iconOptions.map((icon) => <option value={icon} key={icon}>{icon}</option>)}</select>
    <input value={item.text} onChange={(event) => onChange({ text: event.target.value })} aria-label="Текст преимущества" />
    <Visibility visible={item.visible} onClick={() => onChange({ visible: !item.visible })} />
    <button type="button" onClick={() => onMove(-1)} aria-label="Поднять"><ArrowUp size={16} /></button><button type="button" onClick={() => onMove(1)} aria-label="Опустить"><ArrowDown size={16} /></button>
  </article>;
}

export function AdminHomepageClient({ initialSettings }: { initialSettings: HomeControlSettings }) {
  const [settings, setSettings] = useState<HomeControlSettings>(initialSettings);
  const [tab, setTab] = useState<Tab>('structure');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [device, setDevice] = useState<Device>('desktop');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');

  const slides = useMemo(() => sortItems(settings.heroSlides), [settings.heroSlides]);
  const slide = slides[Math.min(currentSlide, Math.max(0, slides.length - 1))] || defaultHomepageControl.heroSlides[0];
  const visibleSections = settings.layout.filter((item) => item.visible).length;

  function change(recipe: (current: HomeControlSettings) => HomeControlSettings) {
    setSettings((current) => recipe(current));
    setDirty(true);
    setNotice('Есть несохранённые изменения');
  }

  function patchSlide(patch: Partial<HomeHeroSlide>) {
    change((current) => ({ ...current, heroSlides: updateItem(current.heroSlides, slide.id, patch) }));
  }

  function patchSection(section: keyof Pick<HomeControlSettings, 'directionsSection' | 'productsSection' | 'productionSection' | 'stepsSection' | 'gallerySection' | 'cta'>, patch: Record<string, unknown>) {
    change((current) => ({ ...current, [section]: { ...current[section], ...patch } } as HomeControlSettings));
  }

  function patchLayout(section: HomeLayoutSection) {
    change((current) => ({ ...current, layout: updateItem(current.layout, section.id, { visible: !section.visible }) }));
  }

  function addSlide() {
    const order = Math.max(0, ...settings.heroSlides.map((item) => item.order)) + 1;
    const id = `hero-${Date.now()}`;
    change((current) => ({ ...current, heroSlides: [...current.heroSlides, { ...slide, id, title: 'Новый главный слайд', imageAlt: '', visible: true, order }] }));
    setCurrentSlide(slides.length);
  }

  function duplicateSlide() {
    const id = `hero-${Date.now()}`;
    const order = Math.max(0, ...settings.heroSlides.map((item) => item.order)) + 1;
    change((current) => ({ ...current, heroSlides: [...current.heroSlides, { ...slide, id, title: `${slide.title} — копия`, order }] }));
    setCurrentSlide(slides.length);
  }

  function deleteSlide() {
    if (slides.length === 1 || !window.confirm('Удалить этот Hero-слайд? Это действие нельзя отменить.')) return;
    change((current) => ({ ...current, heroSlides: current.heroSlides.filter((item) => item.id !== slide.id).map((item, index) => ({ ...item, order: index + 1 })) }));
    setCurrentSlide(Math.max(0, currentSlide - 1));
  }

  async function save() {
    setSaving(true); setNotice('');
    try {
      const response = await fetch('/api/admin/homepage-control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить изменения.');
      setSettings(result.settings || settings); setDirty(false); setNotice('Изменения сохранены и опубликованы на главной странице.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Ошибка сохранения.'); } finally { setSaving(false); }
  }

  function reset() {
    if (!window.confirm('Сбросить редактор к стартовым настройкам?')) return;
    setSettings(defaultHomepageControl); setCurrentSlide(0); setDirty(true); setNotice('Настройки сброшены локально. Сохраните изменения, чтобы опубликовать их.');
  }

  return <div className="homepage-cms">
    <header className="homepage-cms-header">
      <div><p>Контент <span>›</span> Главная страница</p><h1>Главная страница</h1><small>Управление содержимым главной страницы. Изменения публикуются сразу после сохранения.</small></div>
      <div className="homepage-cms-header-actions"><span className={dirty ? 'is-draft' : 'is-published'}>{dirty ? '● Есть изменения' : '● Страница опубликована'}</span><Link href="/" target="_blank">Посмотреть на сайте ↗</Link></div>
    </header>

    <nav className="homepage-cms-tabs" aria-label="Разделы редактора">
      <button className={tab === 'structure' ? 'active' : ''} onClick={() => setTab('structure')}><LayoutTemplate size={17} /> Структура</button>
      <button className={tab === 'seo' ? 'active' : ''} onClick={() => setTab('seo')}><CheckCircle2 size={17} /> SEO</button>
      <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}><Settings2 size={17} /> Настройки</button>
    </nav>

    {notice && <div className={`homepage-cms-notice ${dirty ? 'is-draft' : ''}`}>{notice}</div>}

    {tab === 'structure' && <>
      <section className="homepage-cms-hero-editor">
        <div className="homepage-cms-card hero-cms-card">
          <div className="homepage-cms-card-title"><div><h2>Главный слайд (Hero)</h2><small>Слайд {currentSlide + 1} из {slides.length}</small></div><div className="hero-cms-card-actions"><button type="button" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}><ChevronLeft size={18} /></button><button type="button" onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1}><ChevronRight size={18} /></button><button type="button" onClick={addSlide}><Plus size={16} /> Добавить слайд</button><button type="button" onClick={duplicateSlide} title="Дублировать слайд"><Copy size={16} /></button><button type="button" onClick={deleteSlide} disabled={slides.length === 1} title="Удалить слайд"><Trash2 size={16} /></button></div></div>
          <div className="homepage-cms-hero-workspace">
            <div className="homepage-cms-hero-image"><img src={slide.image} alt="" /><span>{slide.kicker || 'Метка'}</span><h3>{slide.title || 'Заголовок слайда'}</h3><p>{slide.text || 'Описание слайда'}</p><b>{slide.primaryLabel || 'Кнопка'}</b></div>
            <div className="homepage-cms-fields"><Field label="Метка (eyebrow)" value={slide.kicker} max={50} onChange={(value) => patchSlide({ kicker: value })} /><Field label="Заголовок" value={slide.title} max={100} onChange={(value) => patchSlide({ title: value })} /><Field label="Описание" value={slide.text} rows={4} max={300} onChange={(value) => patchSlide({ text: value })} /><Field label="Текст кнопки" value={slide.primaryLabel} max={30} onChange={(value) => patchSlide({ primaryLabel: value })} /><Field label="Ссылка кнопки" value={slide.primaryHref} onChange={(value) => patchSlide({ primaryHref: value })} /><AdminImagePicker label="Изображение слайда" value={slide.image} onChange={(value) => patchSlide({ image: value })} altValue={slide.imageAlt} onAltChange={(value) => patchSlide({ imageAlt: value })} /><div className="homepage-cms-inline-tools"><Visibility visible={slide.visible} onClick={() => patchSlide({ visible: !slide.visible })} /><button type="button" onClick={() => change((current) => ({ ...current, heroSlides: moveItem(current.heroSlides, slide.id, -1) }))}><ArrowUp size={16} /> Выше</button><button type="button" onClick={() => change((current) => ({ ...current, heroSlides: moveItem(current.heroSlides, slide.id, 1) }))}><ArrowDown size={16} /> Ниже</button></div></div>
          </div>
        </div>
        <aside className={`homepage-cms-preview is-${device}`}><div className="homepage-cms-preview-head"><b>Предпросмотр</b><span><button onClick={() => setDevice('desktop')} className={device === 'desktop' ? 'active' : ''}><Monitor size={15} /></button><button onClick={() => setDevice('tablet')} className={device === 'tablet' ? 'active' : ''}><LayoutTemplate size={15} /></button><button onClick={() => setDevice('mobile')} className={device === 'mobile' ? 'active' : ''}><Smartphone size={15} /></button></span></div><div className="homepage-cms-preview-canvas"><img src={slide.image} alt="" /><div><small>{slide.kicker}</small><h3>{slide.title}</h3><p>{slide.text}</p><b>{slide.primaryLabel}</b></div></div><p>Предпросмотр показывает активный слайд. Нажмите «Посмотреть на сайте» для проверки опубликованной версии.</p></aside>
      </section>

      <section className="homepage-cms-split">
        <div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Преимущества</h2><small>Показываются под Hero-блоком</small></div><button onClick={() => change((current) => ({ ...current, features: [...current.features, { id: `feature-${Date.now()}`, icon: 'spark', text: 'Новое преимущество', visible: true, order: current.features.length + 1 }] }))}><Plus size={16} /> Добавить блок</button></div><div className="homepage-cms-sort-list">{sortItems(settings.features).map((item) => <FeatureRow key={item.id} item={item} onChange={(patch) => change((current) => ({ ...current, features: updateItem(current.features, item.id, patch) }))} onMove={(direction) => change((current) => ({ ...current, features: moveItem(current.features, item.id, direction) }))} />)}</div></div>
        <div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Популярные категории</h2><small>До 6 карточек на главной</small></div><span className={settings.directions.filter((item) => item.visible).length > 6 ? 'homepage-cms-warning' : 'homepage-cms-count'}>{settings.directions.filter((item) => item.visible).length}/6</span></div><div className="homepage-cms-category-list">{sortItems(settings.directions).map((item) => <article key={item.id}><img src={item.img} alt="" /><div><input value={item.title} onChange={(event) => change((current) => ({ ...current, directions: updateItem(current.directions, item.id, { title: event.target.value }) }))} /><input value={item.href} onChange={(event) => change((current) => ({ ...current, directions: updateItem(current.directions, item.id, { href: event.target.value }) }))} /></div><Visibility visible={item.visible} onClick={() => change((current) => ({ ...current, directions: updateItem(current.directions, item.id, { visible: !item.visible }) }))} /><AdminImagePicker label="" value={item.img} onChange={(value) => change((current) => ({ ...current, directions: updateItem(current.directions, item.id, { img: value }) }))} /></article>)}</div></div>
      </section>

      <section className="homepage-cms-split homepage-cms-lower">
        <div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Информационный блок</h2><small>Собственное производство</small></div><Visibility visible={settings.productionSection.enabled} onClick={() => patchSection('productionSection', { enabled: !settings.productionSection.enabled })} /></div><div className="homepage-cms-info-edit"><AdminImagePicker label="Изображение" value={settings.productionSection.image} onChange={(value) => patchSection('productionSection', { image: value })} /><div><Field label="Метка" value={settings.productionSection.eyebrow} onChange={(value) => patchSection('productionSection', { eyebrow: value })} /><Field label="Заголовок" value={settings.productionSection.title} onChange={(value) => patchSection('productionSection', { title: value })} /><Field label="Описание" value={settings.productionSection.text} rows={4} onChange={(value) => patchSection('productionSection', { text: value })} /></div></div></div>
        <div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Структура страницы</h2><small>{visibleSections} из {settings.layout.length} блоков отображается</small></div></div><div className="homepage-cms-section-list">{sortItems(settings.layout).map((section) => <article key={section.id}><GripVertical size={17} /><span>{section.label}</span><Visibility locked={section.locked} visible={section.visible} onClick={() => patchLayout(section)} /><button type="button" onClick={() => change((current) => ({ ...current, layout: moveItem(current.layout, section.id, -1) }))}><ArrowUp size={15} /></button><button type="button" onClick={() => change((current) => ({ ...current, layout: moveItem(current.layout, section.id, 1) }))}><ArrowDown size={15} /></button></article>)}</div></div>
      </section>

      <section className="homepage-cms-split homepage-cms-lower"><div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Популярные товары</h2><small>Товары отображаются из каталога</small></div><Visibility visible={settings.productsSection.enabled} onClick={() => patchSection('productsSection', { enabled: !settings.productsSection.enabled })} /></div><div className="homepage-cms-fields two"><Field label="Заголовок" value={settings.productsSection.title} onChange={(value) => patchSection('productsSection', { title: value })} /><Field label="Количество товаров" value={String(settings.productsSection.limit)} onChange={(value) => patchSection('productsSection', { limit: Math.max(1, Math.min(8, Number(value) || 4)) })} /><Field label="Кнопка" value={settings.productsSection.buttonLabel} onChange={(value) => patchSection('productsSection', { buttonLabel: value })} /><Field label="Ссылка" value={settings.productsSection.buttonHref} onChange={(value) => patchSection('productsSection', { buttonHref: value })} /></div></div><div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>CTA-блок</h2><small>Индивидуальный заказ</small></div><Visibility visible={settings.cta.enabled} onClick={() => patchSection('cta', { enabled: !settings.cta.enabled })} /></div><div className="homepage-cms-fields"><Field label="Заголовок" value={settings.cta.title} onChange={(value) => patchSection('cta', { title: value })} /><Field label="Описание" value={settings.cta.text} rows={3} onChange={(value) => patchSection('cta', { text: value })} /><Field label="Кнопка" value={settings.cta.primaryLabel} onChange={(value) => patchSection('cta', { primaryLabel: value })} /></div></div></section>
    </>}

    {tab === 'seo' && <section className="homepage-cms-seo"><div className="homepage-cms-card"><div className="homepage-cms-card-title"><div><h2>Поисковая оптимизация</h2><small>Настройки влияют только на главную страницу.</small></div></div><div className="homepage-cms-fields two"><Field label="SEO title" max={60} value={settings.seo.title} onChange={(value) => change((current) => ({ ...current, seo: { ...current.seo, title: value } }))} /><Field label="Canonical URL" value={settings.seo.canonical} onChange={(value) => change((current) => ({ ...current, seo: { ...current.seo, canonical: value } }))} /><Field label="Meta description" max={160} rows={4} value={settings.seo.description} onChange={(value) => change((current) => ({ ...current, seo: { ...current.seo, description: value } }))} /><AdminImagePicker label="Open Graph изображение" value={settings.seo.ogImage} onChange={(value) => change((current) => ({ ...current, seo: { ...current.seo, ogImage: value } }))} /></div><label className="homepage-cms-check"><input type="checkbox" checked={settings.seo.robotsIndex} onChange={(event) => change((current) => ({ ...current, seo: { ...current.seo, robotsIndex: event.target.checked } }))} /> Разрешить индексировать главную страницу</label></div><aside className="homepage-cms-google-preview"><small>Предпросмотр в поиске Google</small><b>{settings.seo.title || 'Заголовок страницы'}</b><span>{settings.seo.canonical}</span><p>{settings.seo.description || 'Описание страницы'}</p></aside><aside className="homepage-cms-og-preview"><img src={settings.seo.ogImage} alt="" /><div><small>bullmet.by</small><b>{settings.seo.ogTitle || settings.seo.title}</b><p>{settings.seo.ogDescription || settings.seo.description}</p></div></aside></section>}

    {tab === 'settings' && <section className="homepage-cms-settings"><div className="homepage-cms-card"><h2>Настройки отображения</h2><div className="homepage-cms-setting-row"><div><b>Автопрокрутка Hero</b><span>Автоматически переключать несколько слайдов</span></div><input type="checkbox" checked={settings.settings.heroAutoplay} onChange={(event) => change((current) => ({ ...current, settings: { ...current.settings, heroAutoplay: event.target.checked } }))} /></div><div className="homepage-cms-setting-row"><div><b>Интервал автопрокрутки</b><span>От 3 до 10 секунд</span></div><input type="number" min="3000" max="10000" step="1000" value={settings.settings.heroInterval} onChange={(event) => change((current) => ({ ...current, settings: { ...current.settings, heroInterval: Number(event.target.value) || 5000 } }))} /></div><div className="homepage-cms-setting-row"><div><b>Точки навигации</b><span>Показывать количество Hero-слайдов</span></div><input type="checkbox" checked={settings.settings.showDots} onChange={(event) => change((current) => ({ ...current, settings: { ...current.settings, showDots: event.target.checked } }))} /></div><div className="homepage-cms-setting-row"><div><b>Стрелки навигации</b><span>Показывать стрелки при нескольких слайдах</span></div><input type="checkbox" checked={settings.settings.showArrows} onChange={(event) => change((current) => ({ ...current, settings: { ...current.settings, showArrows: event.target.checked } }))} /></div><div className="homepage-cms-setting-row"><div><b>Ленивая загрузка изображений</b><span>Ускоряет первоначальную загрузку страницы</span></div><input type="checkbox" checked={settings.settings.lazyImages} onChange={(event) => change((current) => ({ ...current, settings: { ...current.settings, lazyImages: event.target.checked } }))} /></div></div></section>}

    <footer className="homepage-cms-savebar"><div>{dirty ? <><b>Несохранённые изменения</b><span>Проверьте изменения и опубликуйте их.</span></> : <><b>Все изменения сохранены</b><span>Главная страница опубликована.</span></>}</div><div><button type="button" onClick={reset}><RotateCcw size={17} /> Сбросить</button><button type="button" onClick={save} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем…' : 'Сохранить изменения'}</button></div></footer>
  </div>;
}
