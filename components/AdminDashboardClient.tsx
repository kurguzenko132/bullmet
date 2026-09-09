'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight, Bell, Boxes, ClipboardList, FilePlus2, ImagePlus, PackagePlus,
  Pencil, Wrench
} from 'lucide-react';
import type { AdminOrder, AdminRequest } from '@/lib/adminCommerce';
import { formatDate, money, orderStatuses, statusClass } from '@/lib/adminCommerce';
import { actionLabel, type AdminActivityItem } from '@/lib/adminPeople';
import type { HomeControlSettings } from '@/lib/homepageControl';
import type { CatalogProduct } from '@/lib/products';
import { AdminImagePicker } from './AdminImagePicker';

type Review = { id: string; created_at?: string; status?: string };

type Props = {
  products: CatalogProduct[];
  orders: AdminOrder[];
  requests: AdminRequest[];
  reviews: Review[];
  activity: AdminActivityItem[];
  homepage: HomeControlSettings;
};

const ranges = [7, 30, 90] as const;

function dateKey(value?: string) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function makeSeries(orders: AdminOrder[], days: number) {
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), value: 0, revenue: 0 };
  });
  const index = new Map(points.map((point, position) => [point.key, position]));
  orders.forEach((order) => {
    const position = index.get(dateKey(order.created_at));
    if (position === undefined) return;
    points[position].value += 1;
    if (order.status !== 'Отменён') points[position].revenue += Number(order.total || 0);
  });
  return points;
}

function makeBuyerSeries(orders: AdminOrder[], days: number) {
  const points = makeSeries([], days).map((point) => ({ ...point, buyers: new Set<string>() }));
  const index = new Map(points.map((point, position) => [point.key, position]));
  orders.forEach((order) => {
    const position = index.get(dateKey(order.created_at));
    const contact = order.customer?.email || order.customer?.phone || order.customer?.name;
    if (position !== undefined && contact) points[position].buyers.add(contact);
  });
  return points.map((point) => point.buyers.size);
}

function isCancelled(status?: string) {
  return String(status || '').toLowerCase().includes('отмен');
}

