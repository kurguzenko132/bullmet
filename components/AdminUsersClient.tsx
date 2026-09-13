'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Ban, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleUserRound, Clock3, ExternalLink, KeyRound, Mail, Plus, RefreshCw, Search, ShieldCheck, ShieldOff, UserRound, UsersRound, X } from 'lucide-react';
import type { AdminActivityItem, AdminCustomerRecord, AdminProfile } from '@/lib/adminPeople';
import { adminRoles, type AdminRole, isStaffRole, roleClass, roleLabel } from '@/lib/adminPeople';

type RoleFilter = 'all' | AdminRole;
type StatusFilter = 'all' | 'active' | 'blocked';
type AccessFilter = 'all' | 'yes' | 'no';
type DetailTab = 'info' | 'activity' | 'related';
type EmployeeDraft = { full_name: string; email: string; phone: string; role: Exclude<AdminRole, 'customer'> };

const formatRegistration = (value?: string) => value ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '—';
const formatDateTime = (value?: string) => value ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Никогда';
const initials = (user?: AdminProfile) => (user?.full_name || user?.email || 'Пользователь').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'П';
const statusLabel = (status?: string | null) => String(status || 'active').toLowerCase() === 'blocked' ? 'Заблокирован' : 'Активен';
const roleCode = (role?: string | null) => String(role || 'customer').toUpperCase();

function relativeLogin(value?: string) {
  if (!value) return 'Никогда';
  const date = new Date(value); const diff = Math.max(0, Date.now() - date.getTime());
  if (diff < 86400000 && date.getDate() === new Date().getDate()) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  if (diff < 172800000) return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  const days = Math.floor(diff / 86400000);
  return days < 7 ? `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад` : formatRegistration(value);
}

function StatusBadge({ status }: { status?: string | null }) { const blocked = String(status || '').toLowerCase() === 'blocked'; return <em className={`admin-user-status-v2 ${blocked ? 'blocked' : 'active'}`}><i />{blocked ? 'Заблокирован' : 'Активен'}</em>; }
function Avatar({ user, large = false }: { user?: AdminProfile; large?: boolean }) { return <span className={`admin-user-avatar-v2 ${large ? 'large' : ''}`}>{initials(user)}</span>; }

