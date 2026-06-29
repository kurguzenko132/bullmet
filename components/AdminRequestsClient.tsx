'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, Mail, Phone, Send, UserRound } from 'lucide-react';
import type { AdminRequest } from '@/lib/adminCommerce';
import { formatDate, money, priorityOptions, requestStatuses, statusClass } from '@/lib/adminCommerce';

type Filter = 'all' | 'Новая' | 'В работе' | 'Ожидает ответа' | 'Рассчитана' | 'Закрыта' | 'Отменена';


function priorityLabel(value?: string) {
  if (value === 'urgent') return 'Срочно';
  if (value === 'high') return 'Высокий';
  return 'Обычный';
}

function priorityClass(value?: string) {
  if (value === 'urgent') return 'is-urgent';
  if (value === 'high') return 'is-high';
  return 'is-normal';
}

function cleanPhone(value?: string) {
  return String(value || '').replace(/[^\d+]/g, '');
}

function telegramLink(phone?: string) {
  const digits = cleanPhone(phone).replace(/^\+/, '');
  return digits ? `https://t.me/+${digits}` : '';
}

function mailLink(email?: string, subject?: string) {
  return email ? `mailto:${email}?subject=${encodeURIComponent(subject || 'Bullmet')}` : '';
}

function kindLabel(kind?: string) {
  if (kind === 'quick_order') return 'Купить в 1 клик';
  if (kind === 'service') return 'Услуга';
  if (kind === 'contact') return 'Сообщение';
  return 'Расчет';
}

function customerLine(request: AdminRequest) {
  return [request.customer?.name, request.customer?.phone, request.customer?.email].filter(Boolean).join(' · ') || 'Клиент не указан';
}

