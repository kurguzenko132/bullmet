'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bell, ChevronRight, Edit3, Heart, Home, LogOut, MapPin, Package, Plus, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Icon } from './Icon';

type AccountStatus = 'loading' | 'ready' | 'config-error';

type AccountUser = {
  id: string;
  email: string;
  createdAt?: string;
  source: 'supabase' | 'local';
};

type Profile = {
  full_name?: string | null;
  phone?: string | null;
};

type CartItem = {
  slug?: string;
  title: string;
  price: number;
  quantity?: number;
  image?: string;
  size?: string;
  material?: string;
};

type FavoriteItem = {
  slug: string;
  title: string;
  price: number;
  image?: string;
  short?: string;
  category?: string;
};

type OrderRow = {
  id: string;
  created_at?: string;
  customer?: { email?: string; phone?: string; name?: string };
  items?: CartItem[];
  total?: number;
  status?: string;
  delivery?: string;
};

type RequestRow = {
  id: string;
  created_at?: string;
  customer?: { email?: string; phone?: string; name?: string };
  kind?: string;
  type?: string;
  product_title?: string;
  product_image?: string;
  product_price?: number | null;
  quantity?: number | null;
  status?: string;
  comment?: string;
};

function getAdminEmails() {
  return [process.env.NEXT_PUBLIC_ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(Number(value || 0));
}

function dateLabel(value?: string) {
  if (!value) return 'дата не указана';
  try {
    return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return 'дата не указана';
  }
}

function statusClass(status?: string) {
  const text = String(status || '').toLowerCase();
  if (text.includes('выполн') || text.includes('закры') || text.includes('рассчит')) return 'is-done';
  if (text.includes('работ') || text.includes('ожида')) return 'is-progress';
  if (text.includes('отмен')) return 'is-cancel';
  return 'is-new';
}

function friendlyStatus(status?: string) {
  const text = String(status || '').toLowerCase();
  if (text.includes('отмен')) return 'Отменён';
  if (text.includes('достав')) return 'Передан в доставку';
  if (text.includes('выполн') || text.includes('закры')) return 'Выполнен';
  if (text.includes('оплач')) return 'Оплачен';
  if (text.includes('работ') || text.includes('ожида')) return 'В обработке';
  return status || 'Принят';
}

function pluralize(value: number, one: string, few: string, many: string) {
  const remainder = Math.abs(value) % 100;
  const last = remainder % 10;
  if (remainder > 10 && remainder < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

function readJsonList<T>(key: string) {
  if (typeof window === 'undefined') return [] as T[];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as T[] : [] as T[];
  } catch {
    return [] as T[];
  }
}

function readCart() {
  return readJsonList<CartItem>('bullmet_cart');
}

function readFavorites() {
  return readJsonList<FavoriteItem>('bullmet_favorites');
}

function readLocalOrders() {
  return readJsonList<OrderRow>('bullmet_local_orders')
    .map((order) => ({ ...order, created_at: order.created_at || (order as { createdAt?: string }).createdAt }))
    .filter((order) => order.id);
}

function writeFavorites(items: FavoriteItem[]) {
  try {
    window.localStorage.setItem('bullmet_favorites', JSON.stringify(items));
  } catch {}
}

function readRememberedAccount() {
  if (typeof window === 'undefined') return null as null | { email: string; createdAt?: string };
  try {
    const email = String(window.localStorage.getItem('bullmet_account_last_email') || '').trim().toLowerCase();
    const loginAt = Number(window.localStorage.getItem('bullmet_account_last_login_at') || 0);
    const fresh = loginAt && Date.now() - loginAt < 1000 * 60 * 60 * 24 * 30;
    if (!email || !fresh) return null;
    return { email, createdAt: new Date(loginAt).toISOString() };
  } catch {
    return null;
  }
}

function rememberAccount(email: string) {
  try {
    window.localStorage.setItem('bullmet_account_last_email', email.toLowerCase());
    window.localStorage.setItem('bullmet_account_last_login_at', String(Date.now()));
  } catch {}
}

function clearRememberedAccount() {
  try {
    window.localStorage.removeItem('bullmet_account_last_email');
    window.localStorage.removeItem('bullmet_account_last_login_at');
  } catch {}
}

function normalizeFavorite(item: any): FavoriteItem | null {
  const slug = String(item?.product_slug || item?.slug || '').trim();
  const title = String(item?.title || '').trim();
  if (!slug || !title) return null;
  return {
    slug,
    title,
    price: Number(item?.price || 0),
    image: item?.image || '',
    short: item?.short || '',
    category: item?.category || ''
  };
}

async function getSessionWithRetry() {
  if (!supabase) return null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const sessionResult = await supabase.auth.getSession();
    if (sessionResult.data.session) return sessionResult.data.session;

    const userResult = await supabase.auth.getUser();
    if (userResult.data.user) {
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.data.session) return refreshed.data.session;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 180));
  }

  return null;
}

