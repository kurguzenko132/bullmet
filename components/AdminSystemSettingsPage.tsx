'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

type SystemSettings = {
  siteMode: 'public' | 'maintenance';
  orderMode: 'orders-and-requests' | 'requests-only';
  currency: string;
  city: string;
  deliveryText: string;
  warrantyText: string;
  enableStock: boolean;
  enableReviews: boolean;
  enableQuickOrder: boolean;
};

const STORAGE_KEY = 'bullmet-system-settings';

const defaults: SystemSettings = {
  siteMode: 'public',
  orderMode: 'orders-and-requests',
  currency: 'BYN',
  city: 'Минск',
  deliveryText: 'Самовывоз или доставка по Беларуси после согласования с менеджером.',
  warrantyText: 'Проверяем изделие перед передачей и помогаем с вопросами после покупки.',
  enableStock: true,
  enableReviews: true,
  enableQuickOrder: true,
};

function readSettings(): SystemSettings {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => setSettings(readSettings()), []);

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('bullmet-system-settings-updated'));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <AdminLayout title="Системные настройки">
      <main className="adminContent adminSystemSettingsPage">
        <div className="adminPageHead">
          <div>
            <p>Настройки / Система</p>
            <h2>Режим сайта, заказы, валюта и интеграции</h2>
          </div>
          <button className="adminPrimaryBtn" type="button" onClick={save}>{saved ? 'Сохранено' : 'Сохранить'}</button>
        </div>

        <section className="adminCard adminSystemGrid">
          <label>Режим сайта
            <select value={settings.siteMode} onChange={(event) => setSettings((s) => ({ ...s, siteMode: event.target.value as SystemSettings['siteMode'] }))}>
              <option value="public">Публичный</option>
              <option value="maintenance">Технические работы</option>
            </select>
          </label>
          <label>Режим заказов
            <select value={settings.orderMode} onChange={(event) => setSettings((s) => ({ ...s, orderMode: event.target.value as SystemSettings['orderMode'] }))}>
              <option value="orders-and-requests">Корзина + заявки</option>
              <option value="requests-only">Только заявки</option>
            </select>
          </label>
          <label>Валюта
            <input value={settings.currency} onChange={(event) => setSettings((s) => ({ ...s, currency: event.target.value }))} />
          </label>
          <label>Город по умолчанию
            <input value={settings.city} onChange={(event) => setSettings((s) => ({ ...s, city: event.target.value }))} />
          </label>
          <label className="wide">Текст доставки
            <textarea value={settings.deliveryText} onChange={(event) => setSettings((s) => ({ ...s, deliveryText: event.target.value }))} />
          </label>
          <label className="wide">Текст гарантии
            <textarea value={settings.warrantyText} onChange={(event) => setSettings((s) => ({ ...s, warrantyText: event.target.value }))} />
          </label>
        </section>

        <section className="adminCard adminSystemToggles">
          <label><input type="checkbox" checked={settings.enableStock} onChange={(event) => setSettings((s) => ({ ...s, enableStock: event.target.checked }))} /> Показывать наличие</label>
          <label><input type="checkbox" checked={settings.enableReviews} onChange={(event) => setSettings((s) => ({ ...s, enableReviews: event.target.checked }))} /> Включить отзывы</label>
          <label><input type="checkbox" checked={settings.enableQuickOrder} onChange={(event) => setSettings((s) => ({ ...s, enableQuickOrder: event.target.checked }))} /> Включить «Купить в 1 клик»</label>
        </section>

        <section className="adminCard adminSystemChecklist">
          <h3>Проверка интеграций</h3>
          <p><b>Supabase:</b> {isSupabaseConfigured ? 'подключен' : 'не подключен'}</p>
          <p><b>Telegram:</b> проверь переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в Vercel.</p>
          <p><b>Фото товаров:</b> подготовленные изображения лежат в `public/assets/products_black`, `products_grey`, `products_white`.</p>
        </section>
      </main>
    </AdminLayout>
  );
}
