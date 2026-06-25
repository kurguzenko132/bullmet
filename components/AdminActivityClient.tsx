'use client';

import { useMemo, useState } from 'react';
import { Activity, Database, RefreshCw, Search } from 'lucide-react';
import type { AdminActivityItem } from '@/lib/adminPeople';
import { actionLabel } from '@/lib/adminPeople';
import { formatDate } from '@/lib/adminCommerce';

type Filter = 'all' | 'site_settings' | 'products' | 'orders' | 'requests' | 'product_reviews' | 'profiles';

function entityLabel(entity?: string) {
  const map: Record<string, string> = {
    site_settings: 'Настройки',
    products: 'Товары',
    orders: 'Заказы',
    requests: 'Заявки',
    product_reviews: 'Отзывы',
    profiles: 'Пользователи'
  };
  return map[String(entity || '')] || String(entity || 'Система');
}

function entityClass(entity?: string) {
  if (entity === 'orders') return 'is-orders';
  if (entity === 'requests') return 'is-requests';
  if (entity === 'products') return 'is-products';
  if (entity === 'product_reviews') return 'is-reviews';
  if (entity === 'profiles') return 'is-users';
  return 'is-settings';
}

function formatPayload(payload?: Record<string, unknown>) {
  if (!payload || !Object.keys(payload).length) return 'Нет деталей';
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return 'Детали недоступны';
  }
}

export function AdminActivityClient({ initialActivity, supabaseConfigured }: { initialActivity: AdminActivityItem[]; supabaseConfigured: boolean }) {
  const [activity, setActivity] = useState(initialActivity);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [activeId, setActiveId] = useState(initialActivity[0]?.id || '');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();

    return activity.filter((item) => {
      const byEntity = filter === 'all' || item.entity === filter;
      const haystack = [item.action, item.entity, item.entity_id, item.actor_email, JSON.stringify(item.payload || {})].filter(Boolean).join(' ').toLowerCase();
      return byEntity && (!clean || haystack.includes(clean));
    });
  }, [activity, filter, query]);

  const active = activity.find((item) => item.id === activeId) || filtered[0] || activity[0];

  const stats = useMemo(() => ({
    total: activity.length,
    settings: activity.filter((item) => item.entity === 'site_settings').length,
    orders: activity.filter((item) => item.entity === 'orders').length,
    requests: activity.filter((item) => item.entity === 'requests').length,
    users: activity.filter((item) => item.entity === 'profiles').length
  }), [activity]);

  async function refreshActivity() {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/activity', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить журнал.');
      const next = Array.isArray(data.activity) ? data.activity as AdminActivityItem[] : [];
      setActivity(next);
      setActiveId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || '');
      setMessage('Журнал обновлён.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить журнал.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="admin-activity-page">
      <div className="admin-page-head">
        <div>
          <p>Журнал действий</p>
          <h1>История изменений в админке</h1>
          <span>Здесь собираются изменения настроек, товаров, заказов, заявок, отзывов, баннеров и пользователей.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshActivity} disabled={refreshing}><RefreshCw size={17} /> {refreshing ? 'Обновляем...' : 'Обновить'}</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: журнал действий не загрузится.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-activity-stats">
        <article><Activity size={22} /><div><b>{stats.total}</b><span>всего действий</span></div></article>
        <article><Database size={22} /><div><b>{stats.settings}</b><span>настройки</span></div></article>
        <article><Database size={22} /><div><b>{stats.orders}</b><span>заказы</span></div></article>
        <article><Database size={22} /><div><b>{stats.requests}</b><span>заявки</span></div></article>
        <article><Database size={22} /><div><b>{stats.users}</b><span>пользователи</span></div></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по действию, объекту, ID или деталям" />
        <div>
          {(['all', 'site_settings', 'products', 'orders', 'requests', 'product_reviews', 'profiles'] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : entityLabel(item)}
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <section className="admin-empty-commerce">
          <h2>Журнал пуст</h2>
          <p>Сделайте изменение в админке: поменяйте статус заказа, сохраните настройки или обновите пользователя.</p>
        </section>
      ) : (
        <section className="admin-activity-layout">
          <div className="admin-activity-list">
            {filtered.map((item) => (
              <button key={item.id} type="button" className={active?.id === item.id ? 'is-active' : ''} onClick={() => setActiveId(item.id)}>
                <div>
                  <b>{actionLabel(item.action)}</b>
                  <em className={entityClass(item.entity)}>{entityLabel(item.entity)}</em>
                </div>
                <span>{item.entity_id || 'без ID'} · {item.actor_email || 'система'}</span>
                <small>{formatDate(item.created_at)}</small>
              </button>
            ))}
          </div>

          {active && (
            <article className="admin-activity-detail">
              <div className="admin-user-detail-head">
                <div>
                  <p>{entityLabel(active.entity)}</p>
                  <h2>{actionLabel(active.action)}</h2>
                  <span>{formatDate(active.created_at)}</span>
                </div>
                <em className={entityClass(active.entity)}>{active.entity}</em>
              </div>

              <div className="admin-activity-meta">
                <p><b>ID записи:</b> {active.id}</p>
                <p><b>Объект:</b> {active.entity}</p>
                <p><b>ID объекта:</b> {active.entity_id || 'не указан'}</p>
                <p><b>Автор:</b> {active.actor_email || 'система / API'}</p>
              </div>

              <div className="admin-activity-payload">
                <h3>Детали изменения</h3>
                <pre>{formatPayload(active.payload)}</pre>
              </div>
            </article>
          )}
        </section>
      )}
    </div>
  );
}
