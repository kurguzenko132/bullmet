'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronRight, ExternalLink, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminAccess } from './AdminAccessContext';

const pageTitles: Array<[string, string]> = [
  ['/admin/homepage', 'Главная страница'],
  ['/admin/pages', 'Страницы'],
  ['/admin/categories', 'Категории'],
  ['/admin/products', 'Товары'],
  ['/admin/services', 'Услуги'],
  ['/admin/production', 'Производство'],
  ['/admin/orders', 'Заказы'],
  ['/admin/requests', 'Заявки'],
  ['/admin/reviews', 'Отзывы'],
  ['/admin/banners', 'Баннеры'],
  ['/admin/media', 'Медиафайлы'],
  ['/admin/users', 'Пользователи'],
  ['/admin/customers', 'Покупатели'],
  ['/admin/coupons', 'Купоны и скидки'],
  ['/admin/delivery', 'Доставка'],
  ['/admin/payment', 'Оплата'],
  ['/admin/roles', 'Роли и права'],
  ['/admin/activity', 'Журнал действий'],
  ['/admin/backup', 'Экспорт данных'],
  ['/admin/stats', 'Статистика'],
  ['/admin/reports', 'Отчеты'],
  ['/admin/settings', 'Настройки сайта']
];

function getPageTitle() {
  if (typeof window === 'undefined') return 'Главная';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/admin';
  if (pathname === '/admin') return 'Главная';
  return pageTitles.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] || 'Панель управления';
}

