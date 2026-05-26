'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer, Header } from './HomePage';
import { getCurrentSession, signOutBullmet, type BullmetSession } from '@/lib/auth';
import { readFavorites, removeFavorite, type FavoriteItem } from '@/lib/favorites';
import { loadAllReviews, type ProductReview } from '@/lib/reviews';
import { readAdminOrdersAsync, readAdminRequestsAsync, type AdminOrder, type AdminRequest } from './adminBusinessStore';

const tabs = [
  { id: 'orders', label: 'Мои заказы' },
  { id: 'requests', label: 'Мои заявки' },
  { id: 'favorites', label: 'Избранное' },
  { id: 'reviews', label: 'Мои отзывы' },
  { id: 'profile', label: 'Профиль' },
] as const;

type AccountTab = typeof tabs[number]['id'];

type ProfileDraft = {
  name: string;
  phone: string;
  city: string;
  address: string;
};

const PROFILE_KEY = 'bullmet-account-profile';

const orderSteps = ['Новый', 'В обработке', 'Ожидает оплаты', 'Оплачен', 'Изготавливается', 'Готов к выдаче', 'Доставляется', 'Завершен'];
const requestSteps = ['Новая', 'В работе', 'Ожидает клиента', 'Расчет отправлен', 'Заказ принят', 'Изготавливается', 'Готово', 'Закрыта'];

function readProfile(email: string, fullName?: string | null): ProfileDraft {
  if (typeof window === 'undefined') return { name: fullName || '', phone: '', city: '', address: '' };
  try {
    const all = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || '{}') as Record<string, ProfileDraft>;
    return all[email] || { name: fullName || '', phone: '', city: '', address: '' };
  } catch {
    return { name: fullName || '', phone: '', city: '', address: '' };
  }
}

function saveProfile(email: string, profile: ProfileDraft) {
  if (typeof window === 'undefined') return;
  const all = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || '{}') as Record<string, ProfileDraft>;
  all[email] = profile;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
}

function statusProgress(status: string, steps: string[]) {
  if (['Отменен', 'Отменена'].includes(status)) return 100;
  const index = steps.indexOf(status);
  if (index < 0) return 12;
  return Math.max(12, Math.round(((index + 1) / steps.length) * 100));
}

function reviewStatusLabel(status?: string | null) {
  if (status === 'published') return 'Опубликован';
  if (status === 'hidden') return 'Скрыт';
  return 'На модерации';
}

