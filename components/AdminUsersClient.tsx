'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, Search, ShieldCheck, UserCog, Users } from 'lucide-react';
import type { AdminProfile, AdminRole } from '@/lib/adminPeople';
import { adminRoles, roleClass, roleLabel } from '@/lib/adminPeople';
import { formatDate } from '@/lib/adminCommerce';

type Filter = 'all' | AdminRole;

export function AdminUsersClient({ initialUsers, supabaseConfigured }: { initialUsers: AdminProfile[]; supabaseConfigured: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(initialUsers[0]?.id || '');
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return users.filter((user) => {
      const byRole = filter === 'all' || user.role === filter;
      const haystack = [user.email, user.full_name, user.phone, user.role, user.status].filter(Boolean).join(' ').toLowerCase();
      return byRole && (!clean || haystack.includes(clean));
    });
  }, [users, query, filter]);

  const active = users.find((user) => user.id === activeId) || filtered[0] || users[0];

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    managers: users.filter((user) => user.role === 'manager').length,
    content: users.filter((user) => user.role === 'content_manager').length,
    customers: users.filter((user) => !user.role || user.role === 'customer').length
  }), [users]);

  async function refreshUsers() {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить пользователей.');
      const next = Array.isArray(data.users) ? data.users as AdminProfile[] : [];
      setUsers(next);
      setActiveId((current) => next.some((user) => user.id === current) ? current : next[0]?.id || '');
      setMessage('Пользователи обновлены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить пользователей.');
    } finally {
      setRefreshing(false);
    }
  }

  async function updateUser(id: string, patch: Partial<Pick<AdminProfile, 'role' | 'full_name' | 'phone' | 'status'>>) {
    setMessage('');
    const previous = users;
    setUsers((current) => current.map((user) => user.id === id ? { ...user, ...patch } : user));

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить пользователя.');
      setMessage('Пользователь обновлён.');
    } catch (error) {
      setUsers(previous);
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить пользователя.');
    }
  }

  return (
    <div className="admin-users-page">
      <div className="admin-page-head">
        <div>
          <p>Пользователи</p>
          <h1>Пользователи и доступ</h1>
          <span>Управляйте ролями пользователей и готовьте доступы для менеджеров и контент-менеджеров.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshUsers} disabled={refreshing}><RefreshCw size={17} /> {refreshing ? 'Обновляем...' : 'Обновить'}</button>
        </div>
      </div>

      {!supabaseConfigured && <div className="admin-message">Supabase не подключен: пользователи не загрузятся из базы.</div>}
      {message && <div className="admin-message">{message}</div>}

      <section className="admin-users-stats">
        <article><Users size={22} /><div><b>{stats.total}</b><span>всего пользователей</span></div></article>
        <article><ShieldCheck size={22} /><div><b>{stats.admins}</b><span>администраторов</span></div></article>
        <article><UserCog size={22} /><div><b>{stats.managers}</b><span>менеджеров</span></div></article>
        <article><UserCog size={22} /><div><b>{stats.content}</b><span>контент</span></div></article>
        <article><Users size={22} /><div><b>{stats.customers}</b><span>клиентов</span></div></article>
      </section>

      <div className="admin-commerce-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по email, имени, телефону или роли" />
        <div>
          {(['all', ...adminRoles.map((role) => role.value)] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'Все' : roleLabel(item)}
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <section className="admin-empty-commerce">
          <h2>Пользователи не найдены</h2>
          <p>Измените поиск или проверьте, созданы ли аккаунты через Supabase Auth.</p>
        </section>
      ) : (
        <section className="admin-users-layout">
          <div className="admin-users-list">
            {filtered.map((user) => (
              <button key={user.id} type="button" className={active?.id === user.id ? 'is-active' : ''} onClick={() => setActiveId(user.id)}>
                <div>
                  <b>{user.email || 'email не указан'}</b>
                  <em className={roleClass(user.role)}>{roleLabel(user.role)}</em>
                </div>
                <span>{user.full_name || 'Имя не указано'}{user.phone ? ` · ${user.phone}` : ''}</span>
                <small>{formatDate(user.created_at)} · {user.id.slice(0, 8)}</small>
              </button>
            ))}
          </div>

          {active && (
            <article className="admin-user-detail">
              <div className="admin-user-detail-head">
                <div>
                  <p>Пользователь</p>
                  <h2>{active.email || 'email не указан'}</h2>
                  <span>ID: {active.id}</span>
                </div>
                <em className={roleClass(active.role)}>{roleLabel(active.role)}</em>
              </div>

              <div className="admin-user-form">
                <label>Роль
                  <select value={active.role || 'customer'} onChange={(event) => updateUser(active.id, { role: event.target.value as AdminRole })}>
                    {adminRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                </label>
                <label>Статус
                  <select value={active.status || 'active'} onChange={(event) => updateUser(active.id, { status: event.target.value })}>
                    <option value="active">Активен</option>
                    <option value="blocked">Заблокирован</option>
                  </select>
                </label>
                <label>Имя
                  <input defaultValue={active.full_name || ''} onBlur={(event) => updateUser(active.id, { full_name: event.target.value })} placeholder="Имя пользователя" />
                </label>
                <label>Телефон
                  <input defaultValue={active.phone || ''} onBlur={(event) => updateUser(active.id, { phone: event.target.value })} placeholder="+375..." />
                </label>
              </div>

              <div className="admin-role-access-card">
                <h3>Что даёт роль</h3>
                <p>{adminRoles.find((role) => role.value === active.role)?.description || adminRoles.at(-1)?.description}</p>
                <div>
                  {(adminRoles.find((role) => role.value === active.role)?.access || []).map((access) => <span key={access}>{access}</span>)}
                </div>
              </div>

              <div className="admin-user-meta">
                <p><b>Создан:</b> {formatDate(active.created_at)}</p>
                <p><b>Обновлён:</b> {formatDate(active.updated_at)}</p>
              </div>
            </article>
          )}
        </section>
      )}
    </div>
  );
}