export function AccountClient() {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [user, setUser] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<Profile>({});
  const [profileDraft, setProfileDraft] = useState({ fullName: '', phone: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataMessage, setDataMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressDraft, setAddressDraft] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  const adminEmails = useMemo(() => getAdminEmails(), []);
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());
  const displayName = profile.full_name || profileDraft.fullName || user?.email?.split('@')[0] || 'клиент';

  useEffect(() => {
    try {
      const storedNotifications = window.localStorage.getItem('bullmet_account_notifications');
      const storedAddresses = readJsonList<string>('bullmet_account_addresses');
      setNotificationsEnabled(storedNotifications !== 'false');
      setAddresses(storedAddresses.filter(Boolean));
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;

    function openLocalIfPossible() {
      const remembered = readRememberedAccount();
      if (!remembered || !active) return false;

      setUser({ id: 'local-account', email: remembered.email, createdAt: remembered.createdAt, source: 'local' });
      setStatus('ready');
      setCart(readCart());
      setFavorites(readFavorites());
      setOrders(readLocalOrders());
      setDataMessage('Кабинет открыт. Данные заказов подтянутся после восстановления Supabase-сессии.');
      return true;
    }

    async function initAccount() {
      setCart(readCart());
      setFavorites(readFavorites());
      setOrders(readLocalOrders());

      if (!supabase) {
        if (openLocalIfPossible()) return;
        if (active) setStatus('config-error');
        return;
      }

      // Сначала показываем кабинет по локальному признаку входа, чтобы не было 404/цикла редиректа.
      openLocalIfPossible();

      const session = await getSessionWithRetry();
      if (!active) return;

      if (!session) {
        if (openLocalIfPossible()) return;
        router.replace('/login?next=/account');
        return;
      }

      const nextUser: AccountUser = {
        id: session.user.id,
        email: session.user.email || '',
        createdAt: session.user.created_at,
        source: 'supabase'
      };

      rememberAccount(nextUser.email);
      setUser(nextUser);
      setStatus('ready');
      setDataMessage('');
      await loadAccountData(nextUser, active);
    }

    initAccount();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      const nextUser: AccountUser = {
        id: session.user.id,
        email: session.user.email || '',
        createdAt: session.user.created_at,
        source: 'supabase'
      };
      rememberAccount(nextUser.email);
      setUser(nextUser);
      setStatus('ready');
      setDataMessage('');
      void loadAccountData(nextUser, active);
    }) || { data: null };

    const syncLocal = () => {
      setCart(readCart());
      setFavorites(readFavorites());
      setOrders((current) => [...readLocalOrders(), ...current].filter((order, index, arr) => arr.findIndex((item) => item.id === order.id) === index));
    };

    window.addEventListener('storage', syncLocal);
    window.addEventListener('bullmet-cart-updated', syncLocal);
    window.addEventListener('bullmet-orders-updated', syncLocal);

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('bullmet-cart-updated', syncLocal);
      window.removeEventListener('bullmet-orders-updated', syncLocal);
    };
  }, [router]);

  async function loadAccountData(currentUser: AccountUser, active = true) {
    if (!supabase || currentUser.source !== 'supabase') return;

    setLoadingData(true);
    setDataMessage('');

    let warnings = 0;

    try {
      try {
        const withPhone = await supabase.from('profiles').select('full_name, phone').eq('id', currentUser.id).maybeSingle();
        const profileResult = withPhone.error
          ? await supabase.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle()
          : withPhone;

        if (!profileResult.error && profileResult.data && active) {
          const nextProfile = profileResult.data as Profile;
          setProfile(nextProfile);
          setProfileDraft({ fullName: nextProfile.full_name || '', phone: nextProfile.phone || '' });
        }
      } catch {
        warnings += 1;
      }

      try {
        const favoritesResult = await supabase.from('favorites').select('product_slug, title, price, image, short, category, created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
        if (!favoritesResult.error && favoritesResult.data && active) {
          const fromDb = favoritesResult.data.map(normalizeFavorite).filter(Boolean) as FavoriteItem[];
          const fromLocal = readFavorites();
          setFavorites([...fromDb, ...fromLocal].filter((item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index));
        }
      } catch {
        warnings += 1;
      }

      try {
        const ordersResult = await supabase.from('orders').select('id, created_at, customer, items, total, status, delivery').order('created_at', { ascending: false }).limit(40);
        if (!ordersResult.error && ordersResult.data && active) {
          const email = currentUser.email.toLowerCase();
          const fromDb = (ordersResult.data as OrderRow[]).filter((order) => String(order.customer?.email || '').toLowerCase() === email);
          const fromLocal = readLocalOrders().filter((order) => !order.customer?.email || String(order.customer?.email || '').toLowerCase() === email);
          setOrders([...fromLocal, ...fromDb].filter((order, index, arr) => arr.findIndex((item) => item.id === order.id) === index));
        }
      } catch {
        warnings += 1;
      }

      try {
        const requestsResult = await supabase.from('requests').select('id, created_at, customer, kind, type, product_title, product_image, product_price, quantity, status, comment').order('created_at', { ascending: false }).limit(40);
        if (!requestsResult.error && requestsResult.data && active) {
          const email = currentUser.email.toLowerCase();
          setRequests((requestsResult.data as RequestRow[]).filter((request) => String(request.customer?.email || '').toLowerCase() === email));
        }
      } catch {
        warnings += 1;
      }

      if (warnings && active) {
        setDataMessage('Кабинет открыт. Часть данных временно не подтянулась из Supabase, но основные действия доступны.');
      }
    } finally {
      if (active) setLoadingData(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    clearRememberedAccount();
    try { window.dispatchEvent(new Event('bullmet-auth-updated')); } catch {}
    await supabase?.auth.signOut();
    window.location.assign('/login?next=/account');
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage('');

    if (!supabase || !user || user.source !== 'supabase') {
      setProfile({ full_name: profileDraft.fullName.trim(), phone: profileDraft.phone.trim() });
      setProfileMessage('Сохранил на странице. После восстановления Supabase-сессии данные можно будет записать в профиль.');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: profileDraft.fullName.trim(),
        phone: profileDraft.phone.trim()
      };

      const result = await supabase.from('profiles').upsert(payload);
      if (result.error) {
        const fallback = await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: payload.full_name });
        if (fallback.error) throw fallback.error;
      }

      setProfile({ full_name: payload.full_name, phone: payload.phone });
      setProfileMessage('Данные сохранены.');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Не удалось сохранить данные.');
    } finally {
      setSavingProfile(false);
    }
  }

  function removeFavorite(slug: string) {
    const next = favorites.filter((item) => item.slug !== slug);
    setFavorites(next);
    writeFavorites(next);
    if (supabase && user?.source === 'supabase') {
      void supabase.from('favorites').delete().eq('user_id', user.id).eq('product_slug', slug);
    }
  }

  function addFavoriteToCart(item: FavoriteItem) {
    const current = readCart();
    const cartItem: CartItem = {
      slug: item.slug,
      title: item.title,
      price: Number(item.price || 0),
      image: item.image,
      quantity: 1,
      size: 'Под заказ',
      material: item.category || item.short || ''
    };

    const index = current.findIndex((entry) => entry.slug === cartItem.slug && entry.size === cartItem.size);
    if (index >= 0) current[index].quantity = Number(current[index].quantity || 1) + 1;
    else current.push(cartItem);

    window.localStorage.setItem('bullmet_cart', JSON.stringify(current));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
    setCart(current);
  }

  function toggleNotifications() {
    setNotificationsEnabled((current) => {
      const next = !current;
      try { window.localStorage.setItem('bullmet_account_notifications', String(next)); } catch {}
      return next;
    });
  }

  function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAddress = addressDraft.trim();
    if (!nextAddress) return;
    const next = [...addresses, nextAddress];
    setAddresses(next);
    setAddressDraft('');
    setAddingAddress(false);
    try { window.localStorage.setItem('bullmet_account_addresses', JSON.stringify(next)); } catch {}
  }

  if (status === 'loading') {
    return (
      <section className="account-state-card account-state-card--rich">
        <div className="account-loader" />
        <h1>Открываем личный кабинет</h1>
        <p>Проверяем вход. Если вы уже входили, кабинет откроется без повторного ввода пароля.</p>
      </section>
    );
  }

  if (status === 'config-error') {
    return (
      <section className="account-state-card account-state-card--rich">
        <h1>Supabase не подключен</h1>
        <p>Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel и .env.local, чтобы вход работал стабильно.</p>
        <Link className="account-state-link" href="/login?next=/account">Вернуться ко входу</Link>
      </section>
    );
  }

  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'B';
  const quickLinks = [
    { href: '#orders', icon: Package, label: 'Мои заказы', value: `${orders.length} ${pluralize(orders.length, 'заказ', 'заказа', 'заказов')}` },
    { href: '#favorites', icon: Heart, label: 'Избранное', value: `${favorites.length} ${pluralize(favorites.length, 'товар', 'товара', 'товаров')}` },
    { href: '#profile', icon: UserRound, label: 'Мои данные', value: profile.full_name || profile.phone ? 'Заполнено' : 'Не заполнено' },
    { href: '#addresses', icon: MapPin, label: 'Адреса', value: `${addresses.length} ${pluralize(addresses.length, 'адрес', 'адреса', 'адресов')}` }
  ];
  const menuItems = [
    { href: '#dashboard', icon: Home, label: 'Главная' },
    { href: '#orders', icon: Package, label: 'Мои заказы' },
    { href: '#favorites', icon: Heart, label: 'Избранное' },
    { href: '#profile', icon: UserRound, label: 'Личные данные' },
    { href: '#addresses', icon: MapPin, label: 'Адреса доставки' },
    { href: '#notifications', icon: Bell, label: 'Уведомления' }
  ];

  return (
    <section className="account-dashboard" id="dashboard">
      <div className="account-dashboard-layout">
        <aside className="account-dashboard-sidebar">
          <div className="account-dashboard-person">
            <div className="account-dashboard-avatar" aria-hidden="true">{initials}</div>
            <div><b>{displayName}</b><span>{user?.email}</span></div>
            <button type="button" aria-label="Редактировать профиль" onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}><Edit3 /></button>
          </div>
          <nav className="account-dashboard-menu" aria-label="Разделы личного кабинета">
            {menuItems.map(({ href, icon: MenuIcon, label }, index) => <a className={index === 0 ? 'is-active' : ''} href={href} key={href}><MenuIcon /><span>{label}</span></a>)}
          </nav>
          <div className="account-dashboard-sidebar-bottom">
            {isAdmin && <Link href="/admin">Открыть админку <ArrowRight /></Link>}
            <button type="button" onClick={signOut} disabled={signingOut}><LogOut />{signingOut ? 'Выходим...' : 'Выйти'}</button>
          </div>
        </aside>

        <div className="account-dashboard-content">
          <section className="account-dashboard-welcome">
            <div className="account-dashboard-welcome-copy">
              <nav className="account-dashboard-breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><ChevronRight /><span>Личный кабинет</span></nav>
              <h1>Добро пожаловать, {displayName}!</h1>
              <p>Здесь вы можете управлять своими заказами, сохранять понравившиеся товары и редактировать личные данные.</p>
              {dataMessage && <small>{dataMessage}</small>}
            </div>
            <div className="account-dashboard-welcome-image" aria-hidden="true"><span>Время<br />вдохновляет</span></div>
          </section>

          <nav className="account-dashboard-quick-links" aria-label="Быстрые разделы">
            {quickLinks.map(({ href, icon: QuickIcon, label, value }) => <a href={href} key={href}><QuickIcon /><span><b>{label}</b><small>{loadingData && label !== 'Мои данные' ? 'Обновляем...' : value}</small></span><ArrowRight /></a>)}
          </nav>

          <div className="account-dashboard-main-grid">
            <section className="account-dashboard-card account-dashboard-orders" id="orders">
              <div className="account-dashboard-card-head"><h2>Последние заказы</h2><Link href="/account/orders">Все заказы <ArrowRight /></Link></div>
              {orders.length ? <div className="account-dashboard-order-list">{orders.slice(0, 3).map((order) => {
                const item = order.items?.[0];
                return <Link className="account-dashboard-order" href={`/account/orders/${order.id}`} key={order.id}>
                  <span className="account-dashboard-order-image">{item?.image ? <img src={item.image} alt="" /> : <Package />}</span>
                  <span className="account-dashboard-order-info"><b>Заказ №{String(order.id).replace(/^#/, '')}</b><small>{dateLabel(order.created_at)}</small></span>
                  <em className={`account-status ${statusClass(order.status)}`}>{friendlyStatus(order.status)}</em>
                  <strong>{money(Number(order.total || 0))} BYN</strong><ArrowRight />
                </Link>;
              })}</div> : <div className="account-dashboard-empty"><Package /><p>Заказов пока нет. Перейдите в каталог, чтобы выбрать часы.</p><Link href="/catalog">Перейти в каталог</Link></div>}
            </section>

            <section className="account-dashboard-card account-dashboard-profile" id="profile">
              <div className="account-dashboard-card-head"><h2>Мои данные</h2><button type="button" onClick={() => setEditingProfile((current) => !current)}><Edit3 />{editingProfile ? 'Закрыть' : 'Редактировать'}</button></div>
              {!editingProfile ? <dl className="account-dashboard-data"><div><dt>Имя</dt><dd>{displayName}</dd></div><div><dt>Email</dt><dd>{user?.email || 'Не указан'}</dd></div><div><dt>Телефон</dt><dd>{profile.phone || 'Не указан'}</dd></div></dl> : <form className="account-dashboard-profile-form" onSubmit={saveProfile}><label><span>Имя</span><input value={profileDraft.fullName} onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder="Как к вам обращаться" /></label><label><span>Телефон</span><input value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="+375 29 000-00-00" /></label><label><span>Email</span><input value={user?.email || ''} disabled /></label>{profileMessage && <p>{profileMessage}</p>}<button disabled={savingProfile}>{savingProfile ? 'Сохраняем...' : 'Сохранить изменения'}</button></form>}
              <div className="account-dashboard-notifications" id="notifications"><Bell /><div><b>Уведомления</b><span>Получать обновления о статусе заказов</span></div><button type="button" className={notificationsEnabled ? 'is-on' : ''} aria-pressed={notificationsEnabled} aria-label="Переключить уведомления" onClick={toggleNotifications}><i /></button></div>
            </section>
          </div>

          <div className="account-dashboard-lower-grid">
            <section className="account-dashboard-card account-dashboard-favorites" id="favorites">
              <div className="account-dashboard-card-head"><h2>Избранные товары</h2><Link href="/catalog">Все избранные <ArrowRight /></Link></div>
              {favorites.length ? <div className="account-dashboard-favorite-grid">{favorites.slice(0, 4).map((item) => <article key={item.slug}><Link href={`/product/${item.slug}`} className="account-dashboard-favorite-image">{item.image ? <img src={item.image} alt="" /> : <Heart />}</Link><button type="button" aria-label="Убрать из избранного" onClick={() => removeFavorite(item.slug)}><Heart fill="currentColor" /></button><div><Link href={`/product/${item.slug}`}>{item.title}</Link><b>{money(item.price)} BYN</b><button type="button" onClick={() => addFavoriteToCart(item)}>В корзину</button></div></article>)}</div> : <div className="account-dashboard-empty account-dashboard-empty--compact"><Heart /><p>Сохраните понравившиеся товары, чтобы вернуться к ним позже.</p><Link href="/catalog">Открыть каталог</Link></div>}
            </section>

            <aside className="account-dashboard-card account-dashboard-addresses" id="addresses">
              <div className="account-dashboard-card-head"><h2>Адреса доставки</h2><a href="#addresses" onClick={() => setAddingAddress(true)}>Все адреса <ArrowRight /></a></div>
              {addresses.length ? <div className="account-dashboard-address"><MapPin /><p>{addresses[0]}</p><span>Основной</span></div> : <div className="account-dashboard-address account-dashboard-address--empty"><MapPin /><p>Адреса доставки пока нет</p></div>}
              {addingAddress ? <form className="account-dashboard-address-form" onSubmit={addAddress}><input autoFocus value={addressDraft} onChange={(event) => setAddressDraft(event.target.value)} placeholder="Город, улица, дом, квартира" /><button>Сохранить адрес</button></form> : <button type="button" className="account-dashboard-add-address" onClick={() => setAddingAddress(true)}><Plus />Добавить адрес</button>}
            </aside>
          </div>
        </div>
      </div>

      <section className="account-dashboard-help">
        <div><p>Нужна помощь?</p><h2>Мы всегда на связи</h2><span>Напишите нам или позвоните — поможем с выбором и подскажем по заказу.</span><Link href="/contacts">Связаться с нами <ArrowRight /></Link></div>
        <ul><li><Package />+375 29 802 70 61<small>ПН–ПТ: 9:00–18:00</small></li><li><Heart />@bullmet_by<small>Быстрые ответы в Telegram</small></li><li><Bell />info@bullmet.by<small>Письменно, с деталями</small></li></ul>
      </section>
    </section>
  );
}

