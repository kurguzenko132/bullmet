'use client';

import { useState } from 'react';
import { DatabaseBackup, FileJson, RefreshCw, Table } from 'lucide-react';
import type { BackupOverview, ExportType } from '@/lib/adminBackup';

type Props = {
  initialOverview: BackupOverview;
};

const exportItems: Array<{ type: ExportType; title: string; description: string; csv: boolean }> = [
  { type: 'all', title: 'Полная копия', description: 'Все основные данные сайта одним JSON-файлом.', csv: false },
  { type: 'products', title: 'Товары', description: 'Каталог товаров, цены, фото, статусы и SEO.', csv: true },
  { type: 'orders', title: 'Заказы', description: 'Заказы клиентов, товары, статусы и CRM-поля.', csv: true },
  { type: 'requests', title: 'Заявки', description: 'Заявки на расчет, услуги и быстрые обращения.', csv: true },
  { type: 'reviews', title: 'Отзывы', description: 'Отзывы, рейтинги, фото и статусы.', csv: true },
  { type: 'users', title: 'Пользователи', description: 'Профили, роли, телефоны и статусы.', csv: true },
  { type: 'settings', title: 'Настройки сайта', description: 'Главная, SEO, категории, баннеры и общие настройки.', csv: false },
  { type: 'pages', title: 'CMS-страницы', description: 'Страницы, созданные через супер-админку.', csv: true },
  { type: 'activity', title: 'Журнал действий', description: 'История изменений в админке.', csv: true }
];

export function AdminBackupClient({ initialOverview }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function refreshBackup() {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/backup', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить данные.');
      setOverview(data.overview);
      setMessage('Сводка экспорта обновлена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить данные.');
    } finally {
      setRefreshing(false);
    }
  }

  function exportUrl(type: ExportType, format: 'json' | 'csv') {
    return `/api/admin/export?type=${encodeURIComponent(type)}&format=${format}`;
  }

  return (
    <div className="admin-backup-page">
      <div className="admin-page-head">
        <div>
          <p>Экспорт данных</p>
          <h1>Резервные копии сайта</h1>
          <span>Выгружайте товары, заказы, заявки, страницы и настройки в JSON или CSV без доступа к коду.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshBackup} disabled={refreshing}><RefreshCw size={17} /> {refreshing ? 'Обновляем...' : 'Обновить данные'}</button>
          <a href="/api/admin/export?type=all&format=json"><DatabaseBackup size={17} /> Скачать полный JSON</a>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <section className="admin-backup-overview">
        <article><b>{overview.products}</b><span>товаров</span></article>
        <article><b>{overview.orders}</b><span>заказов</span></article>
        <article><b>{overview.requests}</b><span>заявок</span></article>
        <article><b>{overview.reviews}</b><span>отзывов</span></article>
        <article><b>{overview.users}</b><span>пользователей</span></article>
        <article><b>{overview.settings}</b><span>настроек</span></article>
        <article><b>{overview.pages}</b><span>CMS-страниц</span></article>
      </section>

      <section className="admin-backup-main-grid admin-backup-main-grid--export">
        <article className="admin-backup-rules">
          <h2>Как использовать экспорт</h2>
          <ol>
            <li>Перед массовым редактированием скачайте полную копию JSON.</li>
            <li>Для таблиц используйте CSV по товарам, заказам, заявкам и отзывам.</li>
            <li>Для восстановления настроек храните свежий JSON с настройками и CMS-страницами.</li>
          </ol>
        </article>
      </section>

      <section className="admin-export-section">
        <div className="admin-section-inline-head">
          <div>
            <p>Экспорт</p>
            <h2>Резервные копии данных</h2>
          </div>
          <span>JSON подходит для восстановления, CSV — для Excel/Google Sheets.</span>
        </div>

        <div className="admin-export-grid">
          {exportItems.map((item) => (
            <article key={item.type}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="admin-export-actions">
                <a href={exportUrl(item.type, 'json')}><FileJson size={16} /> JSON</a>
                {item.csv && <a href={exportUrl(item.type, 'csv')}><Table size={16} /> CSV</a>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
