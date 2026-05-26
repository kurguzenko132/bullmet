'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  AdminRequest,
  AdminRequestKind,
  AdminRequestStatus,
  formatDateTime,
  getRequestKindLabel,
  readAdminRequestsAsync,
  REQUEST_STATUSES,
  updateAdminRequestAsync,
  updateAdminRequestStatusAsync,
} from './adminBusinessStore';

const statuses: AdminRequestStatus[] = REQUEST_STATUSES;
const kinds: Array<'all' | AdminRequestKind> = ['all', 'quick_order', 'calculation', 'service', 'contact'];

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, '');
}

function whatsAppPhone(phone: string) {
  return phone.replace(/[^0-9]/g, '');
}

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Все статусы');
  const [kind, setKind] = useState<'all' | AdminRequestKind>('all');
  const [opened, setOpened] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  useEffect(() => {
    readAdminRequestsAsync().then(setRequests);
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const haystack = `${request.id} ${request.customer.name} ${request.customer.phone} ${request.customer.email ?? ''} ${request.type} ${request.material} ${request.productTitle ?? ''} ${request.comment}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesStatus = status === 'Все статусы' || request.status === status;
      const matchesKind = kind === 'all' || (request.kind ?? 'calculation') === kind;
      return matchesQuery && matchesStatus && matchesKind;
    });
  }, [requests, query, status, kind]);

  const newCount = requests.filter((request) => request.status === 'Новая').length;
  const quickCount = requests.filter((request) => request.kind === 'quick_order').length;
  const workCount = requests.filter((request) => ['В работе', 'Ожидает клиента', 'Расчет отправлен', 'Заказ принят', 'Изготавливается'].includes(request.status)).length;
  const filesCount = requests.filter((request) => request.fileUrls?.length || request.fileName).length;

  async function changeStatus(id: string, nextStatus: AdminRequestStatus) {
    setRequests(await updateAdminRequestStatusAsync(id, nextStatus));
  }

  async function saveAdminNote(request: AdminRequest) {
    const adminNote = noteDrafts[request.id] ?? request.adminNote ?? '';
    setRequests(await updateAdminRequestAsync(request.id, { adminNote }));
    setSavedNoteId(request.id);
    window.setTimeout(() => setSavedNoteId(null), 1800);
  }

  return (
    <AdminLayout title="Заявки">
      <main className="adminContent adminRequestsV2">
        <div className="adminPageHead">
          <div>
            <p>Быстрые заказы, расчеты и индивидуальные заявки</p>
            <h2>Заявки клиентов</h2>
          </div>
          <Link className="adminSecondaryBtn" href="/request">Открыть форму заявки</Link>
        </div>

        <div className="adminMiniStats adminMiniStats--requests">
          <div className="adminPanel"><span>Всего заявок</span><b>{requests.length}</b></div>
          <div className="adminPanel"><span>Быстрые заказы</span><b>{quickCount}</b></div>
          <div className="adminPanel"><span>Новые</span><b>{newCount}</b></div>
          <div className="adminPanel"><span>В работе</span><b>{workCount}</b></div>
          <div className="adminPanel"><span>С файлами</span><b>{filesCount}</b></div>
        </div>

        <div className="adminRequestTabs">
          {kinds.map((item) => (
            <button type="button" className={kind === item ? 'active' : ''} onClick={() => setKind(item)} key={item}>
              {item === 'all' ? 'Все' : getRequestKindLabel(item)}
            </button>
          ))}
        </div>

        <div className="adminPanel adminOrdersToolbar adminRequestsToolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, телефону, товару или задаче" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Все статусы</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span>{filtered.length} заявок</span>
        </div>

        <div className="adminRequestsList">
          {filtered.length === 0 ? <div className="adminPanel adminEmpty">Заявки не найдены.</div> : filtered.map((request) => {
            const requestKind = request.kind ?? 'calculation';
            const phone = normalizePhone(request.customer.phone);
            const whatsapp = whatsAppPhone(request.customer.phone);
            const openedNow = opened === request.id;
            return (
              <article className={`adminPanel adminRequestCard adminRequestCard--${requestKind}`} key={request.id}>
                <div className="adminRequestCard__main">
                  <div className="adminRequestBadgeCol">
                    <span className="adminRequestKind">{getRequestKindLabel(requestKind)}</span>
                    <b>{request.id}</b>
                    <small>{formatDateTime(request.createdAt)}</small>
                  </div>

                  {request.productImage && (
                    <div className="adminRequestProductThumb">
                      <Image src={request.productImage} alt={request.productTitle || 'Товар'} fill sizes="86px" />
                    </div>
                  )}

                  <div className="adminRequestInfo">
                    <h3>{request.productTitle || request.type}</h3>
                    <p>{request.productTitle ? request.type : request.comment || 'Описание не указано'}</p>
                    <div className="adminRequestMeta">
                      <span>{request.material}</span>
                      {request.sizes && <span>{request.sizes}</span>}
                      {request.quantity ? <span>{request.quantity} шт.</span> : null}
                      {request.productPrice ? <span>от {request.productPrice} BYN</span> : null}
                      {request.fileUrls?.length ? <span>{request.fileUrls.length} файл(ов)</span> : request.fileName ? <span>файл: {request.fileName}</span> : null}
                      {request.adminNote && <span>ответ клиенту</span>}
                    </div>
                  </div>

                  <div className="adminRequestCustomer">
                    <b>{request.customer.name || 'Клиент'}</b>
                    <a href={`tel:${phone}`}>{request.customer.phone}</a>
                    {request.customer.email && <a href={`mailto:${request.customer.email}`}>{request.customer.email}</a>}
                    {request.customer.city && <span>{request.customer.city}</span>}
                    {request.contactMethod && <em>Связь: {request.contactMethod}</em>}
                  </div>

                  <div className="adminRequestActions">
                    <select value={request.status} onChange={(event) => changeStatus(request.id, event.target.value as AdminRequestStatus)}>
                      {statuses.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <button type="button" onClick={() => setOpened(openedNow ? null : request.id)}>{openedNow ? 'Скрыть' : 'Детали'}</button>
                  </div>
                </div>

                {openedNow && (
                  <div className="adminRequestDetailsV2">
                    <div>
                      <h4>Быстрая связь</h4>
                      <div className="adminRequestContactButtons">
                        <a href={`tel:${phone}`}>Позвонить</a>
                        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
                        {request.customer.email && <a href={`mailto:${request.customer.email}`}>Email</a>}
                      </div>
                    </div>
                    <div>
                      <h4>Задача</h4>
                      <p>{request.comment || 'Комментарий не указан.'}</p>
                      {request.productSlug && <Link href={`/catalog/${request.productSlug}`} target="_blank">Открыть товар на сайте</Link>}
                    </div>
                    <div>
                      <h4>Файлы</h4>
                      {request.fileUrls?.length ? (
                        <div className="adminRequestFiles">
                          {request.fileUrls.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}>Файл {index + 1}</a>)}
                        </div>
                      ) : request.fileName ? <p>{request.fileName}</p> : <p>Файлы не прикреплены.</p>}
                    </div>
                    <div className="adminClientNoteEditor adminClientNoteEditor--request">
                      <h4>Комментарий для клиента</h4>
                      <textarea
                        value={noteDrafts[request.id] ?? request.adminNote ?? ''}
                        onChange={(event) => setNoteDrafts((drafts) => ({ ...drafts, [request.id]: event.target.value }))}
                        placeholder="Например: расчет готов — 120 BYN, срок изготовления 5 дней."
                        rows={5}
                      />
                      <button className="adminSecondaryBtn" type="button" onClick={() => saveAdminNote(request)}>{savedNoteId === request.id ? 'Сохранено' : 'Сохранить комментарий'}</button>
                      <small>Этот текст клиент увидит в личном кабинете.</small>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </AdminLayout>
  );
}
