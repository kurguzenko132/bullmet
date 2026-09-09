'use client';

import { useMemo, useState } from 'react';
import { Copy, Mail, Phone, Search, ShoppingBag, UserRound } from 'lucide-react';
import type { AdminOrder, AdminRequest } from '@/lib/adminCommerce';
import type { AdminProfile } from '@/lib/adminPeople';
import { formatDate, money } from '@/lib/adminCommerce';

type Customer = {
  key: string;
  name: string;
  email: string;
  phone: string;
  orders: AdminOrder[];
  requests: AdminRequest[];
  profile?: AdminProfile;
  total: number;
  lastDate: string;
};

function keyFor(value: { email?: string; phone?: string; id?: string }) {
  return String(value.email || '').trim().toLowerCase() || String(value.phone || '').replace(/\D/g, '') || String(value.id || 'unknown');
}

function customerName(order?: AdminOrder, request?: AdminRequest, profile?: AdminProfile) {
  return String(order?.customer?.name || request?.customer?.name || profile?.full_name || profile?.email?.split('@')[0] || 'Клиент').trim();
}

export function AdminCustomersClient({ profiles, orders, requests, supabaseConfigured }: { profiles: AdminProfile[]; orders: AdminOrder[]; requests: AdminRequest[]; supabaseConfigured: boolean }) {
  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [copied, setCopied] = useState('');

  const customers = useMemo(() => {
    const registry = new Map<string, Customer>();
    const ensure = (input: { id?: string; email?: string; phone?: string; name?: string; profile?: AdminProfile }) => {
      const key = keyFor({ email: input.email, phone: input.phone, id: input.id || input.profile?.id });
      const known = registry.get(key);
      if (known) {
        if (!known.name && input.name) known.name = input.name;
        if (!known.email && input.email) known.email = input.email;
        if (!known.phone && input.phone) known.phone = input.phone;
        if (input.profile) known.profile = input.profile;
        return known;
      }
      const customer: Customer = { key, name: input.name || input.email?.split('@')[0] || input.phone || 'Клиент', email: input.email || '', phone: input.phone || '', profile: input.profile, orders: [], requests: [], total: 0, lastDate: '' };
      registry.set(key, customer);
      return customer;
    };
    profiles.filter((profile) => !profile.role || profile.role === 'customer').forEach((profile) => ensure({ id: profile.id, email: profile.email || '', phone: profile.phone || '', name: profile.full_name || '', profile }));
    orders.forEach((order) => {
      const current = ensure({ id: order.id, email: order.customer?.email, phone: order.customer?.phone, name: customerName(order) });
      current.orders.push(order); current.total += Number(order.total || 0);
      if (String(order.created_at || '') > current.lastDate) current.lastDate = String(order.created_at || '');
    });
    requests.forEach((request) => {
      const current = ensure({ id: request.id, email: request.customer?.email, phone: request.customer?.phone, name: customerName(undefined, request) });
      current.requests.push(request);
      if (String(request.created_at || '') > current.lastDate) current.lastDate = String(request.created_at || '');
    });
    return [...registry.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate) || b.total - a.total);
  }, [profiles, orders, requests]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return !needle ? customers : customers.filter((customer) => [customer.name, customer.email, customer.phone].join(' ').toLowerCase().includes(needle));
  }, [customers, query]);
  const active = customers.find((customer) => customer.key === activeKey) || filtered[0];
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total, 0);

  async function copy(value: string, token: string) {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(token); window.setTimeout(() => setCopied(''), 1600); } catch {}
  }

  return <div className="admin-customers-cms">
    <section className="admin-page-head admin-customers-head"><div><p>CRM</p><h1>Покупатели</h1><span>Единый список клиентов из аккаунтов, заказов и заявок. Откройте клиента, чтобы увидеть всю историю обращения.</span></div><div className="admin-head-actions"><a href="/api/admin/export?type=users&format=csv" target="_blank">Экспорт CSV</a></div></section>
    {!supabaseConfigured && <p className="admin-commerce-settings-message">Supabase не подключен: реестр отображает только данные, доступные в текущем окружении.</p>}
    <section className="admin-customers-metrics"><article><b>{customers.length}</b><span>клиентов в реестре</span></article><article><b>{orders.length}</b><span>заказов</span></article><article><b>{requests.length}</b><span>заявок</span></article><article><b>{money(totalRevenue)} BYN</b><span>сумма заказов</span></article></section>
    <section className="admin-customers-layout">
      <div className="admin-customers-list-card">
        <label className="admin-customers-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, телефон или email" /></label>
        <div className="admin-customers-list">{filtered.length ? filtered.map((customer) => <button key={customer.key} type="button" className={active?.key === customer.key ? 'active' : ''} onClick={() => setActiveKey(customer.key)}><span className="admin-customer-avatar"><UserRound size={17} /></span><span><b>{customer.name}</b><small>{customer.phone || customer.email || 'Контакты не указаны'}</small></span><em>{customer.orders.length + customer.requests.length}</em></button>) : <p>Ничего не найдено.</p>}</div>
      </div>
      {active ? <aside className="admin-customer-profile">
        <header><span className="admin-customer-avatar is-large"><UserRound size={24} /></span><div><h2>{active.name}</h2><p>{active.profile ? 'Есть аккаунт на сайте' : 'Контакт из заказа или заявки'}</p></div></header>
        <div className="admin-customer-contact-grid"><button type="button" onClick={() => copy(active.phone, 'phone')} disabled={!active.phone}><Phone size={17} /><span>{active.phone || 'Телефон не указан'}</span>{copied === 'phone' ? <b>Скопировано</b> : <Copy size={14} />}</button><button type="button" onClick={() => copy(active.email, 'email')} disabled={!active.email}><Mail size={17} /><span>{active.email || 'Email не указан'}</span>{copied === 'email' ? <b>Скопировано</b> : <Copy size={14} />}</button></div>
        <section><div className="admin-customer-section-title"><h3>Заказы</h3><span>{active.orders.length}</span></div>{active.orders.length ? active.orders.slice(0, 5).map((order) => <a key={order.id} href="/admin/orders"><ShoppingBag size={16} /><span><b>#{order.id.slice(0, 8)} · {money(Number(order.total || 0))} BYN</b><small>{formatDate(order.created_at)} · {order.status || 'Новый'}</small></span></a>) : <p className="admin-customer-empty">Заказов пока нет.</p>}</section>
        <section><div className="admin-customer-section-title"><h3>Заявки</h3><span>{active.requests.length}</span></div>{active.requests.length ? active.requests.slice(0, 5).map((request) => <a key={request.id} href="/admin/requests"><Mail size={16} /><span><b>{request.type || request.kind || 'Заявка'}</b><small>{formatDate(request.created_at)} · {request.status || 'Новая'}</small></span></a>) : <p className="admin-customer-empty">Заявок пока нет.</p>}</section>
      </aside> : <aside className="admin-customer-profile admin-customer-profile-empty"><UserRound size={28} /><b>Выберите клиента</b><span>История заказов и заявок появится здесь.</span></aside>}
    </section>
  </div>;
}