export function AdminUsersClient({ initialUsers, activity, customers, supabaseConfigured }: { initialUsers: AdminProfile[]; activity: AdminActivityItem[]; customers: AdminCustomerRecord[]; supabaseConfigured: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState(''); const [debouncedQuery, setDebouncedQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all'); const [status, setStatus] = useState<StatusFilter>('all'); const [access, setAccess] = useState<AccessFilter>('all');
  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id || ''); const [detailTab, setDetailTab] = useState<DetailTab>('info');
  const [editing, setEditing] = useState(false); const [draft, setDraft] = useState<Partial<AdminProfile>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]); const [message, setMessage] = useState(''); const [refreshing, setRefreshing] = useState(false); const [employeeOpen, setEmployeeOpen] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedQuery(query), 300); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => setSelectedIds([]), [debouncedQuery, role, status, access]);

  const loginByUser = useMemo(() => {
    const map = new Map<string, string>();
    activity.forEach((item) => {
      const email = String(item.actor_email || '').toLowerCase();
      const action = String(item.action || '').toLowerCase();
      if (!email || (!action.includes('login') && !action.includes('вход'))) return;
      if (!map.has(email) && item.created_at) map.set(email, item.created_at);
    });
    return map;
  }, [activity]);
  const activeAdmins = users.filter((item) => item.role === 'admin' && item.status !== 'blocked');
  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    return users.filter((user) => {
      const staff = isStaffRole(user.role);
      const source = [user.full_name, user.email, user.phone, user.role, roleLabel(user.role)].filter(Boolean).join(' ').toLowerCase();
      return (!term || source.includes(term)) && (role === 'all' || user.role === role) && (status === 'all' || (status === 'blocked' ? user.status === 'blocked' : user.status !== 'blocked')) && (access === 'all' || access === 'yes' && staff || access === 'no' && !staff);
    });
  }, [users, debouncedQuery, role, status, access]);
  const selected = users.find((user) => user.id === selectedId) || filtered[0];
  const selectedActivity = useMemo(() => !selected ? [] : activity.filter((item) => item.actor_email && selected.email && item.actor_email.toLowerCase() === selected.email.toLowerCase()).slice(0, 8), [activity, selected]);
  const linkedCustomer = useMemo(() => !selected ? undefined : customers.find((customer) => customer.user_id === selected.id || customer.email?.toLowerCase() === selected.email?.toLowerCase()), [customers, selected]);
  const stats = useMemo(() => ({ total: users.length, active: users.filter((item) => item.status !== 'blocked').length, blocked: users.filter((item) => item.status === 'blocked').length, newUsers: users.filter((item) => item.created_at && Date.now() - new Date(item.created_at).getTime() <= 30 * 86400000).length }), [users]);
  const activeFilters = Boolean(query || role !== 'all' || status !== 'all' || access !== 'all');

  useEffect(() => { if (selected && selected.id !== selectedId) setSelectedId(selected.id); }, [selected, selectedId]);

  async function refreshUsers() {
    setRefreshing(true); setMessage('');
    try { const response = await fetch('/api/admin/users', { cache: 'no-store' }); const data = await response.json(); if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить пользователей.'); setUsers(data.users || []); setMessage('Список пользователей обновлён.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось обновить пользователей.'); }
    finally { setRefreshing(false); }
  }
  async function updateUser(id: string, patch: Partial<Pick<AdminProfile, 'role' | 'full_name' | 'phone' | 'status'>>) {
    const target = users.find((item) => item.id === id); const targetLosesAdmin = target?.role === 'admin' && (patch.role && patch.role !== 'admin' || patch.status === 'blocked');
    if (targetLosesAdmin && activeAdmins.length <= 1) { setMessage('Нельзя отключить последнего администратора системы.'); return false; }
    if (patch.role && target && patch.role !== target.role && !window.confirm(`Изменить роль пользователя «${target.full_name || target.email}» на «${roleLabel(patch.role)}»?`)) return false;
    setMessage(''); const previous = users; setUsers((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
    try { const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); const data = await response.json(); if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить пользователя.'); setMessage('Изменения сохранены.'); return true; }
    catch (error) { setUsers(previous); setMessage(error instanceof Error ? error.message : 'Не удалось обновить пользователя.'); return false; }
  }
  async function saveProfile() { if (!selected) return; const patch: Partial<Pick<AdminProfile, 'role' | 'full_name' | 'phone' | 'status'>> = { full_name: draft.full_name || '', phone: draft.phone || '', role: (draft.role || selected.role) as AdminRole, status: draft.status || selected.status || 'active' }; if (await updateUser(selected.id, patch)) setEditing(false); }
  async function bulkBlock() { if (!selectedIds.length) return; for (const id of selectedIds) await updateUser(id, { status: 'blocked' }); setSelectedIds([]); }
  function reset() { setQuery(''); setRole('all'); setStatus('all'); setAccess('all'); }
  function openUser(user: AdminProfile) { setSelectedId(user.id); setDetailTab('info'); setEditing(false); setDraft({}); }

  return <div className="admin-users-v2">
    <header className="admin-users-head-v2"><div><h1>Пользователи</h1><p>Управляйте аккаунтами сотрудников, ролями и доступом к системе.</p></div><div><button type="button" className="secondary" onClick={refreshUsers} disabled={refreshing}><RefreshCw size={16} className={refreshing ? 'spin' : ''}/>{refreshing ? 'Обновляем…' : 'Обновить'}</button><button type="button" className="primary" onClick={() => setEmployeeOpen(true)}><Plus size={18}/>Добавить сотрудника</button></div></header>
    {!supabaseConfigured && <div className="admin-users-notice-v2">Supabase не подключен: просмотр доступен, но изменения и приглашения не будут сохранены.</div>}
    {message && <div className="admin-users-notice-v2"><span>{message}</span><button onClick={() => setMessage('')}><X size={15}/></button></div>}
    <section className="admin-users-kpis-v2"><Kpi icon={<UsersRound/>} label="Всего пользователей" value={stats.total} note="в системе"/><Kpi icon={<CheckCircle2/>} label="Активных" value={stats.active} note="аккаунтов доступно" tone="green"/><Kpi icon={<Ban/>} label="Заблокированных" value={stats.blocked} note="требуют внимания" tone="red"/><Kpi icon={<Clock3/>} label="Новых за 30 дней" value={stats.newUsers} note="зарегистрировались" tone="blue"/></section>
    <section className="admin-users-workspace-v2"><div className="admin-users-table-card-v2"><div className="admin-users-filters-v2"><label><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, email, роли..."/></label><select value={role} onChange={(event) => setRole(event.target.value as RoleFilter)}><option value="all">Все роли</option>{adminRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="all">Все статусы</option><option value="active">Активен</option><option value="blocked">Заблокирован</option></select><select value={access} onChange={(event) => setAccess(event.target.value as AccessFilter)}><option value="all">Доступ к админке</option><option value="yes">Есть доступ</option><option value="no">Нет доступа</option></select>{activeFilters && <button className="reset" onClick={reset}>Сбросить</button>}</div>
      <div className="admin-users-table-v2"><table><thead><tr><th><input aria-label="Выбрать всех" type="checkbox" checked={filtered.length > 0 && filtered.every((user) => selectedIds.includes(user.id))} onChange={(event) => setSelectedIds(event.target.checked ? filtered.map((user) => user.id) : [])}/></th><th>Пользователь</th><th>Email</th><th>Роль</th><th>Статус</th><th>Последний вход</th><th>Дата регистрации</th><th>⋯</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id} className={selected?.id === user.id ? 'selected' : ''} onClick={() => openUser(user)}><td onClick={(event) => event.stopPropagation()}><input aria-label={`Выбрать ${user.full_name || user.email}`} type="checkbox" checked={selectedIds.includes(user.id)} onChange={(event) => setSelectedIds((items) => event.target.checked ? [...items, user.id] : items.filter((id) => id !== user.id))}/></td><td><span className="admin-user-person-v2"><Avatar user={user}/><span><b>{user.full_name || 'Имя не указано'}</b><small>{roleLabel(user.role)}</small></span></span></td><td title={user.email || ''}>{user.email || '—'}</td><td><em className={`admin-user-role-v2 ${roleClass(user.role)}`}>{roleCode(user.role)}</em></td><td><StatusBadge status={user.status}/></td><td title={formatDateTime(loginByUser.get(String(user.email || '').toLowerCase()))}>{relativeLogin(loginByUser.get(String(user.email || '').toLowerCase()))}</td><td>{formatRegistration(user.created_at)}</td><td><button className="admin-user-dots-v2" onClick={(event) => { event.stopPropagation(); openUser(user); }}>•••</button></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-users-empty-v2"><UsersRound size={28}/><b>Пользователи не найдены</b><span>Измените параметры поиска или фильтры.</span>{activeFilters && <button onClick={reset}>Сбросить фильтры</button>}</div>}</div>
      <footer className="admin-users-table-footer-v2"><span>{selectedIds.length ? `Выбрано: ${selectedIds.length}` : `Показано ${filtered.length} из ${users.length}`}</span>{selectedIds.length > 0 && <div><button onClick={() => setSelectedIds([])}>Снять выделение</button><button className="danger" onClick={() => void bulkBlock()}>Заблокировать</button></div>}<span className="pagination"><button disabled>‹</button><b>1</b><button disabled>›</button></span></footer></div>
      <UserDetails user={selected} activeAdmins={activeAdmins.length} login={selected ? loginByUser.get(String(selected.email || '').toLowerCase()) : undefined} activity={selectedActivity} customer={linkedCustomer} detailTab={detailTab} setDetailTab={setDetailTab} editing={editing} setEditing={(value) => { setEditing(value); if (value && selected) setDraft({ full_name: selected.full_name || '', phone: selected.phone || '', role: selected.role, status: selected.status || 'active' }); }} draft={draft} setDraft={setDraft} save={saveProfile} update={updateUser} close={() => setSelectedId('')}/>
    </section>
    {employeeOpen && <EmployeeModal close={() => setEmployeeOpen(false)} created={(user) => { setUsers((items) => [user, ...items]); setSelectedId(user.id); setEmployeeOpen(false); setMessage('Приглашение сотруднику отправлено.'); }}/>}
  </div>;
}

function Kpi({ icon, label, value, note, tone = 'orange' }: { icon: React.ReactNode; label: string; value: number; note: string; tone?: string }) { return <article className={`admin-user-kpi-v2 ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{note}</em></div></article>; }

function UserDetails({ user, activeAdmins, login, activity, customer, detailTab, setDetailTab, editing, setEditing, draft, setDraft, save, update, close }: { user?: AdminProfile; activeAdmins: number; login?: string; activity: AdminActivityItem[]; customer?: AdminCustomerRecord; detailTab: DetailTab; setDetailTab: (tab: DetailTab) => void; editing: boolean; setEditing: (value: boolean) => void; draft: Partial<AdminProfile>; setDraft: (patch: Partial<AdminProfile>) => void; save: () => void; update: (id: string, patch: Partial<Pick<AdminProfile, 'role' | 'full_name' | 'phone' | 'status'>>) => Promise<boolean>; close: () => void }) {
  if (!user) return <aside className="admin-user-panel-v2 empty"><CircleUserRound size={31}/><b>Выберите пользователя</b><span>Профиль, доступы и история действий появятся здесь.</span></aside>;
  const staff = isStaffRole(user.role); const isLastAdmin = user.role === 'admin' && user.status !== 'blocked' && activeAdmins <= 1;
  return <aside className="admin-user-panel-v2"><header><div className="admin-user-panel-person-v2"><Avatar user={user} large/><span><b>{user.full_name || 'Имя не указано'}</b><small>{user.email || 'Email не указан'}</small><div><StatusBadge status={user.status}/><em className={`admin-user-role-v2 ${roleClass(user.role)}`}>{roleCode(user.role)}</em></div></span></div><button onClick={close} aria-label="Закрыть"><X size={18}/></button></header><nav>{([['info','Информация'],['activity',`Активность${activity.length ? ` (${activity.length})` : ''}`],['related','Связанные данные']] as [DetailTab,string][]).map(([tab,label]) => <button key={tab} className={detailTab === tab ? 'active' : ''} onClick={() => setDetailTab(tab)}>{label}</button>)}</nav>
    {detailTab === 'info' && <><section className="admin-user-info-v2"><div className="admin-user-section-title-v2"><h3>Основная информация</h3><button onClick={() => setEditing(!editing)}>{editing ? 'Отмена' : 'Изменить'}</button></div>{editing ? <div className="admin-user-edit-v2"><label>Имя<input value={draft.full_name || ''} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })}/></label><label>Email<input disabled value={user.email || ''}/><small>Email меняется через Supabase Auth.</small></label><label>Телефон<input value={draft.phone || ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })}/></label><label>Роль<select value={draft.role || user.role} disabled={isLastAdmin} onChange={(event) => setDraft({ ...draft, role: event.target.value })}>{adminRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Статус<select value={draft.status || user.status || 'active'} disabled={isLastAdmin} onChange={(event) => setDraft({ ...draft, status: event.target.value })}><option value="active">Активен</option><option value="blocked">Заблокирован</option></select></label><button className="save" onClick={save}>Сохранить изменения</button></div> : <dl><dt>Имя</dt><dd>{user.full_name || 'Не указано'}</dd><dt>Email</dt><dd>{user.email || 'Не указан'}</dd><dt>Телефон</dt><dd>{user.phone || 'Не указан'}</dd><dt>Роль</dt><dd>{roleLabel(user.role)}</dd><dt>Статус</dt><dd><StatusBadge status={user.status}/></dd></dl>}</section><section className="admin-user-access-v2"><div><ShieldCheck size={19}/><span><b>Доступ к админке</b><small>{staff ? `Определяется ролью: ${roleCode(user.role)}` : 'Для клиента недоступен'}</small></span></div><button className={staff ? 'enabled' : ''} disabled={isLastAdmin} onClick={() => void update(user.id, { role: staff ? 'customer' : 'manager' })} aria-label="Изменить доступ"><i /></button></section><section className="admin-user-system-v2"><h3>Системная информация</h3><dl><dt>Дата регистрации</dt><dd>{formatDateTime(user.created_at)}</dd><dt>Последний вход</dt><dd>{login ? relativeLogin(login) : 'Никогда'}</dd><dt>IP последнего входа</dt><dd>Нет данных</dd><dt>Браузер</dt><dd>Нет данных</dd><dt>Неудачных попыток</dt><dd>0</dd><dt>Последняя смена роли</dt><dd>{formatDateTime(user.updated_at)}</dd></dl></section></>}
    {detailTab === 'activity' && <section className="admin-user-activity-v2">{activity.length ? activity.map((item) => <article key={item.id}><span><Clock3 size={15}/></span><div><b>{String(item.action || 'Действие').replaceAll('_', ' ')}</b><small>{formatDateTime(item.created_at)} · {item.entity || 'Система'}</small></div></article>) : <p>У пользователя пока нет зафиксированных действий.</p>}<Link href={`/admin/activity?actor=${encodeURIComponent(user.id)}`}><ExternalLink size={15}/>Открыть в Activity</Link></section>}
    {detailTab === 'related' && <section className="admin-user-related-v2">{user.role === 'customer' ? customer ? <><div><BadgeCheck/><span><b>Покупатель</b><small>{customer.full_name || user.full_name || user.email}</small><small>{customer.email || customer.phone || 'Контакт не указан'}</small></span></div><Link href={`/admin/customers?customer=${encodeURIComponent(customer.id)}`}>Открыть покупателя <ChevronRight size={16}/></Link></> : <p>CRM-карточка покупателя ещё не создана. Она появится после первого заказа или обращения.</p> : <><div><KeyRound/><span><b>Сотрудник Bullmet</b><small>Доступ определён ролью «{roleLabel(user.role)}».</small></span></div><p>Назначенные заказы, заметки и история обработки доступны в разделе заказов и журнале активности.</p><Link href="/admin/orders">Открыть заказы <ChevronRight size={16}/></Link></>}</section>}
    <footer><Link href={`/admin/activity?actor=${encodeURIComponent(user.id)}`}><ExternalLink size={15}/>Открыть в Activity</Link><button className={user.status === 'blocked' ? 'restore' : 'danger'} disabled={isLastAdmin} onClick={() => void update(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' })}>{user.status === 'blocked' ? 'Восстановить' : 'Заблокировать'}</button></footer>{isLastAdmin && <p className="admin-user-last-admin-v2"><ShieldOff size={15}/>Нельзя отключить последнего администратора системы.</p>}</aside>;
}

function EmployeeModal({ close, created }: { close: () => void; created: (user: AdminProfile) => void }) { const [draft, setDraft] = useState<EmployeeDraft>({ full_name: '', email: '', phone: '', role: 'manager' }); const [error, setError] = useState(''); const [sending, setSending] = useState(false); async function submit(event: FormEvent) { event.preventDefault(); setSending(true); setError(''); try { const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) }); const data = await response.json(); if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось создать приглашение.'); created(data.user); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось создать приглашение.'); } finally { setSending(false); } } return <div className="admin-employee-modal-v2"><button className="overlay" onClick={close}/><form onSubmit={submit}><header><div><p>Новый сотрудник</p><h2>Добавить сотрудника</h2><span>Клиентские аккаунты создаются только через регистрацию на сайте.</span></div><button type="button" onClick={close}><X/></button></header><label>Имя и фамилия<input required value={draft.full_name} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} placeholder="Алексей Петров"/></label><label>Email<input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="name@bullmet.by"/></label><label>Телефон<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+375 29 000-00-00"/></label><label>Роль<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as EmployeeDraft['role'] })}>{adminRoles.filter((item) => item.value !== 'customer').map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{error && <p className="error">{error}</p>}<footer><button type="button" onClick={close}>Отмена</button><button className="primary" disabled={sending}>{sending ? 'Отправляем…' : 'Отправить приглашение'}</button></footer></form></div>; }