function LineChart({ values, color = '#f97316', label }: { values: number[]; color?: string; label: string }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${94 - (value / max) * 78}`).join(' ');
  return <svg className="admin-chart-line" viewBox="0 0 100 100" role="img" aria-label={label} preserveAspectRatio="none">
    <polyline points="0,94 100,94" fill="none" stroke="#e9edf2" strokeWidth="1" />
    <polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  return <LineChart values={values.slice(-7)} color={color} label="Динамика показателя" />;
}

export function AdminDashboardClient({ products, orders, requests, reviews, activity, homepage: initialHomepage }: Props) {
  const [homepage, setHomepage] = useState(initialHomepage);
  const [range, setRange] = useState<(typeof ranges)[number]>(30);
  const [editingHero, setEditingHero] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [heroMessage, setHeroMessage] = useState('');
  const series = useMemo(() => makeSeries(orders, range), [orders, range]);
  const monthSeries = useMemo(() => makeSeries(orders, 30), [orders]);
  const buyerSeries = useMemo(() => makeBuyerSeries(orders, 30), [orders]);
  const activeOrders = orders.filter((item) => !['Выполнен', 'Отменён'].includes(String(item.status || '')));
  const newOrders = orders.filter((item) => !item.status || item.status === 'Новый');
  const newRequests = requests.filter((item) => !item.status || item.status === 'Новая');
  const pendingReviews = reviews.filter((item) => !item.status || item.status === 'pending' || item.status === 'Новый');
  const revenue = orders.filter((item) => !isCancelled(item.status)).reduce((sum, item) => sum + Number(item.total || 0), 0);
  const buyers = new Set(orders.map((item) => item.customer?.email || item.customer?.phone || item.customer?.name).filter(Boolean)).size;
  const publishedProducts = products.filter((item) => item.status !== 'hidden' && item.status !== 'draft').length;
  const statuses = orderStatuses;
  const statusRows = statuses.map((status) => ({ status, value: orders.filter((order) => (order.status || 'Новый') === status).length })).filter((row) => row.value);
  const totalStatuses = Math.max(orders.length, 1);
  const popular = [...products].filter((item) => item.isPopular).slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const quickActions = [
    { title: 'Добавить товар', href: '/admin/products', icon: PackagePlus },
    { title: 'Добавить страницу', href: '/admin/pages', icon: FilePlus2 },
    { title: 'Добавить баннер', href: '/admin/banners', icon: ImagePlus },
    { title: 'Добавить услугу', href: '/admin/services', icon: Wrench }
  ];

  async function saveHero() {
    setSavingHero(true);
    setHeroMessage('');
    try {
      const response = await fetch('/api/admin/homepage-control', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: homepage })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить изменения.');
      setHomepage(result.settings || homepage);
      setHeroMessage('Главный слайд сохранён.');
      setEditingHero(false);
    } catch (error) {
      setHeroMessage(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    } finally {
      setSavingHero(false);
    }
  }

  return <div className="admin-dashboard-v2">
    <section className="admin-dashboard-top-v2">
      <article className="admin-hero-preview-v2">
        <div className="admin-hero-preview-image-v2" style={{ backgroundImage: `url(${homepage.hero.image})` }} />
        <div className="admin-hero-preview-overlay-v2" />
        <div className="admin-hero-preview-content-v2">
          <span>Главный слайд · Главная страница</span>
          <h1>{homepage.hero.title}</h1>
          <p>{homepage.hero.text}</p>
          <div><button type="button" onClick={() => setEditingHero(true)}><Pencil size={15} />Редактировать текст</button><button type="button" onClick={() => setEditingHero(true)}><ImagePlus size={15} />Сменить изображение</button></div>
        </div>
      </article>

      <div className="admin-dashboard-side-v2">
        <section className="admin-kpi-grid-v2">
          <Kpi title="Заказы" value={String(orders.length)} hint={`${activeOrders.length} активных`} color="#f97316" series={monthSeries.map((item) => item.value)} href="/admin/orders" />
          <Kpi title="Выручка" value={`${money(revenue)} BYN`} hint="без отменённых" color="#22a06b" series={monthSeries.map((item) => item.revenue)} href="/admin/reports" />
          <Kpi title="Покупатели" value={String(buyers)} hint="уникальные контакты" color="#3578e5" series={buyerSeries} href="/admin/customers" />
          <Kpi title="Товары" value={String(products.length)} hint={`${publishedProducts} опубликовано`} color="#8464d8" href="/admin/products" />
        </section>

        <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--analytics">
          <article className="admin-card-v2 admin-orders-chart-v2">
            <div className="admin-card-head-v2"><div><h2>Динамика заказов</h2><span>Фактические заказы за выбранный период</span></div><select value={range} onChange={(event) => setRange(Number(event.target.value) as (typeof ranges)[number])}>{ranges.map((days) => <option key={days} value={days}>За последние {days} дней</option>)}</select></div>
            <div className="admin-large-chart-v2"><LineChart values={series.map((item) => item.value)} label="График динамики заказов" /><div>{series.filter((_, index) => index % Math.max(1, Math.floor(series.length / 5)) === 0).map((item) => <span key={item.key}>{item.label}</span>)}</div></div>
          </article>
          <article className="admin-card-v2 admin-statuses-v2">
            <div className="admin-card-head-v2"><div><h2>Статусы заказов</h2><span>Распределение по текущим заказам</span></div></div>
            {statusRows.length ? <div className="admin-status-list-v2">{statusRows.map((row) => <div key={row.status}><span className={statusClass(row.status)} /><b>{row.status}</b><em>{row.value}</em><small>{Math.round((row.value / totalStatuses) * 100)}%</small></div>)}</div> : <Empty text="Заказов пока нет" />}
          </article>
        </section>
      </div>
    </section>

    {heroMessage && <p className="admin-dashboard-message-v2">{heroMessage}</p>}

    <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--work">
      <article className="admin-card-v2"><div className="admin-card-head-v2"><div><h2>Быстрые действия</h2><span>Рабочие разделы админки</span></div></div><div className="admin-quick-actions-v2">{quickActions.map((item) => { const Icon = item.icon; return <Link key={item.title} href={item.href}><Icon size={19} /><span>{item.title}</span><ArrowRight size={15} /></Link>; })}</div></article>
      <article className="admin-card-v2"><div className="admin-card-head-v2"><div><h2>Требует внимания</h2><span>Новые обращения и модерация</span></div></div><div className="admin-attention-list-v2"><Link href="/admin/orders"><ClipboardList size={17} /><span><b>Новые заказы</b><small>Проверьте и назначьте статус</small></span><em>{newOrders.length}</em></Link><Link href="/admin/requests"><Bell size={17} /><span><b>Новые заявки</b><small>Ответьте клиентам</small></span><em>{newRequests.length}</em></Link><Link href="/admin/reviews"><Pencil size={17} /><span><b>Отзывы на модерации</b><small>Опубликуйте или скройте</small></span><em>{pendingReviews.length}</em></Link></div></article>
    </section>

    <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--content">
      <article className="admin-card-v2"><div className="admin-card-head-v2"><div><h2>Последние заказы</h2><span>5 последних обращений из корзины</span></div><Link href="/admin/orders">Все заказы →</Link></div><div className="admin-orders-table-v2">{recentOrders.map((order) => <Link key={order.id} href="/admin/orders"><b>#{order.id.slice(0, 8)}</b><span>{formatDate(order.created_at)}</span><span>{order.customer?.name || order.customer?.phone || 'Клиент'}</span><em className={statusClass(order.status)}>{order.status || 'Новый'}</em><strong>{money(order.total)} BYN</strong></Link>)}{!recentOrders.length && <Empty text="Заказов пока нет" />}</div></article>
      <article className="admin-card-v2"><div className="admin-card-head-v2"><div><h2>Популярные товары</h2><span>Товары, отмеченные для витрины</span></div><Link href="/admin/products">Все товары →</Link></div><div className="admin-popular-products-v2">{(popular.length ? popular : products.slice(0, 5)).map((product) => <Link href={`/admin/products`} key={product.slug}><img src={product.image} alt="" /><b>{product.title}</b><span>{money(product.price)} BYN</span><Pencil size={15} /></Link>)}{!products.length && <Empty text="Добавьте товары в каталог" />}</div></article>
    </section>

    <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--sales">
      <article className="admin-card-v2">
        <div className="admin-card-head-v2"><div><h2>Статистика продаж</h2><span>Выручка по дням за последние 30 дней</span></div></div>
        <SalesBars values={monthSeries.map((item) => ({ label: item.label, value: item.revenue }))} />
      </article>
    </section>

    <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--activity">
      <article className="admin-card-v2"><div className="admin-card-head-v2"><div><h2>Активность на сайте</h2><span>Последние действия в панели</span></div><Link href="/admin/activity">Вся активность →</Link></div><div className="admin-activity-list-v2">{activity.slice(0, 5).map((item) => <div key={item.id}><span><Bell size={15} /></span><p><b>{actionLabel(item.action)}</b><small>{formatDate(item.created_at)}</small></p></div>)}{!activity.length && <Empty text="Новых событий пока нет" />}</div></article>
    </section>

    <section className="admin-dashboard-grid-v2 admin-dashboard-grid-v2--footer"><article className="admin-card-v2 admin-site-health-v2"><div><Boxes size={22} /><p><b>Состояние сайта</b><span>{newRequests.length} новых заявок · {pendingReviews.length} отзывов на модерации</span></p></div><div><Link href="/admin/requests">Заявки</Link><Link href="/admin/reviews">Отзывы</Link><Link href="/admin/settings">Настройки</Link></div></article></section>

    {editingHero && <div className="admin-hero-modal-v2" role="dialog" aria-modal="true" aria-label="Редактирование главного слайда"><button className="admin-hero-modal-backdrop-v2" aria-label="Закрыть" onClick={() => setEditingHero(false)} /><section><div className="admin-card-head-v2"><div><h2>Главный слайд</h2><span>Изменения будут опубликованы на главной сразу после сохранения.</span></div><button type="button" onClick={() => setEditingHero(false)}>×</button></div><div className="admin-hero-form-v2"><label>Метка<input value={homepage.hero.kicker} onChange={(event) => setHomepage((current) => ({ ...current, hero: { ...current.hero, kicker: event.target.value } }))} /></label><label>Заголовок<textarea rows={3} value={homepage.hero.title} onChange={(event) => setHomepage((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} /></label><label>Описание<textarea rows={4} value={homepage.hero.text} onChange={(event) => setHomepage((current) => ({ ...current, hero: { ...current.hero, text: event.target.value } }))} /></label><AdminImagePicker label="Изображение" value={homepage.hero.image} onChange={(value) => setHomepage((current) => ({ ...current, hero: { ...current.hero, image: value } }))} altValue={homepage.hero.imageAlt} onAltChange={(value) => setHomepage((current) => ({ ...current, hero: { ...current.hero, imageAlt: value } }))} /><label>Текст кнопки<input value={homepage.hero.primaryLabel} onChange={(event) => setHomepage((current) => ({ ...current, hero: { ...current.hero, primaryLabel: event.target.value } }))} /></label><label>Ссылка кнопки<input value={homepage.hero.primaryHref} onChange={(event) => setHomepage((current) => ({ ...current, hero: { ...current.hero, primaryHref: event.target.value } }))} /></label></div><div className="admin-hero-form-actions-v2"><button type="button" onClick={() => setEditingHero(false)}>Отмена</button><button type="button" onClick={saveHero} disabled={savingHero}>{savingHero ? 'Сохраняем…' : 'Сохранить'}</button></div></section></div>}
  </div>;
}

function Kpi({ title, value, hint, color, series, href }: { title: string; value: string; hint: string; color: string; series?: number[]; href: string }) {
  return <Link href={href} className="admin-kpi-card-v2"><p>{title}</p><b>{value}</b><small>{hint}</small>{series ? <Sparkline values={series} color={color} /> : <i className="admin-kpi-accent-v2" style={{ backgroundColor: color }} />}</Link>;
}

function SalesBars({ values }: { values: Array<{ label: string; value: number }> }) {
  const visible = values.slice(-14);
  const max = Math.max(...visible.map((item) => item.value), 1);
  if (!visible.some((item) => item.value)) return <Empty text="Продаж за выбранный период пока нет" />;

  return <div className="admin-sales-bars-v2" aria-label="Диаграмма выручки">
    {visible.map((item) => <div key={item.label} title={`${item.label}: ${money(item.value)} BYN`}><i style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }} /><span>{item.label}</span></div>)}
  </div>;
}

function Empty({ text }: { text: string }) { return <p className="admin-empty-v2">{text}</p>; }