function StatCard({ icon, label, value, hint }: { icon: 'cart' | 'package' | 'request' | 'shield' | 'clock'; label: string; value: string; hint: string }) {
  return (
    <article>
      <Icon name={icon} />
      <span>{label}</span>
      <b>{value}</b>
      <small>{hint}</small>
    </article>
  );
}

function ActionCard({ icon, title, text, href, label }: { icon: 'cart' | 'request' | 'search' | 'shield'; title: string; text: string; href: string; label: string }) {
  return (
    <article>
      <Icon name={icon} />
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href}>{label}</Link>
    </article>
  );
}

function EmptyMini({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="account-stable-empty">
      <p>{text}</p>
      <Link href={href}>{label}</Link>
    </div>
  );
}

function OrdersPreview({ orders }: { orders: OrderRow[] }) {
  if (!orders.length) return <EmptyMini text="Заказов пока нет. После оформления корзины они появятся здесь." href="/catalog" label="Перейти в каталог" />;

  return (
    <div className="account-stable-list">
      {orders.slice(0, 4).map((order) => (
        <article key={order.id}>
          <div>
            <b>{order.id}</b>
            <em className={statusClass(order.status)}>{order.status || 'Новый'}</em>
          </div>
          <span>{dateLabel(order.created_at)} · {money(Number(order.total || 0))} BYN</span>
        </article>
      ))}
    </div>
  );
}

