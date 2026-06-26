'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, DatabaseBackup, Download, FileJson, RefreshCw, ShieldAlert, Table } from 'lucide-react';
import type { AuditReport, BackupOverview, ExportType } from '@/lib/adminBackup';

type Props = {
  initialOverview: BackupOverview;
  initialAudit: AuditReport;
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

function auditIcon(status: string) {
  if (status === 'ok') return <CheckCircle2 size={19} />;
  if (status === 'bad') return <ShieldAlert size={19} />;
  return <AlertTriangle size={19} />;
}

function statusLabel(status: string) {
  if (status === 'ok') return 'OK';
  if (status === 'bad') return 'Проблема';
  return 'Проверить';
}

export function AdminBackupClient({ initialOverview, initialAudit }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [audit, setAudit] = useState(initialAudit);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<'all' | 'ok' | 'warn' | 'bad'>('all');

  const filteredAudit = useMemo(() => {
    return audit.items.filter((item) => activeStatus === 'all' || item.status === activeStatus);
  }, [audit.items, activeStatus]);

  const scoreClass = audit.score >= 80 ? 'is-good' : audit.score >= 55 ? 'is-warn' : 'is-bad';

  async function refreshBackup() {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/backup', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить аудит.');
      setOverview(data.overview);
      setAudit(data.audit);
      setMessage('Данные аудита обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить аудит.');
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
          <p>Резервные копии и аудит</p>
          <h1>Экспорт данных и проверка сайта</h1>
          <span>Выгружайте данные, проверяйте готовность админки и быстро находите проблемы перед запуском.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshBackup} disabled={refreshing}><RefreshCw size={17} /> {refreshing ? 'Проверяем...' : 'Обновить аудит'}</button>
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

      <section className="admin-backup-main-grid">
        <article className="admin-audit-score-card">
          <div className={`admin-audit-score ${scoreClass}`}>
            <b>{audit.score}</b>
            <span>/ 100</span>
          </div>
          <div>
            <h2>Готовность сайта</h2>
            <p>Оценка считается по настройкам, товарам, SEO, категориям, заказам, заявкам и журналу действий.</p>
            <small>Последняя проверка: {new Date(audit.generatedAt).toLocaleString('ru-RU')}</small>
          </div>
        </article>

        <article className="admin-backup-rules">
          <h2>Что стоит делать перед каждым крупным изменением</h2>
          <ol>
            <li>Скачать полную копию JSON.</li>
            <li>Отдельно выгрузить товары и заказы.</li>
            <li>Проверить аудит на красные проблемы.</li>
            <li>После деплоя проверить sitemap.xml и robots.txt.</li>
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

      <section className="admin-audit-section">
        <div className="admin-section-inline-head">
          <div>
            <p>Технический аудит</p>
            <h2>Проверка перед запуском</h2>
          </div>
          <div className="admin-audit-filters">
            {(['all', 'ok', 'warn', 'bad'] as const).map((status) => (
              <button key={status} type="button" className={activeStatus === status ? 'is-active' : ''} onClick={() => setActiveStatus(status)}>
                {status === 'all' ? 'Все' : statusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-audit-list">
          {filteredAudit.map((item) => (
            <article key={item.id} className={`is-${item.status}`}>
              <div>{auditIcon(item.status)}</div>
              <div>
                <b>{item.title}</b>
                <p>{item.message}</p>
              </div>
              {item.href && <Link href={item.href}>Открыть</Link>}
            </article>
          ))}
        </div>
      </section>

      <section className="admin-launch-checklist">
        <h2>Финальная проверка руками</h2>
        <div>
          <label><input type="checkbox" /> Главная открывается без ошибок</label>
          <label><input type="checkbox" /> Каталог показывает только разрешённые категории</label>
          <label><input type="checkbox" /> Скрытые услуги не видны клиенту</label>
          <label><input type="checkbox" /> Заказ из корзины попадает в админку</label>
          <label><input type="checkbox" /> Заявка на расчет попадает в админку</label>
          <label><input type="checkbox" /> Отзыв можно скрыть и вернуть</label>
          <label><input type="checkbox" /> Sitemap и robots открываются</label>
          <label><input type="checkbox" /> Роли manager/content_manager ограничены</label>
        </div>
      </section>
    </div>
  );
}
