'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { defaultBannerControl, type BannerControlSettings, type BannerItem } from '@/lib/adminContent';

function emptyBanner(): BannerItem {
  return {
    id: `banner-${Date.now()}`,
    title: 'Новый баннер',
    text: 'Текст баннера',
    image: '/mockup/cat-clock.jpg',
    href: '/catalog',
    buttonLabel: 'Подробнее',
    visible: true,
    placement: 'home_top',
    order: 100
  };
}

function patchBanner(items: BannerItem[], id: string, patch: Partial<BannerItem>) {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

export function AdminBannersClient({ initialSettings, supabaseConfigured }: { initialSettings: BannerControlSettings; supabaseConfigured: boolean }) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeId, setActiveId] = useState(initialSettings.banners[0]?.id || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => settings.banners.find((item) => item.id === activeId) || settings.banners[0], [settings.banners, activeId]);
  const visibleCount = settings.banners.filter((item) => item.visible).length;

  function setBanner(id: string, patch: Partial<BannerItem>) {
    setSettings((current) => ({ ...current, banners: patchBanner(current.banners, id, patch) }));
  }

  function addBanner() {
    const banner = emptyBanner();
    setSettings((current) => ({ ...current, banners: [...current.banners, banner] }));
    setActiveId(banner.id);
  }

  function removeBanner(id: string) {
    if (!confirm('Удалить баннер?')) return;
    setSettings((current) => ({ ...current, banners: current.banners.filter((item) => item.id !== id) }));
    if (activeId === id) setActiveId('');
  }

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось сохранить баннеры.');
      setSettings(data.settings || settings);
      setMessage('Баннеры сохранены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить баннеры.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-banners-page">
      <div className="admin-page-head">
        <div>
          <p>Баннеры и акции</p>
          <h1>Промо-блоки сайта</h1>
          <span>Заготовка для управления баннерами на главной, в каталоге и карточке товара.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={addBanner}><Plus size={17} /> Добавить</button>
          <button type="button" onClick={() => setSettings(defaultBannerControl)}><RotateCcw size={17} /> Сбросить</button>
          <button type="button" onClick={saveSettings} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: баннеры не сохранятся в базу.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-banner-summary">
        <article><b>{settings.banners.length}</b><span>баннеров всего</span></article>
        <article><b>{visibleCount}</b><span>видимых</span></article>
        <article><b>{settings.enabled ? 'ON' : 'OFF'}</b><span>показ на сайте</span></article>
        <label>
          <input type="checkbox" checked={settings.enabled} onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))} />
          Включить баннеры на сайте
        </label>
      </section>

      <section className="admin-banners-layout">
        <div className="admin-banners-list">
          {settings.banners.map((banner) => (
            <button key={banner.id} type="button" className={active?.id === banner.id ? 'is-active' : ''} onClick={() => setActiveId(banner.id)}>
              <img src={banner.image} alt="" />
              <div>
                <b>{banner.title}</b>
                <span>{banner.placement} · {banner.visible ? 'виден' : 'скрыт'}</span>
              </div>
            </button>
          ))}
        </div>

        {active && (
          <article className="admin-banner-editor">
            <div className="admin-banner-preview">
              <img src={active.image} alt="" />
              <div>
                <span>{active.placement}</span>
                <h2>{active.title}</h2>
                <p>{active.text}</p>
                <b>{active.buttonLabel}</b>
              </div>
            </div>

            <div className="admin-banner-form">
              <label>ID<input value={active.id} onChange={(event) => setBanner(active.id, { id: event.target.value })} /></label>
              <label>Заголовок<input value={active.title} onChange={(event) => setBanner(active.id, { title: event.target.value })} /></label>
              <label className="span-2">Текст<textarea rows={3} value={active.text} onChange={(event) => setBanner(active.id, { text: event.target.value })} /></label>
              <label className="span-2">Изображение<input value={active.image} onChange={(event) => setBanner(active.id, { image: event.target.value })} /></label>
              <label>Ссылка<input value={active.href} onChange={(event) => setBanner(active.id, { href: event.target.value })} /></label>
              <label>Кнопка<input value={active.buttonLabel} onChange={(event) => setBanner(active.id, { buttonLabel: event.target.value })} /></label>
              <label>Место показа
                <select value={active.placement} onChange={(event) => setBanner(active.id, { placement: event.target.value as BannerItem['placement'] })}>
                  <option value="home_top">Главная сверху</option>
                  <option value="catalog_top">Каталог сверху</option>
                  <option value="product_bottom">Карточка товара снизу</option>
                </select>
              </label>
              <label>Порядок<input type="number" value={active.order} onChange={(event) => setBanner(active.id, { order: Number(event.target.value) || 100 })} /></label>
              <label>Дата начала<input type="datetime-local" value={active.startsAt?.slice(0, 16) || ''} onChange={(event) => setBanner(active.id, { startsAt: event.target.value })} /></label>
              <label>Дата окончания<input type="datetime-local" value={active.endsAt?.slice(0, 16) || ''} onChange={(event) => setBanner(active.id, { endsAt: event.target.value })} /></label>
            </div>

            <div className="admin-banner-actions">
              <button type="button" onClick={() => setBanner(active.id, { visible: !active.visible })}>
                {active.visible ? <EyeOff size={17} /> : <Eye size={17} />}
                {active.visible ? 'Скрыть' : 'Показать'}
              </button>
              <Link href={active.href} target="_blank">Открыть ссылку ↗</Link>
              <button type="button" onClick={() => removeBanner(active.id)}><Trash2 size={17} />Удалить</button>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