function RequestsPreview({ requests }: { requests: RequestRow[] }) {
  if (!requests.length) return <EmptyMini text="Обращений пока нет. По вопросам о часах можно связаться с нами напрямую." href="/contacts" label="Связаться" />;

  return (
    <div className="account-stable-list">
      {requests.slice(0, 4).map((request) => (
        <article key={request.id}>
          <div>
            <b>{request.type || request.product_title || 'Заявка'}</b>
            <em className={statusClass(request.status)}>{request.status || 'Новая'}</em>
          </div>
          <span>{request.product_title || request.id} · {dateLabel(request.created_at)}</span>
        </article>
      ))}
    </div>
  );
}

function FavoritesPreview({ favorites, onAdd, onRemove }: { favorites: FavoriteItem[]; onAdd: (item: FavoriteItem) => void; onRemove: (slug: string) => void }) {
  if (!favorites.length) return <EmptyMini text="Избранных товаров пока нет." href="/catalog" label="Смотреть товары" />;

  return (
    <div className="account-stable-favorites">
      {favorites.slice(0, 4).map((item) => (
        <article key={item.slug}>
          <Link href={`/product/${item.slug}`}>{item.image ? <img src={item.image} alt="" /> : <span>Фото</span>}</Link>
          <div>
            <Link href={`/product/${item.slug}`}>{item.title}</Link>
            <b>от {money(Number(item.price || 0))} BYN</b>
            <div>
              <button type="button" onClick={() => onAdd(item)}>В корзину</button>
              <button type="button" onClick={() => onRemove(item.slug)}>Убрать</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