export function AccountDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [profile, setProfile] = useState<ProfileDraft>({ name: '', phone: '', city: '', address: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAccount(nextSession?: BullmetSession | null) {
    const current = nextSession ?? await getCurrentSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    if (current.role === 'admin') {
      router.replace('/admin');
      return;
    }
    setSession(current);
    const [allOrders, allRequests, favoriteItems, allReviews] = await Promise.all([
      readAdminOrdersAsync(),
      readAdminRequestsAsync(),
      readFavorites(current),
      loadAllReviews().catch(() => [] as ProductReview[]),
    ]);
    const email = current.email.toLowerCase();
    setOrders(allOrders.filter((order) => String(order.customer?.email || '').toLowerCase() === email));
    setRequests(allRequests.filter((request) => String(request.customer?.email || '').toLowerCase() === email));
    setReviews(allReviews.filter((review) => String(review.user_email || '').toLowerCase() === email));
    setFavorites(favoriteItems);
    setProfile(readProfile(current.email, current.fullName));
    setLoading(false);
  }

  useEffect(() => {
    const syncHash = () => {
      if (typeof window === 'undefined') return;
      const value = window.location.hash.replace('#', '') as AccountTab;
      if (tabs.some((tab) => tab.id === value)) setActiveTab(value);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const current = await getCurrentSession();
      if (!mounted) return;
      if (!current) {
        router.replace('/login');
        return;
      }
      if (current.role === 'admin') {
        router.replace('/admin');
        return;
      }
      await loadAccount(current);
    }
    init();
    const updateAccount = () => loadAccount();
    window.addEventListener('bullmet-favorites-updated', updateAccount);
    window.addEventListener('bullmet-admin-orders-updated', updateAccount);
    window.addEventListener('bullmet-admin-requests-updated', updateAccount);
    window.addEventListener('storage', updateAccount);
    return () => {
      mounted = false;
      window.removeEventListener('bullmet-favorites-updated', updateAccount);
      window.removeEventListener('bullmet-admin-orders-updated', updateAccount);
      window.removeEventListener('bullmet-admin-requests-updated', updateAccount);
      window.removeEventListener('storage', updateAccount);
    };
  }, [router]);

  const total = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);
  const activeItems = useMemo(() => orders.filter((order) => !['Завершен', 'Отменен'].includes(order.status)).length + requests.filter((request) => !['Закрыта', 'Отменена'].includes(request.status)).length, [orders, requests]);

  async function logout() {
    await signOutBullmet();
    router.replace('/login');
  }

  async function deleteFavorite(slug: string) {
    await removeFavorite(slug, session);
    setFavorites((items) => items.filter((item) => item.slug !== slug));
  }

  function saveProfileForm() {
    if (!session) return;
    saveProfile(session.email, profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  if (loading) {
    return <><Header /><main className="accountPage"><section className="container catalogHero"><h1 className="pageTitle">Личный кабинет</h1><p>Загружаем данные аккаунта...</p></section></main><Footer /></>;
  }

  if (!session) return null;

  return (
    <>
      <Header />
      <main className="accountPage">
        <section className="container catalogHero accountHeroV2">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Личный кабинет</span></div>
          <h1 className="pageTitle">Личный кабинет</h1>
          <p>Здесь собраны ваши заказы, заявки, избранные товары, отзывы и ответы менеджера Bullmet.</p>
        </section>

        <section className="container accountDashboard accountDashboard--full">
          <aside className="accountSidebar">
            <div className="accountMiniProfile">
              <span className="accountAvatar">{session.email.slice(0, 1).toUpperCase()}</span>
              <h2>{profile.name || session.fullName || 'Покупатель Bullmet'}</h2>
              <p>{session.email}</p>
              <em>{activeItems ? `${activeItems} активных обращений` : 'Покупатель'}</em>
            </div>

            <nav className="accountTabs" aria-label="Разделы личного кабинета">
              {tabs.map((tab) => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
              ))}
            </nav>

            <div className="accountLogged__actions accountLogged__actions--vertical">
              <Link className="button button--orange" href="/request">Заказать расчет</Link>
              <Link className="button button--outline" href="/catalog">В каталог</Link>
              <button className="button button--outline" type="button" onClick={logout}>Выйти</button>
            </div>
          </aside>

          <div className="accountMain">
            <div className="accountStats accountStats--top accountStats--client">
              <div><b>{orders.length}</b><span>заказов</span></div>
              <div><b>{requests.length}</b><span>заявок</span></div>
              <div><b>{favorites.length}</b><span>избранных</span></div>
              <div><b>{reviews.length}</b><span>отзывов</span></div>
              <div><b>{total.toLocaleString('ru-RU')} BYN</b><span>сумма заказов</span></div>
            </div>

            {activeTab === 'orders' && (
              <section className="accountBox accountBox--wide">
                <div className="accountBox__head"><h2>Мои заказы</h2><Link href="/catalog">Купить еще</Link></div>
                {orders.length ? orders.map((order) => (
                  <article className="accountOrder accountOrder--rich accountOrder--tracked" key={order.id}>
                    <div className="accountOrder__top"><b>Заказ {order.id}</b><span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span><em>{order.status}</em></div>
                    <div className="accountStatusProgress"><i style={{ width: `${statusProgress(order.status, orderSteps)}%` }} /><span>{order.status}</span></div>
                    <p>{order.items.map((item) => `${item.title} × ${item.quantity}${item.size ? ` · ${item.size}` : ''}`).join(', ')}</p>
                    {order.adminNote && <div className="accountManagerNote"><b>Ответ менеджера</b><p>{order.adminNote}</p></div>}
                    <strong>{Number(order.total || 0).toLocaleString('ru-RU')} BYN</strong>
                  </article>
                )) : <EmptyState title="У вас пока нет заказов" text="Перейдите в каталог, добавьте товар в корзину и оформите первый заказ." href="/catalog" action="Перейти в каталог" />}
              </section>
            )}

            {activeTab === 'requests' && (
              <section className="accountBox accountBox--wide">
                <div className="accountBox__head"><h2>Мои заявки</h2><Link href="/request">Новая заявка</Link></div>
                {requests.length ? requests.map((request) => (
                  <article className="accountOrder accountOrder--rich accountOrder--tracked" key={request.id}>
                    <div className="accountOrder__top"><b>{request.type}</b><span>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</span><em>{request.status}</em></div>
                    <div className="accountStatusProgress"><i style={{ width: `${statusProgress(request.status, requestSteps)}%` }} /><span>{request.status}</span></div>
                    <p>{request.comment || request.sizes || 'Заявка на расчет стоимости'}</p>
                    {request.productTitle && <strong>Товар: {request.productTitle}</strong>}
                    {request.fileUrls?.length ? <small className="accountFileCount">Прикреплено файлов: {request.fileUrls.length}</small> : null}
                    {request.adminNote && <div className="accountManagerNote"><b>Ответ менеджера</b><p>{request.adminNote}</p></div>}
                  </article>
                )) : <EmptyState title="Заявок пока нет" text="Отправьте чертеж, фото или описание идеи — мы подготовим расчет." href="/request" action="Оставить заявку" />}
              </section>
            )}

            {activeTab === 'favorites' && (
              <section className="accountBox accountBox--wide">
                <div className="accountBox__head"><h2>Избранное</h2><Link href="/catalog">Смотреть каталог</Link></div>
                {favorites.length ? (
                  <div className="favoriteGrid">
                    {favorites.map((item) => (
                      <article className="favoriteCard" key={item.slug}>
                        <Link href={`/catalog/${item.slug}`} className="favoriteCard__image"><Image src={item.image} alt={item.title} fill sizes="240px" /></Link>
                        <div>
                          <Link href={`/catalog/${item.slug}`}><b>{item.title}</b></Link>
                          <p>{item.short || item.category}</p>
                          <strong>от {Number(item.price || 0).toLocaleString('ru-RU')} BYN</strong>
                          <button type="button" onClick={() => deleteFavorite(item.slug)}>Убрать из избранного</button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <EmptyState title="В избранном пока пусто" text="Нажимайте на сердечко в каталоге или карточке товара, чтобы сохранить понравившиеся изделия." href="/catalog" action="Выбрать товары" />}
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="accountBox accountBox--wide">
                <div className="accountBox__head"><h2>Мои отзывы</h2><Link href="/catalog">Выбрать товар</Link></div>
                {reviews.length ? (
                  <div className="accountReviewsList">
                    {reviews.map((review) => (
                      <article className="accountReviewCard" key={review.id}>
                        <div className="accountReviewCard__top">
                          <Link href={`/catalog/${review.product_slug}#reviews`}>Товар: {review.product_slug}</Link>
                          <em className={`reviewStatus reviewStatus--${review.status || 'pending'}`}>{reviewStatusLabel(review.status)}</em>
                        </div>
                        <strong>{'★'.repeat(review.rating)}<i>{'★'.repeat(5 - review.rating)}</i></strong>
                        <p>{review.comment}</p>
                        {Boolean(review.photo_urls?.length) && (
                          <div className="accountReviewPhotos">
                            {review.photo_urls?.slice(0, 5).map((url, index) => <Image src={url} alt={`Фото отзыва ${index + 1}`} width={72} height={72} key={`${url}-${index}`} />)}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : <EmptyState title="Вы пока не оставляли отзывы" text="Откройте товар, поставьте оценку и добавьте фото — после модерации отзыв появится на сайте." href="/catalog" action="Перейти в каталог" />}
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="accountBox accountBox--wide">
                <div className="accountBox__head"><h2>Профиль и доставка</h2>{saved && <span className="profileSaved">Сохранено</span>}</div>
                <div className="profileForm">
                  <label><span>Имя</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Ваше имя" /></label>
                  <label><span>Телефон</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+375 ..." /></label>
                  <label><span>Город</span><input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Минск" /></label>
                  <label className="profileForm__wide"><span>Адрес доставки</span><textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Улица, дом, квартира или комментарий для доставки" /></label>
                </div>
                <button className="button button--orange profileSaveButton" type="button" onClick={saveProfileForm}>Сохранить данные</button>
              </section>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ title, text, href, action }: { title: string; text: string; href: string; action: string }) {
  return (
    <div className="accountEmptyState">
      <b>{title}</b>
      <p>{text}</p>
      <Link className="button button--orange" href={href}>{action}</Link>
    </div>
  );
}
