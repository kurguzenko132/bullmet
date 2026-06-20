'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [cart]);
  const adminEmails = useMemo(() => getAdminEmails(), []);
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());
  const displayName = profile.full_name || profileDraft.fullName || user?.email?.split('@')[0] || 'клиент';

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

  if (status === 'loading') {
    return (
      <section className="account-state-card account-state-card--rich">
        <div className="account-loader" />
        <h1>Открываем личный кабинет</h1>
        <p>Проверяем вход и загружаем данные без лишних редиректов.</p>
      </section>
    );
  }

  if (status === 'config-error') {
    return (
      <section className="account-state-card account-state-card--rich">
        <h1>Supabase не подключен</h1>
        <p>Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel и .env.local.</p>
        <Link className="account-state-link" href="/login?next=/account">Вернуться ко входу</Link>
      </section>
    );
  }

  return (
    <section className="account-stable-shell">
      <div className="account-stable-hero">
        <div>
          <p className="section-kicker">Личный кабинет</p>
          <h1>Здравствуйте, {displayName}</h1>
          <span>{user?.email}</span>
          {dataMessage && <small>{dataMessage}</small>}
        </div>
        <div className="account-stable-hero-actions">
          {isAdmin && <Link href="/admin">Админка</Link>}
          <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Выходим...' : 'Выйти'}</button>
        </div>
      </div>

      <div className="account-stable-stats">
        <StatCard icon="cart" label="Корзина" value={String(cartCount)} hint={`${money(cartTotal)} BYN`} />
        <StatCard icon="package" label="Заказы" value={String(orders.length)} hint={orders[0] ? dateLabel(orders[0].created_at) : 'пока нет'} />
        <StatCard icon="request" label="Заявки" value={String(requests.length)} hint={requests[0] ? dateLabel(requests[0].created_at) : 'пока нет'} />
        <StatCard icon="shield" label="Избранное" value={String(favorites.length)} hint={loadingData ? 'обновляем...' : 'сохранено'} />
      </div>

      <div className="account-stable-layout">
        <div className="account-stable-main">
          <section className="account-stable-card">
            <div className="account-stable-card-head">
              <div>
                <p className="section-kicker">Быстрые действия</p>
                <h2>Что можно сделать</h2>
              </div>
            </div>
            <div className="account-stable-actions">
              <ActionCard icon="cart" title="Открыть корзину" text={cartCount ? `В корзине ${cartCount} товар(ов).` : 'Корзина пока пустая.'} href="/cart" label={cartCount ? 'Оформить' : 'Перейти'} />
              <ActionCard icon="request" title="Заказать расчет" text="Отправьте фото, чертеж или описание изделия." href="/services#request" label="Создать заявку" />
              <ActionCard icon="search" title="Каталог" text="Вернитесь к товарам и подберите изделие." href="/catalog" label="Смотреть" />
            </div>
          </section>

          <section className="account-stable-card">
            <div className="account-stable-card-head">
              <div>
                <p className="section-kicker">Заказы и заявки</p>
                <h2>Последняя активность</h2>
              </div>
              <Link href="/cart">Новый заказ</Link>
            </div>
            <div className="account-stable-feed">
              <OrdersPreview orders={orders} />
              <RequestsPreview requests={requests} />
            </div>
          </section>
        </div>

        <aside className="account-stable-side">
          <section className="account-stable-card">
            <div className="account-stable-card-head">
              <div>
                <p className="section-kicker">Профиль</p>
                <h2>Контакты</h2>
              </div>
            </div>
            <form className="account-stable-profile-form" onSubmit={saveProfile}>
              <label>
                <span>Имя</span>
                <input value={profileDraft.fullName} onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder="Как к вам обращаться" />
              </label>
              <label>
                <span>Телефон</span>
                <input value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="+375 29 000-00-00" />
              </label>
              <label>
                <span>Email</span>
                <input value={user?.email || ''} disabled />
              </label>
              {profileMessage && <p>{profileMessage}</p>}
              <button disabled={savingProfile}>{savingProfile ? 'Сохраняем...' : 'Сохранить'}</button>
            </form>
          </section>

          <section className="account-stable-card">
            <div className="account-stable-card-head">
              <div>
                <p className="section-kicker">Избранное</p>
                <h2>Сохраненные товары</h2>
              </div>
              <Link href="/catalog">Добавить</Link>
            </div>
            <FavoritesPreview favorites={favorites} onAdd={addFavoriteToCart} onRemove={removeFavorite} />
          </section>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, hint }: { icon: 'cart' | 'package' | 'request' | 'shield'; label: string; value: string; hint: string }) {
  return (
    <article>
      <Icon name={icon} />
      <span>{label}</span>
      <b>{value}</b>
      <small>{hint}</small>
    </article>
  );
}

function ActionCard({ icon, title, text, href, label }: { icon: 'cart' | 'request' | 'search'; title: string; text: string; href: string; label: string }) {
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
  if (!requests.length) return <EmptyMini text="Заявок пока нет. Отправьте чертеж или описание на расчет." href="/services#request" label="Отправить заявку" />;

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
