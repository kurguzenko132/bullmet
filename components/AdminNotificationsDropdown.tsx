'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminNotification,
  markAdminNotificationReadAsync,
  markAllAdminNotificationsReadAsync,
  readAdminNotificationsAsync,
  subscribeAdminNotifications,
} from '../lib/adminNotifications';


function BellGlyph() {
  return <svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>;
}

function shortDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return value;
  }
}

function typeLabel(type: AdminNotification['type']) {
  if (type === 'order') return 'Заказ';
  if (type === 'request') return 'Заявка';
  if (type === 'review') return 'Отзыв';
  return 'Система';
}

export function AdminNotificationsDropdown() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      setItems(await readAdminNotificationsAsync(60));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const unsubscribe = subscribeAdminNotifications(load);
    const timer = window.setInterval(load, 30000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = useMemo(() => items.filter((item) => item.status === 'unread').length, [items]);
  const visibleItems = items.slice(0, 8);

  async function markAll() {
    setItems(await markAllAdminNotificationsReadAsync());
  }

  async function clickItem(item: AdminNotification) {
    if (item.status === 'unread') {
      setItems(await markAdminNotificationReadAsync(item.id));
    }
    setOpen(false);
  }

  return (
    <div className="adminBellWrap" ref={rootRef}>
      <button className="adminBell" type="button" aria-label="Уведомления" onClick={() => setOpen((current) => !current)}>
        <BellGlyph />
        {unreadCount > 0 && <em>{unreadCount > 9 ? '9+' : unreadCount}</em>}
      </button>

      {open && (
        <div className="adminNotificationsPanel">
          <div className="adminNotificationsPanel__head">
            <div>
              <b>Уведомления</b>
              <span>{unreadCount ? `${unreadCount} новых` : 'Новых нет'}</span>
            </div>
            <button type="button" onClick={markAll} disabled={!unreadCount}>Прочитать все</button>
          </div>

          <div className="adminNotificationsPanel__list">
            {loading && <div className="adminNotificationEmpty">Загружаем...</div>}
            {!loading && !visibleItems.length && <div className="adminNotificationEmpty">Пока нет событий. Новые заказы, заявки и отзывы появятся здесь.</div>}
            {visibleItems.map((item) => (
              <Link
                href={item.href || '/admin'}
                className={`adminNotificationItem ${item.status === 'unread' ? 'adminNotificationItem--unread' : ''}`}
                key={item.id}
                onClick={() => clickItem(item)}
              >
                <span className={`adminNotificationType adminNotificationType--${item.type}`}>{typeLabel(item.type)}</span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.body}</p>
                  <small>{shortDate(item.createdAt)}</small>
                </div>
              </Link>
            ))}
          </div>

          <Link className="adminNotificationsPanel__footer" href="/admin/notifications" onClick={() => setOpen(false)}>
            Открыть центр уведомлений
          </Link>
        </div>
      )}
    </div>
  );
}
