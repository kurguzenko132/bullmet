'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from './AdminLayout';
import { AdminOrder, AdminOrderStatus, ORDER_STATUSES, formatDateTime, readAdminOrdersAsync, updateAdminOrderAsync, updateAdminOrderStatusAsync } from './adminBusinessStore';

const statuses: AdminOrderStatus[] = ORDER_STATUSES;

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Все статусы');
  const [opened, setOpened] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  useEffect(() => {
    readAdminOrdersAsync().then(setOrders);
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const haystack = `${order.id} ${order.customer.name} ${order.customer.phone} ${order.customer.email ?? ''}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesStatus = status === 'Все статусы' || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  const totalRevenue = filtered.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = filtered.filter((order) => !['Завершен', 'Отменен'].includes(order.status)).length;

  async function changeStatus(id: string, nextStatus: AdminOrderStatus) {
    setOrders(await updateAdminOrderStatusAsync(id, nextStatus));
  }

  async function saveAdminNote(order: AdminOrder) {
    const adminNote = noteDrafts[order.id] ?? order.adminNote ?? '';
    setOrders(await updateAdminOrderAsync(order.id, { adminNote }));
    setSavedNoteId(order.id);
    window.setTimeout(() => setSavedNoteId(null), 1800);
  }

  return (
    <AdminLayout title="Заказы">
      <main className="adminContent">
        <div className="adminPageHead">
          <div>
            <p>Интернет-магазин</p>
            <h2>Заказы клиентов</h2>
          </div>
          <Link className="adminSecondaryBtn" href="/catalog">Открыть каталог</Link>
        </div>

        <div className="adminMiniStats">
          <div className="adminPanel"><span>Всего заказов</span><b>{orders.length}</b></div>
          <div className="adminPanel"><span>Активные</span><b>{activeOrders}</b></div>
          <div className="adminPanel"><span>Сумма в выборке</span><b>{totalRevenue} BYN</b></div>
        </div>

        <div className="adminPanel adminOrdersToolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по номеру, имени, телефону" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Все статусы</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span>{filtered.length} заказов</span>
        </div>

        <div className="adminPanel adminEntityTable">
          <div className="adminEntityHeader adminEntityHeader--orders">
            <span>Заказ</span><span>Клиент</span><span>Состав</span><span>Сумма</span><span>Статус</span><span></span>
          </div>
          {filtered.length === 0 ? <div className="adminEmpty">Заказы не найдены.</div> : filtered.map((order) => (
            <div className="adminEntityWrap" key={order.id}>
              <div className="adminEntityRow adminEntityRow--orders">
                <div><b>#{order.id}</b><small>{formatDateTime(order.createdAt)}</small></div>
                <div><b>{order.customer.name}</b><small>{order.customer.phone}</small><small>{order.customer.city || 'Город не указан'}</small></div>
                <div><b>{order.items.length} поз.</b><small>{order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</small>{order.adminNote && <em className="adminClientNotePill">есть ответ клиенту</em>}</div>
                <strong>{order.total} BYN</strong>
                <select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value as AdminOrderStatus)}>
                  {statuses.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="button" onClick={() => setOpened(opened === order.id ? null : order.id)}>{opened === order.id ? 'Скрыть' : 'Детали'}</button>
              </div>
              {opened === order.id && (
                <div className="adminEntityDetails">
                  <div>
                    <h4>Контакты</h4>
                    <p>{order.customer.name}</p>
                    <p>{order.customer.phone}</p>
                    {order.customer.email && <p>{order.customer.email}</p>}
                    {order.customer.city && <p>{order.customer.city}</p>}
                  </div>
                  <div>
                    <h4>Доставка</h4>
                    <p>{order.delivery}</p>
                    {order.comment && <p>{order.comment}</p>}
                  </div>
                  <div>
                    <h4>Товары</h4>
                    {order.items.map((item) => <p key={`${item.slug}-${item.size ?? 'default'}`}>{item.title}{item.size ? `, ${item.size}` : ''} — {item.quantity} × {item.price} BYN</p>)}
                  </div>
                  <div className="adminClientNoteEditor">
                    <h4>Комментарий для клиента</h4>
                    <textarea
                      value={noteDrafts[order.id] ?? order.adminNote ?? ''}
                      onChange={(event) => setNoteDrafts((drafts) => ({ ...drafts, [order.id]: event.target.value }))}
                      placeholder="Например: заказ принят, срок изготовления 3–4 дня, сумма к оплате 85 BYN."
                      rows={5}
                    />
                    <button className="adminSecondaryBtn" type="button" onClick={() => saveAdminNote(order)}>{savedNoteId === order.id ? 'Сохранено' : 'Сохранить комментарий'}</button>
                    <small>Этот текст клиент увидит в личном кабинете.</small>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </AdminLayout>
  );
}
