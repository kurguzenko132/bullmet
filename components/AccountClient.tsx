'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from './Icon';

type AccountStatus = 'loading' | 'ready' | 'config-error';
type AccountSection = 'overview' | 'orders' | 'requests' | 'favorites' | 'profile';

type AccountUser = {
  id: string;
  email: string;
  createdAt?: string;
};

type Profile = {
  full_name?: string | null;
  phone?: string | null;
};

type CartItem = {
  slug: string;
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
  return [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ]
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
  if (text.includes('выполн') || text.includes('completed')) return 'is-done';
  if (text.includes('работ') || text.includes('process')) return 'is-progress';
  if (text.includes('отмен') || text.includes('cancel')) return 'is-cancel';
  return 'is-new';
}

function readLocalCart() {
  if (typeof window === 'undefined') return [] as CartItem[];
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalFavorites() {
  if (typeof window === 'undefined') return [] as FavoriteItem[];
  try {
    const raw = window.localStorage.getItem('bullmet_favorites');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(items: FavoriteItem[]) {
  window.localStorage.setItem('bullmet_favorites', JSON.stringify(items));
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

export function AccountClient() {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [section, setSection] = useState<AccountSection>('overview');
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

  const adminEmails = getAdminEmails();
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [cart]);
  const lastOrder = orders[0];
  const lastRequest = requests[0];

  useEffect(() => {
    let active = true;
    let authReady = false;

    async function readSessionWithRetry() {
      if (!supabase) return null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) return data.session;

        const userResult = await supabase.auth.getUser();
        if (userResult.data.user) {
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.data.session) return refreshed.data.session;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }

      return null;
    }

    async function loadSession() {
      if (!supabase) {
        if (active) setStatus('config-error');
        return;
      }

      const session = await readSessionWithRetry();

      if (!active) return;

      if (!session) {
        router.replace('/login?next=/account');
        return;
      }

      const currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        createdAt: session.user.created_at
      };

      authReady = true;
      setUser(currentUser);
      setStatus('ready');
      setCart(readLocalCart());
      setFavorites(readLocalFavorites());
      void loadAccountData(currentUser);
    }

    loadSession();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (session) {
        authReady = true;
        const currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          createdAt: session.user.created_at
        };
        setUser(currentUser);
        setStatus('ready');
        setCart(readLocalCart());
        setFavorites(readLocalFavorites());
        void loadAccountData(currentUser);
        return;
      }

      if (authReady) router.replace('/login?next=/account');
    }) || { data: null };

    const updateLocalData = () => {
      setCart(readLocalCart());
      setFavorites(readLocalFavorites());
    };
    window.addEventListener('storage', updateLocalData);
    window.addEventListener('bullmet-cart-updated', updateLocalData);

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
      window.removeEventListener('storage', updateLocalData);
      window.removeEventListener('bullmet-cart-updated', updateLocalData);
    };
  }, [router]);

  async function loadAccountData(currentUser: AccountUser) {
    const client = supabase;
    if (!client) return;
    setLoadingData(true);

    try {
      const safeProfileQuery = async () => {
        const withPhone = await client.from('profiles').select('full_name, phone').eq('id', currentUser.id).maybeSingle();
        if (!withPhone.error) return withPhone;

        // На старой базе поля phone может еще не быть. Кабинет не должен из-за этого падать.
        const withoutPhone = await client.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle();
        return withoutPhone;
      };

      const safeFavoritesQuery = async () => {
        const result = await client.from('favorites').select('product_slug, title, price, image, short, category, created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
        return result;
      };

      const safeOrdersQuery = async () => {
        const result = await client.from('orders').select('id, created_at, customer, items, total, status, delivery').order('created_at', { ascending: false }).limit(30);
        return result;
      };

      const safeRequestsQuery = async () => {
        const result = await client.from('requests').select('id, created_at, customer, kind, type, product_title, product_image, product_price, quantity, status, comment').order('created_at', { ascending: false }).limit(30);
        return result;
      };

      const [profileResult, favoritesResult, ordersResult, requestsResult] = await Promise.allSettled([
        safeProfileQuery(),
        safeFavoritesQuery(),
        safeOrdersQuery(),
        safeRequestsQuery()
      ]);

      if (profileResult.status === 'fulfilled' && !profileResult.value.error && profileResult.value.data) {
        const nextProfile = profileResult.value.data as Profile;
        setProfile(nextProfile);
        setProfileDraft({
          fullName: nextProfile.full_name || '',
          phone: nextProfile.phone || ''
        });
      } else {
        setProfileDraft((current) => ({ ...current, fullName: current.fullName || '', phone: current.phone || '' }));
      }

      if (favoritesResult.status === 'fulfilled' && !favoritesResult.value.error && favoritesResult.value.data) {
        const fromDb = favoritesResult.value.data.map(normalizeFavorite).filter(Boolean) as FavoriteItem[];
        const fromLocal = readLocalFavorites();
        const merged = [...fromDb, ...fromLocal].filter((item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index);
        setFavorites(merged);
      }

      if (ordersResult.status === 'fulfilled' && !ordersResult.value.error && ordersResult.value.data) {
        const email = currentUser.email.toLowerCase();
        const filtered = (ordersResult.value.data as OrderRow[]).filter((order) => String(order.customer?.email || '').toLowerCase() === email);
        setOrders(filtered);
      }

      if (requestsResult.status === 'fulfilled' && !requestsResult.value.error && requestsResult.value.data) {
        const email = currentUser.email.toLowerCase();
        const filtered = (requestsResult.value.data as RequestRow[]).filter((request) => String(request.customer?.email || '').toLowerCase() === email);
        setRequests(filtered);
      }
    } finally {
      setLoadingData(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    await supabase?.auth.signOut();
    window.location.href = '/login?next=/account';
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    setProfileMessage('');
    setSavingProfile(true);
    try {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: profileDraft.fullName.trim(),
        phone: profileDraft.phone.trim()
      };
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) {
        // На старой базе поля phone может еще не быть — сохраняем хотя бы имя и email.
        const fallback = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: payload.full_name
        });
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

  function addFavoriteToCart(item: FavoriteItem) {
    const cartItem = {
      slug: item.slug,
      title: item.title,
      price: Number(item.price || 0),
      image: item.image || '',
      quantity: 1,
      size: 'Под заказ',
      material: item.short || item.category || ''
    };
    const current = readLocalCart();
    const existingIndex = current.findIndex((x) => x.slug === cartItem.slug && x.size === cartItem.size);
    if (existingIndex >= 0) current[existingIndex].quantity = Number(current[existingIndex].quantity || 0) + 1;
    else current.push(cartItem);
    window.localStorage.setItem('bullmet_cart', JSON.stringify(current));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
    setCart(current);
  }

  function removeFavorite(slug: string) {
    const next = favorites.filter((item) => item.slug !== slug);
    setFavorites(next);
    writeLocalFavorites(next);
    if (supabase && user) {
      void supabase.from('favorites').delete().eq('user_id', user.id).eq('product_slug', slug);
    }
  }

  if (status === 'loading') {
    return (
      <section className="account-state-card account-state-card--rich">
        <div className="account-loader" />
        <h1>Открываем личный кабинет</h1>
        <p>Проверяем вход и подгружаем ваши данные.</p>
      </section>
    );
  }

  if (status === 'config-error') {
    return (
      <section className="account-state-card account-state-card--rich">
        <h1>Supabase не подключен</h1>
        <p>Добавьте переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel и .env.local.</p>
      </section>
    );
  }

  return (
    <section className="account-page-shell account-page-shell--rich">
      <div className="account-hero-card account-hero-card--rich">
        <div>
          <p className="section-kicker">Личный кабинет Bullmet</p>
          <h1>{profile.full_name ? `Здравствуйте, ${profile.full_name}` : 'Добро пожаловать'}</h1>
          <span>{user?.email}</span>
        </div>
        <div className="account-hero-actions">
          {isAdmin && <Link href="/admin">Админка</Link>}
          <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Выходим...' : 'Выйти'}</button>
        </div>
      </div>

      <div className="account-overview-stats">
        <article>
          <Icon name="cart" />
          <span>В корзине</span>
          <b>{cartCount}</b>
          <small>{money(cartTotal)} BYN</small>
        </article>
        <article>
          <Icon name="request" />
          <span>Заявки</span>
          <b>{requests.length}</b>
          <small>{lastRequest ? `последняя: ${dateLabel(lastRequest.created_at)}` : 'пока нет'}</small>
        </article>
        <article>
          <Icon name="package" />
          <span>Заказы</span>
          <b>{orders.length}</b>
          <small>{lastOrder ? `последний: ${dateLabel(lastOrder.created_at)}` : 'пока нет'}</small>
        </article>
        <article>
          <Icon name="shield" />
          <span>Избранное</span>
          <b>{favorites.length}</b>
          <small>{loadingData ? 'обновляем...' : 'сохраненные товары'}</small>
        </article>
      </div>

      <div className="account-layout-rich">
        <aside className="account-sidebar-rich">
          {[
            ['overview', 'Обзор', 'factory'],
            ['orders', 'Заказы', 'package'],
            ['requests', 'Заявки', 'request'],
            ['favorites', 'Избранное', 'shield'],
            ['profile', 'Профиль', 'user']
          ].map(([key, label, icon]) => (
            <button key={key} type="button" className={section === key ? 'is-active' : ''} onClick={() => setSection(key as AccountSection)}>
              <Icon name={icon as any} />
              <span>{label}</span>
            </button>
          ))}
          <div className="account-sidebar-cta">
            <b>Нужен расчет?</b>
            <span>Отправьте чертеж, фото или описание задачи.</span>
            <Link href="/services#request">Заказать расчет</Link>
          </div>
        </aside>

        <div className="account-content-rich">
          {section === 'overview' && (
            <div className="account-section-rich">
              <div className="account-section-head">
                <div>
                  <p className="section-kicker">Обзор</p>
                  <h2>Ваши быстрые действия</h2>
                </div>
                <Link href="/catalog">Вернуться в каталог</Link>
              </div>

              <div className="account-actions-grid-rich">
                <article>
                  <Icon name="cart" />
                  <h3>Корзина</h3>
                  <p>{cartCount ? `В корзине ${cartCount} товар(ов) на сумму ${money(cartTotal)} BYN.` : 'Корзина пока пустая. Добавьте товары из каталога.'}</p>
                  <Link href="/cart">{cartCount ? 'Оформить заказ' : 'Перейти в каталог'}</Link>
                </article>
                <article>
                  <Icon name="request" />
                  <h3>Расчет изделия</h3>
                  <p>Пришлите фото, чертеж или описание. Мы уточним детали и подготовим стоимость.</p>
                  <Link href="/services#request">Заказать расчет</Link>
                </article>
                <article>
                  <Icon name="search" />
                  <h3>Каталог</h3>
                  <p>Посмотрите часы, качели, садовую мебель и другие изделия Bullmet.</p>
                  <Link href="/catalog">Смотреть товары</Link>
                </article>
              </div>

              <div className="account-two-columns-rich">
                <LatestOrders orders={orders} />
                <LatestRequests requests={requests} />
              </div>
            </div>
          )}

          {section === 'orders' && (
            <div className="account-section-rich">
              <div className="account-section-head">
                <div>
                  <p className="section-kicker">Заказы</p>
                  <h2>История заказов</h2>
                </div>
                <Link href="/cart">Открыть корзину</Link>
              </div>
              <OrdersList orders={orders} />
            </div>
          )}

          {section === 'requests' && (
            <div className="account-section-rich">
              <div className="account-section-head">
                <div>
                  <p className="section-kicker">Заявки</p>
                  <h2>Заявки и расчеты</h2>
                </div>
                <Link href="/services#request">Новая заявка</Link>
              </div>
              <RequestsList requests={requests} />
            </div>
          )}

          {section === 'favorites' && (
            <div className="account-section-rich">
              <div className="account-section-head">
                <div>
                  <p className="section-kicker">Избранное</p>
                  <h2>Сохраненные товары</h2>
                </div>
                <Link href="/catalog">Добавить товары</Link>
              </div>
              <FavoritesGrid favorites={favorites} onAdd={addFavoriteToCart} onRemove={removeFavorite} />
            </div>
          )}

          {section === 'profile' && (
            <div className="account-section-rich">
              <div className="account-section-head">
                <div>
                  <p className="section-kicker">Профиль</p>
                  <h2>Контактные данные</h2>
                </div>
              </div>
              <form className="account-profile-form-rich" onSubmit={saveProfile}>
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
                <button disabled={savingProfile}>{savingProfile ? 'Сохраняем...' : 'Сохранить данные'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, text, href, action }: { title: string; text: string; href: string; action: string }) {
  return (
    <div className="account-empty-rich">
      <b>{title}</b>
      <p>{text}</p>
      <Link href={href}>{action}</Link>
    </div>
  );
}

function LatestOrders({ orders }: { orders: OrderRow[] }) {
  return (
    <article className="account-mini-panel-rich">
      <div><h3>Последние заказы</h3><Link href="#" onClick={(event) => event.preventDefault()}>История</Link></div>
      {orders.length ? orders.slice(0, 3).map((order) => (
        <div className="account-mini-row" key={order.id}>
          <span>{order.id}</span>
          <b>{money(Number(order.total || 0))} BYN</b>
          <em className={statusClass(order.status)}>{order.status || 'Новый'}</em>
        </div>
      )) : <p>Заказов пока нет. Они появятся после оформления корзины.</p>}
    </article>
  );
}

function LatestRequests({ requests }: { requests: RequestRow[] }) {
  return (
    <article className="account-mini-panel-rich">
      <div><h3>Последние заявки</h3><Link href="/services#request">Новая</Link></div>
      {requests.length ? requests.slice(0, 3).map((request) => (
        <div className="account-mini-row" key={request.id}>
          <span>{request.type || 'Заявка'}</span>
          <b>{request.product_title || dateLabel(request.created_at)}</b>
          <em className={statusClass(request.status)}>{request.status || 'Новая'}</em>
        </div>
      )) : <p>Заявок пока нет. Отправьте чертеж или описание на расчет.</p>}
    </article>
  );
}

function OrdersList({ orders }: { orders: OrderRow[] }) {
  if (!orders.length) {
    return <EmptyState title="Заказов пока нет" text="Добавьте товары в корзину и оформите заказ — история появится здесь." href="/catalog" action="Перейти в каталог" />;
  }

  return (
    <div className="account-list-rich">
      {orders.map((order) => (
        <article key={order.id}>
          <div className="account-list-head">
            <div>
              <b>{order.id}</b>
              <span>{dateLabel(order.created_at)}</span>
            </div>
            <em className={statusClass(order.status)}>{order.status || 'Новый'}</em>
          </div>
          <div className="account-list-items">
            {(order.items || []).slice(0, 4).map((item, index) => (
              <div key={`${item.slug}-${index}`}>
                {item.image && <img src={item.image} alt="" />}
                <span>{item.title} × {item.quantity || 1}</span>
                <b>{money(Number(item.price || 0))} BYN</b>
              </div>
            ))}
          </div>
          <div className="account-list-bottom">
            <span>{order.delivery || 'Доставка по Беларуси'}</span>
            <b>Итого: {money(Number(order.total || 0))} BYN</b>
          </div>
        </article>
      ))}
    </div>
  );
}

function RequestsList({ requests }: { requests: RequestRow[] }) {
  if (!requests.length) {
    return <EmptyState title="Заявок пока нет" text="Отправьте фото, чертеж или описание изделия — статус заявки появится здесь." href="/services#request" action="Отправить заявку" />;
  }

  return (
    <div className="account-list-rich">
      {requests.map((request) => (
        <article key={request.id}>
          <div className="account-list-head">
            <div>
              <b>{request.type || 'Заявка'}</b>
              <span>{request.id} · {dateLabel(request.created_at)}</span>
            </div>
            <em className={statusClass(request.status)}>{request.status || 'Новая'}</em>
          </div>
          {request.product_title && (
            <div className="account-request-product">
              {request.product_image && <img src={request.product_image} alt="" />}
              <div>
                <b>{request.product_title}</b>
                <span>{request.quantity ? `Количество: ${request.quantity}` : 'Количество не указано'}{request.product_price ? ` · ${money(Number(request.product_price))} BYN` : ''}</span>
              </div>
            </div>
          )}
          {request.comment && <p>{request.comment}</p>}
        </article>
      ))}
    </div>
  );
}

function FavoritesGrid({ favorites, onAdd, onRemove }: { favorites: FavoriteItem[]; onAdd: (item: FavoriteItem) => void; onRemove: (slug: string) => void }) {
  if (!favorites.length) {
    return <EmptyState title="Избранных товаров пока нет" text="Нажимайте сердечко на карточке товара, чтобы быстро возвращаться к понравившимся изделиям." href="/catalog" action="Смотреть товары" />;
  }

  return (
    <div className="account-favorites-grid-rich">
      {favorites.map((item) => (
        <article key={item.slug}>
          <Link href={`/product/${item.slug}`} className="account-favorite-image">
            {item.image ? <img src={item.image} alt={item.title} /> : <span>Нет фото</span>}
          </Link>
          <div>
            <Link href={`/product/${item.slug}`}>{item.title}</Link>
            <p>{item.short || item.category || 'Товар Bullmet'}</p>
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
