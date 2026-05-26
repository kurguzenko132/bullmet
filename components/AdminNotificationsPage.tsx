'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  AdminNotification,
  AdminNotificationType,
  createAdminNotification,
  markAdminNotificationReadAsync,
  markAllAdminNotificationsReadAsync,
  readAdminNotificationsAsync,
} from '../lib/adminNotifications';

type TelegramStatus = {
  telegramConfigured: boolean;
  hasBotToken: boolean;
  hasChatId: boolean;
  hasSiteUrl: boolean;
};

const typeFilters: Array<'all' | AdminNotificationType> = ['all', 'order', 'request', 'review', 'system'];
const statusFilters: Array<'all' | 'unread' | 'read'> = ['all', 'unread', 'read'];

function typeLabel(type: AdminNotificationType) {
  if (type === 'order') return 'Заказы';
  if (type === 'request') return 'Заявки';
  if (type === 'review') return 'Отзывы';
  return 'Система';
}

function statusLabel(status: 'all' | 'unread' | 'read') {
  if (status === 'unread') return 'Новые';
  if (status === 'read') return 'Прочитанные';
  return 'Все статусы';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | AdminNotificationType>('all');
  const [status, setStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setItems(await readAdminNotificationsAsync(160));
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch('/api/notify')
      .then((response) => response.json())
      .then((data) => setTelegramStatus(data as TelegramStatus))
      .catch(() => setTelegramStatus(null));
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = type === 'all' || item.type === type;
      const matchesStatus = status === 'all' || item.status === status;
      const haystack = `${item.title} ${item.body} ${item.href}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [items, query, type, status]);

  const unreadCount = items.filter((item) => item.status === 'unread').length;
  const requestsCount = items.filter((item) => item.type === 'request').length;
  const ordersCount = items.filter((item) => item.type === 'order').length;
  const reviewsCount = items.filter((item) => item.type === 'review').length;

  async function markAll() {
    setItems(await markAllAdminNotificationsReadAsync());
    setMessage('Все уведомления отмечены как прочитанные.');
  }

  async function markOne(id: string) {
    setItems(await markAdminNotificationReadAsync(id));
  }

  async function createTest() {
    setMessage('');
    await createAdminNotification({
      type: 'system',
      title: 'Тестовое уведомление Bullmet',
      body: 'Если Telegram подключен, это сообщение должно прийти в чат администратора.',
      href: '/admin/notifications',
      payload: { source: 'admin-test' },
    });
    await load();
    setMessage('Тестовое уведомление создано. Если переменные Telegram заполнены, проверь чат Telegram.');
  }

  return (
    <AdminLayout title="Уведомления">
      <main className="adminContent adminNotificationsPage">
        <div className="adminPageHead">
          <div>
            <p>События сайта и Telegram</p>
            <h2>Центр уведомлений</h2>
          </div>
          <div className="adminContentActions">
            <button className="adminSecondaryBtn" type="button" onClick={createTest}>Отправить тест</button>
            <button className="adminPrimaryBtn" type="button" onClick={markAll} disabled={!unreadCount}>Прочитать все</button>
          </div>
        </div>

        <div className="adminMiniStats">
          <div className="adminPanel"><span>Новые</span><b>{unreadCount}</b></div>
          <div className="adminPanel"><span>Заказы</span><b>{ordersCount}</b></div>
          <div className="adminPanel"><span>Заявки</span><b>{requestsCount}</b></div>
          <div className="adminPanel"><span>Отзывы</span><b>{reviewsCount}</b></div>
        </div>

        <section className={`adminPanel adminTelegramSetup ${telegramStatus?.telegramConfigured ? 'adminTelegramSetup--ready' : ''}`}>
          <div>
            <h3>{telegramStatus?.telegramConfigured ? 'Telegram-уведомления подключены' : 'Подключение Telegram'}</h3>
            <p>
              Новые заказы, быстрые заявки и отзывы на модерации будут попадать в этот центр уведомлений.
              Для сообщений в Telegram добавь переменные окружения на Vercel.
            </p>
          </div>
          <div className="adminTelegramChecklist">
            <span className={telegramStatus?.hasBotToken ? 'done' : ''}>TELEGRAM_BOT_TOKEN</span>
            <span className={telegramStatus?.hasChatId ? 'done' : ''}>TELEGRAM_CHAT_ID</span>
            <span className={telegramStatus?.hasSiteUrl ? 'done' : ''}>NEXT_PUBLIC_SITE_URL</span>
          </div>
        </section>

        <div className="adminPanel adminOrdersToolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по уведомлениям" />
          <select value={type} onChange={(event) => setType(event.target.value as 'all' | AdminNotificationType)}>
            <option value="all">Все события</option>
            {typeFilters.filter((item) => item !== 'all').map((item) => <option key={item} value={item}>{typeLabel(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | 'unread' | 'read')}>
            {statusFilters.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
          </select>
          <span>{filtered.length} событий</span>
        </div>

        {message && <div className="adminNotice">{message}</div>}

        <div className="adminNotificationFeed">
          {loading && <div className="adminPanel adminEmpty">Загружаем уведомления...</div>}
          {!loading && !filtered.length && <div className="adminPanel adminEmpty">Событий пока нет.</div>}
          {filtered.map((item) => (
            <article className={`adminPanel adminNotificationCard adminNotificationCard--${item.status}`} key={item.id}>
              <div className="adminNotificationCard__body">
                <span className={`adminNotificationType adminNotificationType--${item.type}`}>{typeLabel(item.type)}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>{formatDate(item.createdAt)}</small>
              </div>
              <div className="adminNotificationCard__actions">
                {item.href && <Link className="adminSecondaryBtn" href={item.href}>Открыть</Link>}
                {item.status === 'unread' && <button className="adminPrimaryBtn" type="button" onClick={() => markOne(item.id)}>Прочитано</button>}
              </div>
            </article>
          ))}
        </div>
      </main>
    </AdminLayout>
  );
}