export function AdminTopbar() {
  const { profile, roleLabel } = useAdminAccess();
  const [email, setEmail] = useState(profile.email || 'admin@bullmet.by');
  const [pageTitle, setPageTitle] = useState('Главная');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<Array<{ id: string; title: string; detail: string; href: string; type: string }>>([]);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPageTitle(getPageTitle());
  }, []);

  useEffect(() => {
    let active = true;
    async function buildSearchIndex() {
      try {
        const response = await fetch('/api/admin/search', { cache: 'no-store' });
        const data = response.ok ? await response.json() : {};
        if (active) setSearchIndex(Array.isArray(data.items) ? data.items : []);
      } catch { if (active) setSearchIndex([]); }
    }
    void buildSearchIndex();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const nextEmail = data.session?.user?.email;
      if (active && nextEmail) setEmail(nextEmail);
    }

    void loadUser();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) setEmail(session.user.email);
    }) || { data: null };

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, [profile.email]);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const [ordersResponse, requestsResponse] = await Promise.all([
          fetch('/api/admin/orders', { cache: 'no-store' }),
          fetch('/api/admin/requests', { cache: 'no-store' })
        ]);
        const [ordersData, requestsData] = await Promise.all([ordersResponse.json(), requestsResponse.json()]);
        const orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
        const requests = Array.isArray(requestsData.requests) ? requestsData.requests : [];
        const newOrders = orders.filter((order: any) => !order.status || order.status === 'Новый').length;
        const newRequests = requests.filter((request: any) => !request.status || request.status === 'Новая').length;
        if (active) setNotificationCount(newOrders + newRequests);
      } catch {
        if (active) setNotificationCount(0);
      }
    }

    void loadNotifications();
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!notificationRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function toggleSidebar() {
    const shell = document.querySelector('.admin-shell-redesign');
    if (!shell) return;

    const isMobile = window.matchMedia('(max-width: 1100px)').matches;
    if (isMobile) {
      shell.classList.toggle('is-sidebar-open');
      return;
    }

    shell.classList.toggle('is-sidebar-collapsed');
    try {
      window.localStorage.setItem('bullmet_admin_sidebar_collapsed', shell.classList.contains('is-sidebar-collapsed') ? '1' : '0');
    } catch {}
  }

  useEffect(() => {
    try {
      const shell = document.querySelector('.admin-shell-redesign');
      if (shell && window.localStorage.getItem('bullmet_admin_sidebar_collapsed') === '1') shell.classList.add('is-sidebar-collapsed');
    } catch {}
  }, []);

  async function signOut() {
    try {
      window.localStorage.removeItem('bullmet_account_last_email');
      window.localStorage.removeItem('bullmet_account_last_login_at');
      await supabase?.auth.signOut();
    } finally {
      window.location.assign('/login?next=/admin');
    }
  }

  const notifications = useMemo(() => [
    { title: 'Заказы и заявки', text: notificationCount ? `${notificationCount} новых событий требуют проверки` : 'Новых событий пока нет', href: '/admin/orders' },
    { title: 'Товары и каталог', text: 'Проверь цены, фото, статусы и категории', href: '/admin/products' },
    { title: 'Экспорт данных', text: 'Перед изменениями скачай полный JSON', href: '/admin/backup' }
  ], [notificationCount]);
  const searchResults = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (needle.length < 2) return [];
    return searchIndex.filter((item) => `${item.title} ${item.detail} ${item.type}`.toLowerCase().includes(needle)).slice(0, 7);
  }, [searchIndex, searchQuery]);

  return (
    <header className="admin-topbar-redesign admin-topbar-redesign--fixed">
      <div className="admin-topbar-left">
        <button type="button" aria-label="Свернуть меню" onClick={toggleSidebar}><Menu size={20} /></button>
        <div>
          <span>Панель управления</span>
          <b>{pageTitle}</b>
        </div>
      </div>

      <div className="admin-topbar-search" ref={searchRef}>
        <Search size={17} />
        <input value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(true); }} placeholder="Поиск по заказам, страницам, клиентам..." onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }} />
        {searchOpen && searchQuery.trim().length >= 2 && <div className="admin-topbar-search-results">{searchResults.length ? searchResults.map((item) => <Link href={item.href} key={item.id} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}><small>{item.type}</small><b>{item.title}</b><span>{item.detail}</span></Link>) : <p>Ничего не найдено. Попробуйте имя, номер заказа или название.</p>}</div>}
      </div>

      <div className="admin-topbar-actions">
        <Link href="/" target="_blank">Перейти на сайт <ExternalLink size={15} /></Link>
        <div className="admin-topbar-notification-wrap" ref={notificationRef}>
          <button type="button" className={`admin-topbar-bell ${notificationsOpen ? 'is-open' : ''}`} aria-label="Уведомления" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}>
            <Bell size={18} />
            {!!notificationCount && <i>{notificationCount}</i>}
          </button>
          {notificationsOpen && (
            <div className="admin-topbar-notifications">
              <div className="admin-topbar-notifications-head">
                <b>Уведомления</b>
                <span>{notificationCount ? `${notificationCount} новых` : 'всё спокойно'}</span>
              </div>
              {notifications.map((item) => (
                <Link href={item.href} key={item.title} onClick={() => setNotificationsOpen(false)}>
                  <div><b>{item.title}</b><span>{item.text}</span></div>
                  <ChevronRight size={16} />
                </Link>
              ))}
              <div className="admin-topbar-notifications-footer">
                <Link href="/admin/activity" onClick={() => setNotificationsOpen(false)}>Журнал действий</Link>
                <Link href="/admin/backup" onClick={() => setNotificationsOpen(false)}>Экспорт</Link>
              </div>
            </div>
          )}
        </div>
        <div className="admin-topbar-profile-wrap" ref={profileRef}>
          <button type="button" className="admin-topbar-user" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
            <span><UserRound size={18} /></span>
            <div><b>{roleLabel}</b><small>{email}</small></div>
          </button>
          {profileOpen && <div className="admin-topbar-profile-menu">
            <b>{roleLabel}</b><span>{email}</span>
            <Link href="/admin/settings" onClick={() => setProfileOpen(false)}>Настройки профиля</Link>
            <button type="button" onClick={signOut}>Выйти из аккаунта</button>
          </div>}
        </div>
        <button type="button" className="admin-topbar-logout" onClick={signOut} aria-label="Выйти"><LogOut size={18} /></button>
      </div>
    </header>
  );
}
