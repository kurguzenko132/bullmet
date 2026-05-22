'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from './AdminLayout';
import { AdminRequest, AdminRequestStatus, formatDateTime, readAdminRequestsAsync, updateAdminRequestStatusAsync } from './adminBusinessStore';

const statuses: AdminRequestStatus[] = ['Новая', 'В работе', 'Расчет отправлен', 'Заказ принят', 'Закрыта'];

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Все статусы');
  const [opened, setOpened] = useState<string | null>(null);

  useEffect(() => {
    readAdminRequestsAsync().then(setRequests);
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const haystack = `${request.id} ${request.customer.name} ${request.customer.phone} ${request.type} ${request.material} ${request.productTitle ?? ''}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesStatus = status === 'Все статусы' || request.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [requests, query, status]);

  const newCount = filtered.filter((request) => request.status === 'Новая').length;
  const workCount = filtered.filter((request) => ['В работе', 'Расчет отправлен'].includes(request.status)).length;

  async function changeStatus(id: string, nextStatus: AdminRequestStatus) {
    setRequests(await updateAdminRequestStatusAsync(id, nextStatus));
  }

  return (
    <AdminLayout title="Заявки">
      <main className="adminContent">
        <div className="adminPageHead">
          <div>
            <p>Расчеты и индивидуальные заказы</p>
            <h2>Заявки на расчет</h2>
          </div>
          <Link className="adminSecondaryBtn" href="/request">Открыть форму заявки</Link>
        </div>

        <div className="adminMiniStats">
          <div className="adminPanel"><span>Всего заявок</span><b>{requests.length}</b></div>
          <div className="adminPanel"><span>Новые</span><b>{newCount}</b></div>
          <div className="adminPanel"><span>В работе</span><b>{workCount}</b></div>
        </div>

        <div className="adminPanel adminOrdersToolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, телефону, типу заявки" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Все статусы</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span>{filtered.length} заявок</span>
        </div>

        <div className="adminPanel adminEntityTable">
          <div className="adminEntityHeader adminEntityHeader--requests">
            <span>Заявка</span><span>Клиент</span><span>Тип</span><span>Материал</span><span>Статус</span><span></span>
          </div>
          {filtered.length === 0 ? <div className="adminEmpty">Заявки не найдены.</div> : filtered.map((request) => (
            <div className="adminEntityWrap" key={request.id}>
              <div className="adminEntityRow adminEntityRow--requests">
                <div><b>{request.id}</b><small>{formatDateTime(request.createdAt)}</small></div>
                <div><b>{request.customer.name}</b><small>{request.customer.phone}</small><small>{request.customer.city || 'Город не указан'}</small></div>
                <div><b>{request.type}</b>{request.productTitle && <small>Похожее: {request.productTitle}</small>}</div>
                <div><b>{request.material}</b>{request.sizes && <small>{request.sizes}</small>}</div>
                <select value={request.status} onChange={(event) => changeStatus(request.id, event.target.value as AdminRequestStatus)}>
                  {statuses.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="button" onClick={() => setOpened(opened === request.id ? null : request.id)}>{opened === request.id ? 'Скрыть' : 'Детали'}</button>
              </div>
              {opened === request.id && (
                <div className="adminEntityDetails">
                  <div>
                    <h4>Контакты</h4>
                    <p>{request.customer.name}</p>
                    <p>{request.customer.phone}</p>
                    {request.customer.email && <p>{request.customer.email}</p>}
                    {request.customer.city && <p>{request.customer.city}</p>}
                  </div>
                  <div>
                    <h4>Задача</h4>
                    <p>{request.comment}</p>
                    {request.sizes && <p>Размеры: {request.sizes}</p>}
                    {request.fileName && <p>Файл: {request.fileName}</p>}
                  </div>
                  <div>
                    <h4>Связь с товаром</h4>
                    {request.productTitle ? <p>{request.productTitle}</p> : <p>Не привязана к товару</p>}
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
