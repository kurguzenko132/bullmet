'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Image, LayoutTemplate, ListChecks, Package, RotateCcw, Save, Sparkles } from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import { defaultHomepageControl, type HomeControlSettings, type HomeIcon } from '@/lib/homepageControl';

const iconOptions: HomeIcon[] = ['factory', 'clock', 'materials', 'truck', 'shield', 'tools', 'search', 'request', 'hammer', 'package', 'spark', 'custom', 'ruler', 'calculator'];

type Tab = 'hero' | 'directions' | 'products' | 'steps' | 'gallery';

function patchArrayItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

function TextField({ label, value, onChange, textarea = false, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; rows?: number }) {
  return (
    <label className="admin-home-field">
      <span>{label}</span>
      {textarea
        ? <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={active ? 'admin-home-toggle is-on' : 'admin-home-toggle'} onClick={onClick}>
      {active ? <Eye size={17} /> : <EyeOff size={17} />}
      {active ? 'Включено' : 'Скрыто'}
    </button>
  );
}

export function AdminHomepageClient({ initialSettings }: { initialSettings: HomeControlSettings }) {
  const [settings, setSettings] = useState<HomeControlSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const enabledDirections = useMemo(() => settings.directions.filter((item) => item.visible).length, [settings.directions]);
  const enabledBlocks = useMemo(() => [
    settings.hero.enabled,
    settings.directionsSection.enabled,
    settings.productsSection.enabled,
    settings.productionSection.enabled,
    settings.stepsSection.enabled,
    settings.gallerySection.enabled,
    settings.cta.enabled
  ].filter(Boolean).length, [settings]);

  function patchHero(patch: Partial<HomeControlSettings['hero']>) {
    setSettings((current) => ({ ...current, hero: { ...current.hero, ...patch } }));
  }

  function patchDirectionsSection(patch: Partial<HomeControlSettings['directionsSection']>) {
    setSettings((current) => ({ ...current, directionsSection: { ...current.directionsSection, ...patch } }));
  }

  function patchProductsSection(patch: Partial<HomeControlSettings['productsSection']>) {
    setSettings((current) => ({ ...current, productsSection: { ...current.productsSection, ...patch } }));
  }

  function patchProductionSection(patch: Partial<HomeControlSettings['productionSection']>) {
    setSettings((current) => ({ ...current, productionSection: { ...current.productionSection, ...patch } }));
  }

  function patchStepsSection(patch: Partial<HomeControlSettings['stepsSection']>) {
    setSettings((current) => ({ ...current, stepsSection: { ...current.stepsSection, ...patch } }));
  }

  function patchGallerySection(patch: Partial<HomeControlSettings['gallerySection']>) {
    setSettings((current) => ({ ...current, gallerySection: { ...current.gallerySection, ...patch } }));
  }

  function patchCta(patch: Partial<HomeControlSettings['cta']>) {
    setSettings((current) => ({ ...current, cta: { ...current.cta, ...patch } }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/homepage-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить главную страницу.');

      setSettings(result.settings || settings);
      setMessage('Главная страница сохранена. Изменения будут видны на публичной главной.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setSettings(defaultHomepageControl);
    setMessage('Настройки главной сброшены локально. Нажмите “Сохранить”, чтобы записать их в Supabase.');
  }

  return (
    <div className="admin-home-editor">
      <section className="admin-home-editor-hero">
        <div>
          <p>Управление главной страницей</p>
          <h1>Главная Bullmet</h1>
          <span>Hero, главные переходы, популярные товары, производство, шаги, галерея и финальный CTA.</span>
        </div>
        <div className="admin-home-editor-actions">
          <Link href="/" target="_blank">Открыть главную ↗</Link>
          <button type="button" onClick={resetDefaults}><RotateCcw size={17} /> Сбросить</button>
          <button type="button" onClick={saveSettings} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </div>
      </section>

      {message && <div className="admin-home-message">{message}</div>}

      <section className="admin-home-summary">
        <article><b>{enabledBlocks}</b><span>активных блоков</span></article>
        <article><b>{enabledDirections}</b><span>переходов видно</span></article>
        <article><b>{settings.productsSection.limit}</b><span>товаров на главной</span></article>
        <article><b>{settings.gallery.filter((item) => item.visible).length}</b><span>фото производства</span></article>
      </section>

      <section className="admin-home-tabs">
        <button className={activeTab === 'hero' ? 'active' : ''} type="button" onClick={() => setActiveTab('hero')}><LayoutTemplate size={17} /> Hero</button>
        <button className={activeTab === 'directions' ? 'active' : ''} type="button" onClick={() => setActiveTab('directions')}><Sparkles size={17} /> Переходы</button>
        <button className={activeTab === 'products' ? 'active' : ''} type="button" onClick={() => setActiveTab('products')}><Package size={17} /> Товары / производство</button>
        <button className={activeTab === 'steps' ? 'active' : ''} type="button" onClick={() => setActiveTab('steps')}><ListChecks size={17} /> Шаги</button>
        <button className={activeTab === 'gallery' ? 'active' : ''} type="button" onClick={() => setActiveTab('gallery')}><Image size={17} /> Галерея / CTA</button>
      </section>

      {activeTab === 'hero' && (
        <section className="admin-home-grid">
          <div className="admin-home-card">
            <div className="admin-home-card-head">
              <h2>Hero-блок</h2>
              <ToggleButton active={settings.hero.enabled} onClick={() => patchHero({ enabled: !settings.hero.enabled })} />
            </div>
            <div className="admin-home-form-grid">
              <TextField label="Надзаголовок" value={settings.hero.kicker} onChange={(value) => patchHero({ kicker: value })} />
              <TextField label="Заголовок" value={settings.hero.title} onChange={(value) => patchHero({ title: value })} />
              <TextField label="Основной текст" value={settings.hero.text} onChange={(value) => patchHero({ text: value })} textarea rows={5} />
              <AdminImagePicker
                label="Главное изображение"
                value={settings.hero.image}
                onChange={(value) => patchHero({ image: value })}
                altValue={settings.hero.imageAlt}
                onAltChange={(value) => patchHero({ imageAlt: value })}
              />
              <TextField label="Текст кнопки" value={settings.hero.primaryLabel} onChange={(value) => patchHero({ primaryLabel: value })} />
              <TextField label="Ссылка кнопки" value={settings.hero.primaryHref} onChange={(value) => patchHero({ primaryHref: value })} />
            </div>
          </div>

          <div className="admin-home-preview">
            <img src={settings.hero.image} alt="" />
            <div>
              <span>{settings.hero.kicker}</span>
              <h2>{settings.hero.title}</h2>
              <p>{settings.hero.text}</p>
              <b>{settings.hero.primaryLabel}</b>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'directions' && (
        <section className="admin-home-card">
          <div className="admin-home-card-head">
            <div>
              <h2>Главные переходы и преимущества</h2>
              <span>Переходы на главной и строка доверия под hero.</span>
            </div>
            <ToggleButton active={settings.directionsSection.enabled} onClick={() => patchDirectionsSection({ enabled: !settings.directionsSection.enabled })} />
          </div>

          <div className="admin-home-form-grid admin-home-section-fields">
            <TextField label="Eyebrow" value={settings.directionsSection.eyebrow} onChange={(value) => patchDirectionsSection({ eyebrow: value })} />
            <TextField label="Заголовок" value={settings.directionsSection.title} onChange={(value) => patchDirectionsSection({ title: value })} />
            <TextField label="Описание" value={settings.directionsSection.text} onChange={(value) => patchDirectionsSection({ text: value })} />
            <TextField label="Кнопка" value={settings.directionsSection.buttonLabel} onChange={(value) => patchDirectionsSection({ buttonLabel: value })} />
            <TextField label="Ссылка кнопки" value={settings.directionsSection.buttonHref} onChange={(value) => patchDirectionsSection({ buttonHref: value })} />
          </div>

          <h3 className="admin-home-subtitle">Карточки переходов</h3>
          <div className="admin-home-list">
            {settings.directions.map((item) => (
              <article key={item.id}>
                <ToggleButton active={item.visible} onClick={() => setSettings((current) => ({ ...current, directions: patchArrayItem(current.directions, item.id, { visible: !item.visible }) }))} />
                <input value={item.title} onChange={(event) => setSettings((current) => ({ ...current, directions: patchArrayItem(current.directions, item.id, { title: event.target.value }) }))} />
                <AdminImagePicker label="Изображение карточки" value={item.img} onChange={(value) => setSettings((current) => ({ ...current, directions: patchArrayItem(current.directions, item.id, { img: value }) }))} />
                <input value={item.href} onChange={(event) => setSettings((current) => ({ ...current, directions: patchArrayItem(current.directions, item.id, { href: event.target.value }) }))} />
                <input type="number" value={item.order} onChange={(event) => setSettings((current) => ({ ...current, directions: patchArrayItem(current.directions, item.id, { order: Number(event.target.value) || item.order }) }))} />
              </article>
            ))}
          </div>

          <h3 className="admin-home-subtitle">Преимущества под hero</h3>
          <div className="admin-home-list is-compact">
            {settings.features.map((item) => (
              <article key={item.id}>
                <ToggleButton active={item.visible} onClick={() => setSettings((current) => ({ ...current, features: patchArrayItem(current.features, item.id, { visible: !item.visible }) }))} />
                <select value={item.icon} onChange={(event) => setSettings((current) => ({ ...current, features: patchArrayItem(current.features, item.id, { icon: event.target.value as HomeIcon }) }))}>
                  {iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                </select>
                <input value={item.text} onChange={(event) => setSettings((current) => ({ ...current, features: patchArrayItem(current.features, item.id, { text: event.target.value }) }))} />
                <input type="number" value={item.order} onChange={(event) => setSettings((current) => ({ ...current, features: patchArrayItem(current.features, item.id, { order: Number(event.target.value) || item.order }) }))} />
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'products' && (
        <section className="admin-home-grid">
          <div className="admin-home-card">
            <div className="admin-home-card-head">
              <h2>Популярные товары</h2>
              <ToggleButton active={settings.productsSection.enabled} onClick={() => patchProductsSection({ enabled: !settings.productsSection.enabled })} />
            </div>
            <div className="admin-home-form-grid">
              <TextField label="Eyebrow" value={settings.productsSection.eyebrow} onChange={(value) => patchProductsSection({ eyebrow: value })} />
              <TextField label="Заголовок" value={settings.productsSection.title} onChange={(value) => patchProductsSection({ title: value })} />
              <TextField label="Описание" value={settings.productsSection.text} onChange={(value) => patchProductsSection({ text: value })} />
              <TextField label="Кнопка" value={settings.productsSection.buttonLabel} onChange={(value) => patchProductsSection({ buttonLabel: value })} />
              <TextField label="Ссылка" value={settings.productsSection.buttonHref} onChange={(value) => patchProductsSection({ buttonHref: value })} />
              <label className="admin-home-field"><span>Количество товаров</span><input type="number" value={settings.productsSection.limit} onChange={(e) => patchProductsSection({ limit: Number(e.target.value) || 4 })} /></label>
              <label className="admin-home-checkbox"><input type="checkbox" checked={settings.productsSection.onlyClocks} onChange={(e) => patchProductsSection({ onlyClocks: e.target.checked })} /> Показывать только часы</label>
            </div>
          </div>

          <div className="admin-home-card">
            <div className="admin-home-card-head">
              <h2>Производственный блок</h2>
              <ToggleButton active={settings.productionSection.enabled} onClick={() => patchProductionSection({ enabled: !settings.productionSection.enabled })} />
            </div>
            <div className="admin-home-form-grid">
              <TextField label="Eyebrow" value={settings.productionSection.eyebrow} onChange={(value) => patchProductionSection({ eyebrow: value })} />
              <TextField label="Заголовок" value={settings.productionSection.title} onChange={(value) => patchProductionSection({ title: value })} />
              <TextField label="Текст" value={settings.productionSection.text} onChange={(value) => patchProductionSection({ text: value })} textarea rows={5} />
              <AdminImagePicker label="Фото производства" value={settings.productionSection.image} onChange={(value) => patchProductionSection({ image: value })} />
              <TextField label="Кнопка" value={settings.productionSection.buttonLabel} onChange={(value) => patchProductionSection({ buttonLabel: value })} />
              <TextField label="Ссылка" value={settings.productionSection.buttonHref} onChange={(value) => patchProductionSection({ buttonHref: value })} />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'steps' && (
        <section className="admin-home-card">
          <div className="admin-home-card-head">
            <div>
              <h2>Блок “Как мы работаем”</h2>
              <span>Заголовок, шаги и нижние преимущества.</span>
            </div>
            <ToggleButton active={settings.stepsSection.enabled} onClick={() => patchStepsSection({ enabled: !settings.stepsSection.enabled })} />
          </div>

          <div className="admin-home-form-grid admin-home-section-fields">
            <TextField label="Eyebrow" value={settings.stepsSection.eyebrow} onChange={(value) => patchStepsSection({ eyebrow: value })} />
            <TextField label="Заголовок" value={settings.stepsSection.title} onChange={(value) => patchStepsSection({ title: value })} />
            <TextField label="Описание" value={settings.stepsSection.text} onChange={(value) => patchStepsSection({ text: value })} />
          </div>

          <h3 className="admin-home-subtitle">Шаги</h3>
          <div className="admin-home-list is-steps">
            {settings.steps.map((item) => (
              <article key={item.id}>
                <ToggleButton active={item.visible} onClick={() => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { visible: !item.visible }) }))} />
                <input value={item.num} onChange={(event) => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { num: event.target.value }) }))} />
                <select value={item.icon} onChange={(event) => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { icon: event.target.value as HomeIcon }) }))}>
                  {iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                </select>
                <input value={item.title} onChange={(event) => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { title: event.target.value }) }))} />
                <input value={item.desc} onChange={(event) => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { desc: event.target.value }) }))} />
                <input type="number" value={item.order} onChange={(event) => setSettings((current) => ({ ...current, steps: patchArrayItem(current.steps, item.id, { order: Number(event.target.value) || item.order }) }))} />
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'gallery' && (
        <section className="admin-home-grid">
          <div className="admin-home-card">
            <div className="admin-home-card-head">
              <h2>Галерея производства</h2>
              <ToggleButton active={settings.gallerySection.enabled} onClick={() => patchGallerySection({ enabled: !settings.gallerySection.enabled })} />
            </div>
            <div className="admin-home-form-grid">
              <TextField label="Eyebrow" value={settings.gallerySection.eyebrow} onChange={(value) => patchGallerySection({ eyebrow: value })} />
              <TextField label="Заголовок" value={settings.gallerySection.title} onChange={(value) => patchGallerySection({ title: value })} />
              <TextField label="Кнопка" value={settings.gallerySection.buttonLabel} onChange={(value) => patchGallerySection({ buttonLabel: value })} />
              <TextField label="Ссылка" value={settings.gallerySection.buttonHref} onChange={(value) => patchGallerySection({ buttonHref: value })} />
            </div>
            <div className="admin-home-gallery-list">
              {settings.gallery.map((item) => (
                <article key={item.id}>
                  <img src={item.src} alt="" />
                  <ToggleButton active={item.visible} onClick={() => setSettings((current) => ({ ...current, gallery: patchArrayItem(current.gallery, item.id, { visible: !item.visible }) }))} />
                  <AdminImagePicker label="Фото галереи" value={item.src} onChange={(value) => setSettings((current) => ({ ...current, gallery: patchArrayItem(current.gallery, item.id, { src: value }) }))} />
                  <input value={item.title} onChange={(event) => setSettings((current) => ({ ...current, gallery: patchArrayItem(current.gallery, item.id, { title: event.target.value }) }))} />
                  <input value={item.note} onChange={(event) => setSettings((current) => ({ ...current, gallery: patchArrayItem(current.gallery, item.id, { note: event.target.value }) }))} />
                </article>
              ))}
            </div>
          </div>

          <div className="admin-home-card">
            <div className="admin-home-card-head">
              <h2>Финальный CTA</h2>
              <ToggleButton active={settings.cta.enabled} onClick={() => patchCta({ enabled: !settings.cta.enabled })} />
            </div>
            <div className="admin-home-form-grid">
              <TextField label="Eyebrow" value={settings.cta.eyebrow} onChange={(value) => patchCta({ eyebrow: value })} />
              <TextField label="Заголовок" value={settings.cta.title} onChange={(value) => patchCta({ title: value })} />
              <TextField label="Текст" value={settings.cta.text} onChange={(value) => patchCta({ text: value })} textarea rows={4} />
              <TextField label="Главная кнопка" value={settings.cta.primaryLabel} onChange={(value) => patchCta({ primaryLabel: value })} />
              <TextField label="Ссылка главной кнопки" value={settings.cta.primaryHref} onChange={(value) => patchCta({ primaryHref: value })} />
              <TextField label="Вторая кнопка" value={settings.cta.secondaryLabel} onChange={(value) => patchCta({ secondaryLabel: value })} />
              <TextField label="Ссылка второй кнопки" value={settings.cta.secondaryHref} onChange={(value) => patchCta({ secondaryHref: value })} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
