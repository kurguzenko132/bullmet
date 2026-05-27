'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { CartIcon, DraftIcon, UserIcon } from './Icons';
import { type AdminProduct, readAdminProductsAsync } from './adminProductStore';
import { ORDER_STATUSES, type AdminOrder, type AdminRequest, readAdminOrdersAsync, readAdminRequestsAsync } from './adminBusinessStore';
import { defaultHomeSettings, readHomeSettingsAsync, type HomeSettings } from './siteSettings';
import { loadAllReviews, type ProductReview } from '@/lib/reviews';

function statusType(status: string) {
  if (status === 'Новый' || status === 'Новая') return 'new';
  if (status === 'Оплачен' || status === 'Завершен' || status === 'Заказ принят' || status === 'Готово' || status === 'Готов к выдаче') return 'paid';
  return 'process';
}

function money(value: number) {
  return `${Number(value || 0).toLocaleString('ru-RU')} BYN`;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

function seriesByDay<T extends { createdAt: string }>(items: T[], getValue: (item: T) => number = () => 1) {
  return lastSevenDays().map((date) => {
    const key = date.toISOString().slice(0, 10);
    return items
      .filter((item) => new Date(item.createdAt).toISOString().slice(0, 10) === key)
      .reduce((sum, item) => sum + getValue(item), 0);
  });
}

function flatSeries(value: number) {
  return Array.from({ length: 7 }, () => value);
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [nextOrders, nextRequests, nextProducts, nextHomeSettings, nextReviews] = await Promise.all([
        readAdminOrdersAsync(),
        readAdminRequestsAsync(),
        readAdminProductsAsync(),
        readHomeSettingsAsync(),
        loadAllReviews().catch(() => [] as ProductReview[]),
      ]);
      if (!mounted) return;
      setOrders(nextOrders);
      setRequests(nextRequests);
      setProducts(nextProducts);
      setHomeSettings(nextHomeSettings);
      setReviews(nextReviews);
      setLoading(false);
    }

    load();
    window.addEventListener('bullmet-admin-orders-updated', load);
    window.addEventListener('bullmet-admin-requests-updated', load);
    window.addEventListener('bullmet-products-updated', load);
    window.addEventListener('bullmet-home-settings-updated', load);
    window.addEventListener('storage', load);

    return () => {
      mounted = false;
      window.removeEventListener('bullmet-admin-orders-updated', load);
      window.removeEventListener('bullmet-admin-requests-updated', load);
      window.removeEventListener('bullmet-products-updated', load);
      window.removeEventListener('bullmet-home-settings-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);
  const customersCount = useMemo(() => new Set(orders.map((order) => String(order.customer.email || order.customer.phone || '').toLowerCase()).filter(Boolean)).size, [orders]);
  const activeOrders = useMemo(() => orders.filter((order) => !['Завершен', 'Отменен'].includes(order.status)).length, [orders]);
  const activeRequests = useMemo(() => requests.filter((request) => !['Закрыта', 'Отменена'].includes(request.status)).length, [requests]);
  const popularProducts = useMemo(() => products.filter((product) => product.isPopular || product.status === 'active').slice(0, 5), [products]);
  const pendingReviews = useMemo(() => reviews.filter((review) => (review.status || 'pending') === 'pending').length, [reviews]);
  const productsWithoutPhoto = useMemo(() => products.filter((product) => !product.image || product.image.includes('cat-')).length, [products]);
  const productsWithoutPrice = useMemo(() => products.filter((product) => Number(product.price || 0) <= 0).length, [products]);
  const orderSeries = useMemo(() => seriesByDay(orders), [orders]);
  const revenueSeries = useMemo(() => seriesByDay(orders, (order) => Number(order.total || 0)), [orders]);
  const requestSeries = useMemo(() => seriesByDay(requests), [requests]);
  const reviewSeries = useMemo(() => seriesByDay(reviews.map((review) => ({ createdAt: review.created_at ?? new Date().toISOString() }))), [reviews]);
  const productSeries = useMemo(() => flatSeries(products.length), [products.length]);
  const auditSeries = useMemo(() => flatSeries(productsWithoutPhoto + productsWithoutPrice), [productsWithoutPhoto, productsWithoutPrice]);
  const latestOrders = orders.slice(0, 6);
  const latestActivity = useMemo(() => {
    const orderItems = orders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      title: `Заказ ${order.id}`,
      date: order.createdAt,
      icon: CartIcon,
      color: 'gray',
    }));
    const requestItems = requests.slice(0, 4).map((request) => ({
      id: `request-${request.id}`,
      title: `Заявка ${request.id}`,
      date: request.createdAt,
      icon: DraftIcon,
      color: 'blue',
    }));
    return [...orderItems, ...requestItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [orders, requests]);

  const statusRows = useMemo(() => {
    const source = ORDER_STATUSES;
    return source.map((label) => {
      const count = orders.filter((order) => order.status === label).length;
      const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
      return { label, count, percent };
    }).filter((item) => item.count > 0);
  }, [orders]);

  return (
    <AdminLayout title="Главная">
      <main className="adminContent">
        <section className="adminGrid adminGrid--top">
          <div className="adminCard adminHeroCard">
            <div className="adminCardTitle">Главный слайд</div>
            <div className="adminHeroPreview">
              <Image key={homeSettings?.heroImage ?? 'loading-hero'} src={homeSettings?.heroImage ?? defaultHomeSettings.heroImage} alt="Главный слайд Bullmet" fill sizes="50vw" />
              <div className="adminHeroText">
                <h2>Bullmet — собственное производство изделий из металла и дерева</h2>
                <p>Фото главного экрана, категории и ссылки можно менять в разделе настроек главной страницы.</p>
                <div><Link href="/admin/home">Редактировать главную</Link><Link href="/admin/content">Контент сайта</Link><Link href="/admin/products/new">Добавить товар</Link></div>
              </div>
            </div>
          </div>
          <div className="adminMetrics">
            <MetricCard label="Заказы" value={String(orders.length)} note={`${activeOrders} активных`} color="orange" series={orderSeries} />
            <MetricCard label="Выручка" value={money(revenue)} note="по оформленным заказам" color="green" series={revenueSeries} />
            <MetricCard label="Заявки" value={String(requests.length)} note={`${activeRequests} в работе`} color="blue" series={requestSeries} />
            <MetricCard label="Отзывы" value={String(reviews.length)} note={`${pendingReviews} на модерации`} color="orange" series={reviewSeries} />
            <MetricCard label="Товары" value={String(products.length)} note="в каталоге" color="purple" series={productSeries} />
            <MetricCard label="Проверить" value={String(productsWithoutPhoto + productsWithoutPrice)} note="товары без фото/цены" color="blue" series={auditSeries} />
          </div>
        </section>

        <section className="adminGrid adminGrid--middle">
          <div className="adminCard adminQuickCard">
            <div className="adminCardTitle">Быстрые действия</div>
            <div className="adminQuickGrid">
              <Link href="/admin/products/new"><CartIcon /><span>Добавить товар</span></Link>
              <Link href="/admin/products"><CartIcon /><span>Каталог товаров</span></Link>
              <Link href="/admin/categories"><DraftIcon /><span>Категории</span></Link>
              <Link href="/admin/orders"><CartIcon /><span>Открыть заказы</span></Link>
              <Link href="/admin/requests"><DraftIcon /><span>Открыть заявки</span></Link>
              <Link href="/admin/reviews"><UserIcon /><span>Модерация отзывов</span></Link>
              <Link href="/admin/content"><DraftIcon /><span>Контент сайта</span></Link>
            </div>
          </div>

          <div className="adminCard adminLineCard">
            <div className="adminCardHead"><div className="adminCardTitle">Последние заказы</div><Link href="/admin/orders">Все заказы</Link></div>
            {latestOrders.length ? latestOrders.map((order) => (
              <div className="adminOrderRow" key={order.id}>
                <b>#{order.id}</b>
                <span>{shortDate(order.createdAt)}</span>
                <span>{order.customer.name || order.customer.phone}</span>
                <em className={`adminStatus adminStatus--${statusType(order.status)}`}>{order.status}</em>
                <strong>{money(order.total)}</strong>
              </div>
            )) : <EmptyAdmin text="Реальных заказов пока нет. Оформите тестовый заказ на сайте — он появится здесь." />}
          </div>

          <div className="adminCard adminTrafficCard">
            <div className="adminCardTitle">Активность</div>
            {latestActivity.length ? latestActivity.map(({ id, title, date, icon: Icon, color }) => (
              <div className="adminActivityRow" key={id}>
                <span className={`adminActivityIcon adminActivityIcon--${color}`}><Icon /></span>
                <div><b>{title}</b><small>{shortDate(date)}</small></div>
              </div>
            )) : <EmptyAdmin text="Новых заказов и заявок пока нет." />}
          </div>
        </section>

        <section className="adminGrid adminGrid--lists">
          <div className="adminCard adminProducts">
            <div className="adminCardHead"><div className="adminCardTitle">Товары в каталоге</div><Link href="/admin/products">Все товары</Link></div>
            {popularProducts.length ? popularProducts.map((product) => (
              <div className="adminProductRow" key={product.slug}>
                <Image src={product.image} alt="" width={44} height={44} />
                <span>{product.title}</span>
                <b>{money(product.price)}</b>
                <Link href={`/admin/products/${product.slug}/edit`} className="adminIconLink">✎</Link>
              </div>
            )) : <EmptyAdmin text="Добавьте первый товар в админке." />}
          </div>

          <div className="adminCard adminOrders">
            <div className="adminCardHead"><div className="adminCardTitle">Заявки на расчет</div><Link href="/admin/requests">Все заявки</Link></div>
            {requests.length ? requests.slice(0, 6).map((request) => (
              <div className="adminOrderRow" key={request.id}>
                <b>{request.id}</b>
                <span>{shortDate(request.createdAt)}</span>
                <span>{request.customer.name || request.customer.phone}</span>
                <em className={`adminStatus adminStatus--${statusType(request.status)}`}>{request.status}</em>
                <strong>{request.type}</strong>
              </div>
            )) : <EmptyAdmin text="Реальных заявок пока нет. Отправьте тестовую заявку через форму /request." />}
          </div>

          <div className="adminCard adminActivity">
            <div className="adminCardTitle">Покупатели</div>
            <div className="adminMetric adminMetric--flat"><span>Уникальных клиентов</span><b>{customersCount}</b><small>по email или телефону из заказов</small><UserIcon /></div>
            <div className="adminMetric adminMetric--flat"><span>Текущих заказов</span><b>{activeOrders}</b><small>без завершенных и отмененных</small><CartIcon /></div>
          </div>
        </section>

        <section className="adminGrid adminGrid--bottom">
          <div className="adminCard adminSales">
            <div className="adminCardTitle">Заказы по статусам</div>
            {statusRows.length ? (
              <div className="adminStatusList adminStatusList--wide">
                {statusRows.map((row) => <span key={row.label}><i className="orange" />{row.label}<b>{row.count}</b><em>{row.percent}%</em></span>)}
              </div>
            ) : <EmptyAdmin text="Статистика появится после первого заказа." />}
          </div>
          <div className="adminCard adminStatuses">
            <div className="adminCardHead"><div className="adminCardTitle">Что требует внимания</div><Link href="/admin/reviews">Отзывы</Link></div>
            <div className="adminTodoList">
              <span><b>{pendingReviews}</b><em>отзывов на модерации</em></span>
              <span><b>{productsWithoutPhoto}</b><em>товаров без нормального фото</em></span>
              <span><b>{productsWithoutPrice}</b><em>товаров без цены</em></span>
              <span><b>{activeRequests}</b><em>активных заявок</em></span>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}

function MetricCard({ label, value, note, color, series }: { label: string; value: string; note: string; color: string; series: number[] }) {
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = Math.max(max - min, 1);
  const points = series.map((item, index) => {
    const x = series.length === 1 ? 0 : (136 / (series.length - 1)) * index;
    const y = 42 - ((item - min) / range) * 34;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return <div className="adminMetric"><span>{label}</span><b>{value}</b><small>{note}</small><svg viewBox="0 0 136 48"><polyline className={`stroke-${color}`} points={points} /></svg></div>;
}

function EmptyAdmin({ text }: { text: string }) {
  return <div className="adminEmpty"><p>{text}</p></div>;
}
