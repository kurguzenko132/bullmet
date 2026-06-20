'use client';

import { useMemo, useState } from 'react';
import type { AdminOrder } from '@/lib/adminCommerce';
import { formatDate, money, orderStatuses, statusClass } from '@/lib/adminCommerce';

type Filter = 'all' | 'Новый' | 'В работе' | 'Ожидает оплаты' | 'Выполнен' | 'Отменён';

function customerLine(order: AdminOrder) {
  return [order.customer?.name, order.customer?.phone, order.customer?.email].filter(Boolean).join(' · ') || 'Клиент не указан';
}

function nowLabel() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function AdminOrdersClient({ initialOrders, supabaseConfigured }: { initialOrders: AdminOrder[]; supabaseConfigured: boolean }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(initialOrders[0]?.id || '');
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(nowLabel());

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();

    return orders.filter((order) => {
      const byStatus = filter === 'all' || order.status === filter;
      const haystack = [
        order.id,
        order.customer?.name,
        order.customer?.phone,
        order.customer?.email,
        order.status,
        order.delivery,
        order.comment,
        ...(order.items || []).map((item) => item.title)
      ].filter(Boolean).join(' ').toLowerCase();
      return byStatus && (!clean || haystack.includes(clean));
    });
  }, [orders, filter, query]);

  const active = orders.find((order) => order.id === activeId) || filtered[0] || orders[0];
  const totalRevenue = orders.filter((order) => order.status !== 'Отменён').reduce((sum, order) => sum + Number(order.total || 0), 0);
  const newCount = orders.filter((order) => order.status === 'Новый').length;
  const workCount = orders.filter((order) => ['В работе', 'Ожидает оплаты'].includes(order.status || '')).length;
  const doneCount = orders.filter((order) => order.status === 'Выполнен').length;

  async function refreshOrders() {
    setMessage('');
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить список заказов.');
      const nextOrders = Array.isArray(data.orders) ? data.orders as AdminOrder[] : [];
      setOrders(nextOrders);
      setActiveId((current) => nextOrders.some((order) => order.id === current) ? current : nextOrders[0]?.id || '');
      setLastSync(nowLabel());
      setMessage('Заказы обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить список заказов.');
    } finally {
      setRefreshing(false);
    }
  }

  async function updateOrder(id: string, patch: Partial<Pick<AdminOrder, 'status' | 'admin_note'>>) {
    setMessage('');
    const previous = orders;
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...patch } : order));

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить заказ.');
      setLastSync(nowLabel());
      setMessage('Изменения сохранены.');
    } catch (error) {
      setOrders(previous);
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить заказ.');
    }
  }

  return (
    <div className="admin-commerce-page">
      <div className="admin-page-head">
        <div>
          <p>Заказы</p>
          <h1>Заказы клиентов</h1>
          <span>Проверяйте новые заказы после оформления корзины, меняйте статусы и ведите заметки.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshOrders} disabled={refreshing}>{refreshing ? 'Обновляем...' : 'Обновить'}</button>
          <a href="/cart" target="_blank">Тест корзины ↗</a>
          <a href="/admin/requests">Заявки</a>
        </div>
      </div>

      <section className="admin-sync-panel">
        <div>
          <b>{supabaseConfigured ? 'Supabase подключен' : 'Supabase не подключен'}</b>
          <span>{supabaseConfigured ? `Последняя синхронизация: ${lastSync}. Новые заказы появятся после нажатия “Обновить” или перезагрузки страницы.` : 'Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY / anon key, иначе заказы будут уходить только в Telegram и не появятся в админке.'}</span>
        </div>
        <button type="button" onClick={refreshOrders} disabled={refreshing}>{refreshing ? 'Ждём...' : 'Проверить новые заказы'}</button>
      </section>

      <section className="admin-commerce-stats">
        <article><span>Всего заказов</span><b>{orders.length}</b><em>{newCount} новых</em></article>
        <article><span>В работе</span><b>{workCount}</b><em>активная обработка</em></article>
        <article><span>Выполнено</span><b>{doneCount}</b><em>закрытые сделки</em></article>
        <article><span>Оборот</span><b>{money(totalRevenue)}</b><em>BYN без отмененных</em></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по номеру, клиенту, телефону, email, товару или комментарию" />
        <div>
          {(['all', ...orderStatuses] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : item}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {!orders.length ? (
        <section className="admin-empty-commerce">
          <h2>Заказов пока нет</h2>
          <p>{supabaseConfigured ? 'Оформите тестовый заказ через корзину, затем нажмите “Проверить новые заказы”.' : 'Supabase не подключен, поэтому админка не может получить заказы из базы.'}</p>
          <div className="admin-empty-actions">
            <a href="/cart" target="_blank">Проверить корзину</a>
            <button type="button" onClick={refreshOrders} disabled={refreshing}>Обновить список</button>
          </div>
        </section>
      ) : !filtered.length ? (
        <section className="admin-empty-commerce">
          <h2>Ничего не найдено</h2>
          <p>Измените поиск или сбросьте фильтр статуса.</p>
          <button type="button" onClick={() => { setQuery(''); setFilter('all'); }}>Сбросить фильтры</button>
        </section>
      ) : (
        <section className="admin-commerce-layout">
          <div className="admin-commerce-list">
            {filtered.map((order) => (
              <button key={order.id} type="button" className={active?.id === order.id ? 'is-active' : ''} onClick={() => setActiveId(order.id)}>
                <div>
                  <b>{order.id}</b>
                  <em className={statusClass(order.status)}>{order.status || 'Новый'}</em>
                </div>
                <span>{customerLine(order)}</span>
                <small>{formatDate(order.created_at)} · {money(Number(order.total || 0))} BYN</small>
              </button>
            ))}
          </div>

          {active && (
            <article className="admin-commerce-detail">
              <div className="admin-commerce-detail-head">
                <div>
                  <p>Заказ</p>
                  <h2>{active.id}</h2>
                  <span>{formatDate(active.created_at)}</span>
                </div>
                <select value={active.status || 'Новый'} onChange={(event) => updateOrder(active.id, { status: event.target.value })}>
                  {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <div className="admin-customer-box">
                <h3>Клиент</h3>
                <p><b>Имя:</b> {active.customer?.name || 'не указано'}</p>
                <p><b>Телефон:</b> {active.customer?.phone || 'не указан'}</p>
                <p><b>Email:</b> {active.customer?.email || 'не указан'}</p>
                <p><b>Получение:</b> {active.delivery || 'не указано'}</p>
                {active.comment && <p><b>Комментарий:</b> {active.comment}</p>}
              </div>

              <div className="admin-order-items">
                <h3>Товары</h3>
                {(active.items || []).length ? (active.items || []).map((item, index) => (
                  <div key={`${item.slug}-${index}`}>
                    {item.image && <img src={item.image} alt="" />}
                    <div>
                      <b>{item.title}</b>
                      <span>{[item.size, item.material].filter(Boolean).join(' · ') || 'Без варианта'}</span>
                    </div>
                    <em>× {item.quantity || 1}</em>
                    <strong>{money(Number(item.price || 0) * Number(item.quantity || 1))} BYN</strong>
                  </div>
                )) : <p>Список товаров не передан.</p>}
                <footer>
                  <span>Итого</span>
                  <b>{money(Number(active.total || 0))} BYN</b>
                </footer>
              </div>

              <label className="admin-note-field">
                Заметка администратора
                <textarea defaultValue={active.admin_note || ''} rows={4} onBlur={(event) => updateOrder(active.id, { admin_note: event.target.value })} placeholder="Например: клиент просил перезвонить после 18:00" />
              </label>
            </article>
          )}
        </section>
      )}
    </div>
  );
}