function nowLabel() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function AdminRequestsClient({ initialRequests, supabaseConfigured }: { initialRequests: AdminRequest[]; supabaseConfigured: boolean }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(initialRequests[0]?.id || '');
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(nowLabel());

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();

    return requests.filter((request) => {
      const byStatus = filter === 'all' || request.status === filter;
      const haystack = [
        request.id,
        request.customer?.name,
        request.customer?.phone,
        request.customer?.email,
        request.type,
        request.product_title,
        request.material,
        request.sizes,
        request.comment,
        request.admin_note,
        request.priority,
        request.manager,
        request.follow_up_at,
        request.status
      ].filter(Boolean).join(' ').toLowerCase();
      return byStatus && (!clean || haystack.includes(clean));
    });
  }, [requests, filter, query]);

  const active = requests.find((request) => request.id === activeId) || filtered[0] || requests[0];
  const newCount = requests.filter((request) => request.status === 'Новая').length;
  const workCount = requests.filter((request) => ['В работе', 'Ожидает ответа'].includes(request.status || '')).length;
  const doneCount = requests.filter((request) => ['Рассчитана', 'Закрыта'].includes(request.status || '')).length;
  const filesCount = requests.reduce((sum, request) => sum + (request.file_urls?.length || 0), 0);
  const urgentCount = requests.filter((request) => request.priority === 'urgent' || request.priority === 'high').length;
  const followUpCount = requests.filter((request) => request.follow_up_at).length;

  async function refreshRequests() {
    setMessage('');
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/requests', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить список заявок.');
      const nextRequests = Array.isArray(data.requests) ? data.requests as AdminRequest[] : [];
      setRequests(nextRequests);
      setActiveId((current) => nextRequests.some((request) => request.id === current) ? current : nextRequests[0]?.id || '');
      setLastSync(nowLabel());
      setMessage('Заявки обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить список заявок.');
    } finally {
      setRefreshing(false);
    }
  }

  async function updateRequest(id: string, patch: Partial<Pick<AdminRequest, 'status' | 'admin_note' | 'priority' | 'follow_up_at' | 'manager'>>) {
    setMessage('');
    const previous = requests;
    setRequests((current) => current.map((request) => request.id === id ? { ...request, ...patch } : request));

    try {
      const response = await fetch(`/api/admin/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить заявку.');
      setLastSync(nowLabel());
      setMessage('Изменения сохранены.');
    } catch (error) {
      setRequests(previous);
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить заявку.');
    }
  }

  return (
    <div className="admin-commerce-page">
      <div className="admin-page-head">
        <div>
          <p>Заявки</p>
          <h1>Заявки и расчеты</h1>
          <span>Все обращения с форм, быстрых заказов, страницы услуг и контактов.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshRequests} disabled={refreshing}>{refreshing ? 'Обновляем...' : 'Обновить'}</button>
          <a href="/contacts" target="_blank">Тест заявки ↗</a>
          <a href="/admin/orders">Заказы</a>
        </div>
      </div>

      <section className="admin-sync-panel">
        <div>
          <b>{supabaseConfigured ? 'Supabase подключен' : 'Supabase не подключен'}</b>
          <span>{supabaseConfigured ? `Последняя синхронизация: ${lastSync}. Новые заявки появятся после нажатия “Обновить” или перезагрузки страницы.` : 'Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY / anon key, иначе заявки не будут сохраняться в админке.'}</span>
        </div>
        <button type="button" onClick={refreshRequests} disabled={refreshing}>{refreshing ? 'Ждём...' : 'Проверить новые заявки'}</button>
      </section>

      <section className="admin-commerce-stats admin-commerce-stats--crm">
        <article><span>Всего заявок</span><b>{requests.length}</b><em>{newCount} новых</em></article>
        <article><span>В работе</span><b>{workCount}</b><em>активная обработка</em></article>
        <article><span>Закрыто</span><b>{doneCount}</b><em>рассчитано/закрыто</em></article>
        <article><span>Файлы</span><b>{filesCount}</b><em>чертежи и вложения</em></article>
        <article><span>Приоритет</span><b>{urgentCount}</b><em>важные/срочные</em></article>
        <article><span>Напоминания</span><b>{followUpCount}</b><em>есть follow-up</em></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по клиенту, телефону, товару, комментарию или ID" />
        <div>
          {(['all', ...requestStatuses] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : item}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {!requests.length ? (
        <section className="admin-empty-commerce">
          <h2>Заявок пока нет</h2>
          <p>{supabaseConfigured ? 'Отправьте тестовую заявку через страницу контактов, затем нажмите “Проверить новые заявки”.' : 'Supabase не подключен, поэтому админка не может получить заявки из базы.'}</p>
          <div className="admin-empty-actions">
            <a href="/contacts" target="_blank">Проверить форму</a>
            <button type="button" onClick={refreshRequests} disabled={refreshing}>Обновить список</button>
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
            {filtered.map((request) => (
              <button key={request.id} type="button" className={active?.id === request.id ? 'is-active' : ''} onClick={() => setActiveId(request.id)}>
                <div>
                  <b>{request.type || kindLabel(request.kind)}</b>
                  <em className={statusClass(request.status)}>{request.status || 'Новая'}</em>
                </div>
                <span>{customerLine(request)}</span>
                <small>{formatDate(request.created_at)} · {request.id}</small>
                <i className={`admin-crm-priority ${priorityClass(request.priority)}`}>{priorityLabel(request.priority)}</i>
              </button>
            ))}
          </div>

          {active && (
            <article className="admin-commerce-detail">
              <div className="admin-commerce-detail-head">
                <div>
                  <p>{kindLabel(active.kind)}</p>
                  <h2>{active.type || 'Заявка'}</h2>
                  <span>{active.id} · {formatDate(active.created_at)}</span>
                </div>
                <select value={active.status || 'Новая'} onChange={(event) => updateRequest(active.id, { status: event.target.value })}>
                  {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <div className="admin-crm-pipeline">
                {requestStatuses.map((status) => (
                  <button key={status} type="button" className={active.status === status ? 'is-current' : ''} onClick={() => updateRequest(active.id, { status })}>
                    {status}
                  </button>
                ))}
              </div>

              <div className="admin-crm-management">
                <label>Приоритет
                  <select value={active.priority || 'normal'} onChange={(event) => updateRequest(active.id, { priority: event.target.value })}>
                    {priorityOptions.map((priority) => <option key={priority} value={priority}>{priorityLabel(priority)}</option>)}
                  </select>
                </label>
                <label>Ответственный
                  <input value={active.manager || ''} onChange={(event) => updateRequest(active.id, { manager: event.target.value })} placeholder="Имя менеджера" />
                </label>
                <label>Напомнить
                  <input type="datetime-local" value={active.follow_up_at ? active.follow_up_at.slice(0, 16) : ''} onChange={(event) => updateRequest(active.id, { follow_up_at: event.target.value })} />
                </label>
              </div>

              <div className="admin-customer-box admin-customer-box--crm">
                <h3>Клиент</h3>
                <p><UserRound size={15} /><b>Имя:</b> {active.customer?.name || 'не указано'}</p>
                <p><Phone size={15} /><b>Телефон:</b> {active.customer?.phone || 'не указан'}</p>
                <p><Mail size={15} /><b>Email:</b> {active.customer?.email || 'не указан'}</p>
                {active.contact_method && <p><Send size={15} /><b>Способ связи:</b> {active.contact_method}</p>}
                <div className="admin-crm-contact-actions">
                  {active.customer?.phone && <a href={`tel:${cleanPhone(active.customer.phone)}`}>Позвонить</a>}
                  {active.customer?.phone && <a href={telegramLink(active.customer.phone)} target="_blank">Telegram</a>}
                  {active.customer?.email && <a href={mailLink(active.customer.email, `Заявка Bullmet ${active.id}`)}>Email</a>}
                </div>
              </div>

              {active.product_title && (
                <div className="admin-request-product-box">
                  {active.product_image && <img src={active.product_image} alt="" />}
                  <div>
                    <h3>{active.product_title}</h3>
                    <p>{active.quantity ? `Количество: ${active.quantity}` : 'Количество не указано'}{active.product_price ? ` · ${money(Number(active.product_price))} BYN` : ''}</p>
                    {active.product_slug && <a href={`/product/${active.product_slug}`} target="_blank">Открыть товар ↗</a>}
                  </div>
                </div>
              )}

              <div className="admin-request-info-grid">
                <div><span>Материал</span><b>{active.material || 'не указан'}</b></div>
                <div><span>Размеры</span><b>{active.sizes || 'не указаны'}</b></div>
              </div>

              {active.comment && (
                <div className="admin-request-comment">
                  <h3>Комментарий</h3>
                  <p>{active.comment}</p>
                </div>
              )}

              {!!active.file_urls?.length && (
                <div className="admin-request-files">
                  <h3>Файлы</h3>
                  {active.file_urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">Файл {index + 1} ↗</a>)}
                </div>
              )}

              <label className="admin-note-field">
                Заметка администратора
                <textarea defaultValue={active.admin_note || ''} rows={4} onBlur={(event) => updateRequest(active.id, { admin_note: event.target.value })} placeholder="Например: посчитать два варианта — черный и белый" />
              </label>

              <div className="admin-crm-timeline">
                <h3>История обработки</h3>
                <p><Send size={15} /> Заявка создана: {formatDate(active.created_at)}</p>
                <p><CalendarClock size={15} /> Текущий статус: {active.status || 'Новая'}</p>
                {active.follow_up_at && <p><CalendarClock size={15} /> Напоминание: {formatDate(active.follow_up_at)}</p>}
                {active.manager && <p><UserRound size={15} /> Ответственный: {active.manager}</p>}
              </div>
            </article>
          )}
        </section>
      )}
    </div>
  );
}
