'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, EyeOff, Globe2, Menu, Phone, RotateCcw, Save, Search, Settings2, ToggleLeft } from 'lucide-react';
import { AdminImagePicker } from '@/components/AdminImagePicker';
import { defaultSiteControl, type SiteControlSettings } from '@/lib/siteControl';

type Props = {
  initialSettings: SiteControlSettings;
  diagnostics: {
    supabaseConfigured: boolean;
    telegramConfigured: boolean;
    adminEmailConfigured: boolean;
    siteUrl: string;
  };
};

function updateArrayItem<T extends { [key: string]: any }>(items: T[], key: keyof T, value: T[keyof T], patch: Partial<T>) {
  return items.map((item) => item[key] === value ? { ...item, ...patch } : item);
}

export function AdminSiteSettingsClient({ initialSettings, diagnostics }: Props) {
  const [settings, setSettings] = useState<SiteControlSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'directions' | 'navigation' | 'seo'>('general');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const visibleDirections = useMemo(() => settings.directions.filter((item) => item.visible).length, [settings.directions]);
  const visibleNav = useMemo(() => settings.navigation.filter((item) => item.visible).length, [settings.navigation]);

  function patchGeneral(patch: Partial<SiteControlSettings['general']>) {
    setSettings((current) => ({ ...current, general: { ...current.general, ...patch } }));
  }

  function patchContacts(patch: Partial<SiteControlSettings['contacts']>) {
    setSettings((current) => ({ ...current, contacts: { ...current.contacts, ...patch } }));
  }

  function patchSeo(patch: Partial<SiteControlSettings['seo']>) {
    setSettings((current) => ({ ...current, seo: { ...current.seo, ...patch } }));
  }

  function patchDirection(key: string, patch: Partial<SiteControlSettings['directions'][number]>) {
    setSettings((current) => ({
      ...current,
      directions: updateArrayItem(current.directions, 'key', key as any, patch)
    }));
  }

  function patchNavigation(id: string, patch: Partial<SiteControlSettings['navigation'][number]>) {
    setSettings((current) => ({
      ...current,
      navigation: updateArrayItem(current.navigation, 'id', id as any, patch)
    }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/site-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сохранить настройки.');
      }

      setSettings(result.settings || settings);
      setMessage('Настройки сохранены. Публичный сайт использует эти данные в меню, футере, контактах и SEO.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setSettings(defaultSiteControl);
    setMessage('Настройки сброшены локально. Нажмите “Сохранить”, чтобы записать их в Supabase.');
  }

  return (
    <div className="admin-site-control">
      <section className="admin-site-control-hero">
        <div>
          <p>Фундамент управления сайтом</p>
          <h1>Настройки Bullmet</h1>
          <span>Контакты, видимые направления, меню и SEO — база для управления сайтом без кода.</span>
        </div>
        <div className="admin-site-control-actions">
          <Link href="/" target="_blank"><Globe2 size={17} /> Открыть сайт</Link>
          <button type="button" onClick={resetDefaults}><RotateCcw size={17} /> Сбросить</button>
          <button type="button" onClick={saveSettings} disabled={saving}><Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </div>
      </section>

      {message && <div className="admin-site-control-message">{message}</div>}

      <section className="admin-site-control-status">
        <article className={diagnostics.supabaseConfigured ? 'is-ok' : 'is-bad'}><b>Supabase</b><span>{diagnostics.supabaseConfigured ? 'подключен' : 'не подключен'}</span></article>
        <article className={diagnostics.telegramConfigured ? 'is-ok' : 'is-warn'}><b>Telegram</b><span>{diagnostics.telegramConfigured ? 'уведомления включены' : 'не настроен'}</span></article>
        <article className={diagnostics.adminEmailConfigured ? 'is-ok' : 'is-bad'}><b>Админ</b><span>{diagnostics.adminEmailConfigured ? 'email задан' : 'email не задан'}</span></article>
        <article><b>Направления</b><span>{visibleDirections} видно клиентам</span></article>
        <article><b>Меню</b><span>{visibleNav} активных пунктов</span></article>
      </section>

      <section className="admin-site-control-tabs">
        <button className={activeTab === 'general' ? 'active' : ''} type="button" onClick={() => setActiveTab('general')}><Settings2 size={17} /> Основное и контакты</button>
        <button className={activeTab === 'directions' ? 'active' : ''} type="button" onClick={() => setActiveTab('directions')}><ToggleLeft size={17} /> Видимость направлений</button>
        <button className={activeTab === 'navigation' ? 'active' : ''} type="button" onClick={() => setActiveTab('navigation')}><Menu size={17} /> Меню сайта</button>
        <button className={activeTab === 'seo' ? 'active' : ''} type="button" onClick={() => setActiveTab('seo')}><Search size={17} /> SEO</button>
      </section>

      {activeTab === 'general' && (
        <section className="admin-site-control-grid">
          <div className="admin-site-control-card">
            <div className="admin-site-control-card-head">
              <h2>Основные данные</h2>
              <span>Название, позиционирование и режим запуска</span>
            </div>
            <div className="admin-form-grid-two">
              <label>Название сайта<input value={settings.general.siteName} onChange={(e) => patchGeneral({ siteName: e.target.value })} /></label>
              <label>Текст логотипа<input value={settings.general.logoText} onChange={(e) => patchGeneral({ logoText: e.target.value })} /></label>
              <label>Подпись под логотипом<input value={settings.general.tagline} onChange={(e) => patchGeneral({ tagline: e.target.value })} /></label>
              <label>Позиционирование<input value={settings.general.positioning} onChange={(e) => patchGeneral({ positioning: e.target.value })} /></label>
              <label className="span-2">Режим публичного запуска
                <select value={settings.general.launchMode} onChange={(e) => patchGeneral({ launchMode: e.target.value as any })}>
                  <option value="clocks_only">Только часы</option>
                  <option value="mixed">Часы + выбранные направления</option>
                  <option value="all">Все направления</option>
                </select>
              </label>
            </div>
          </div>

          <div className="admin-site-control-card">
            <div className="admin-site-control-card-head">
              <h2>Контакты</h2>
              <span>Данные, которые должны попадать в футер, контакты и заявки</span>
            </div>
            <div className="admin-form-grid-two">
              <label>Телефон<input value={settings.contacts.phone} onChange={(e) => patchContacts({ phone: e.target.value })} /></label>
              <label>Email<input value={settings.contacts.email} onChange={(e) => patchContacts({ email: e.target.value })} /></label>
              <label className="span-2">Адрес<input value={settings.contacts.address} onChange={(e) => patchContacts({ address: e.target.value })} /></label>
              <label>Время работы<input value={settings.contacts.hours} onChange={(e) => patchContacts({ hours: e.target.value })} /></label>
              <label>Telegram<input value={settings.contacts.telegram} onChange={(e) => patchContacts({ telegram: e.target.value })} /></label>
              <label>Instagram<input value={settings.contacts.instagram} onChange={(e) => patchContacts({ instagram: e.target.value })} /></label>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'directions' && (
        <section className="admin-site-control-card">
          <div className="admin-site-control-card-head">
            <h2>Видимость направлений</h2>
            <span>Клиент видит только включённые направления. Остальные остаются подготовленными внутри проекта.</span>
          </div>
          <div className="admin-directions-table">
            {settings.directions.map((item) => (
              <article key={item.key} className={item.visible ? 'is-visible' : ''}>
                <button type="button" onClick={() => patchDirection(item.key, { visible: !item.visible })}>
                  {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <div>
                  <b>{item.title}</b>
                  <span>{item.note}</span>
                </div>
                <input type="number" value={item.order} onChange={(e) => patchDirection(item.key, { order: Number(e.target.value) || item.order })} />
                <input value={item.href} onChange={(e) => patchDirection(item.key, { href: e.target.value })} />
                <em>{item.visible ? 'Видно' : 'Скрыто'}</em>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'navigation' && (
        <section className="admin-site-control-card">
          <div className="admin-site-control-card-head">
            <h2>Меню сайта</h2>
            <span>Заготовка управления шапкой, мобильной панелью и футером.</span>
          </div>
          <div className="admin-nav-settings-list">
            {settings.navigation.map((item) => (
              <article key={item.id}>
                <button type="button" className={item.visible ? 'is-on' : ''} onClick={() => patchNavigation(item.id, { visible: !item.visible })}>
                  {item.visible ? <CheckCircle2 size={18} /> : <EyeOff size={18} />}
                </button>
                <select value={item.location} onChange={(e) => patchNavigation(item.id, { location: e.target.value as any })}>
                  <option value="header">Шапка</option>
                  <option value="mobile">Мобильное меню</option>
                  <option value="footer">Футер</option>
                </select>
                <input value={item.label} onChange={(e) => patchNavigation(item.id, { label: e.target.value })} />
                <input value={item.href} onChange={(e) => patchNavigation(item.id, { href: e.target.value })} />
                <input type="number" value={item.order} onChange={(e) => patchNavigation(item.id, { order: Number(e.target.value) || item.order })} />
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'seo' && (
        <section className="admin-site-control-grid">
          <div className="admin-site-control-card">
            <div className="admin-site-control-card-head">
              <h2>SEO по умолчанию</h2>
              <span>Базовые данные для страниц, sitemap и превью.</span>
            </div>
            <div className="admin-form-grid-two">
              <label className="span-2">Title<input value={settings.seo.defaultTitle} onChange={(e) => patchSeo({ defaultTitle: e.target.value })} /></label>
              <label className="span-2">Description<textarea rows={4} value={settings.seo.defaultDescription} onChange={(e) => patchSeo({ defaultDescription: e.target.value })} /></label>
              <div>
                <AdminImagePicker label="OG image" value={settings.seo.ogImage} onChange={(value) => patchSeo({ ogImage: value })} />
              </div>
              <label className="admin-checkbox-label"><input type="checkbox" checked={settings.seo.robotsIndex} onChange={(e) => patchSeo({ robotsIndex: e.target.checked })} /> Индексировать сайт</label>
            </div>
          </div>

          <div className="admin-site-control-card admin-launch-preview">
            <div className="admin-site-control-card-head">
              <h2>Где применяется</h2>
              <span>Эти данные уже используются публичным сайтом</span>
            </div>
            <ul>
              <li>Админка сохраняет данные в Supabase `site_settings`.</li>
              <li>Шапка, футер и мобильное меню читают активные пункты меню.</li>
              <li>Контакты попадают в футер, контактную страницу и формы заявок.</li>
              <li>SEO по умолчанию используется в layout, sitemap и CMS-страницах.</li>
              <li>Если данных нет, включаются безопасные значения по умолчанию.</li>
            </ul>
          </div>
        </section>
      )}

      <section className="admin-site-control-roadmap">
        <div><Phone size={20} /><b>Контакты</b><span>управление телефоном, адресом, временем работы</span></div>
        <div><ToggleLeft size={20} /><b>Видимость</b><span>включать направления по мере готовности</span></div>
        <div><Menu size={20} /><b>Меню</b><span>контроль шапки, футера и мобильной панели</span></div>
        <div><Search size={20} /><b>SEO</b><span>база для title, description и noindex</span></div>
      </section>
    </div>
  );
}
