import Link from 'next/link';
import { getCatalogProducts } from '@/lib/products';
import { formatDate, getAdminOrders, getAdminRequests, money, statusClass } from '@/lib/adminCommerce';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Админка Bullmet' };

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function shortId(value: string) {
  return value?.startsWith('local-') ? value.slice(0, 12) : value?.slice(0, 8) || '—';
}

function chartValues(count: number) {
  return Array.from({ length: 18 }, (_, index) => {
    const base = 22 + ((index * 13) % 34);
    const boost = count ? Math.min(34, Math.round(count / 3)) : 0;
    return Math.min(84, base + boost + (index % 4 === 0 ? 12 : 0));
  });
}

export default async function AdminPage() {
  const [products, orders, requests] = await Promise.all([
    getCatalogProducts(),
    getAdminOrders(),
    getAdminRequests()
  ]);

  const activeProducts = products.filter((item) => item.status !== 'draft');
  const clockProducts = products.filter((item) => [item.title, item.slug, item.category, item.clockTheme].join(' ').toLowerCase().includes('час') || item.clockTheme);
  const popular = products.filter((item) => item.isPopular).slice(0, 5);
  const activeOrders = orders.filter((item) => item.status !== 'Выполнен' && item.status !== 'Отменён').length;
  const paidOrders = orders.filter((item) => String(item.status || '').toLowerCase().includes('оплачен') || String(item.status || '').toLowerCase().includes('выполн')).length;
  const cancelledOrders = orders.filter((item) => String(item.status || '').toLowerCase().includes('отмен')).length;
  const newRequests = requests.filter((item) => item.status === 'Новая').length;
  const revenue = orders.filter((item) => item.status !== 'Отменён').reduce((sum, item) => sum + Number(item.total || 0), 0);
  const buyers = new Set(orders.map((item) => item.customer?.email || item.customer?.phone || item.customer?.name).filter(Boolean)).size;
  const chart = chartValues(orders.length);
  const maxChart = Math.max(...chart, 1);
  const totalOrderStatus = Math.max(orders.length, 1);
  const newOrders = orders.filter((item) => item.status === 'Новый' || !item.status).length;
  const progressOrders = orders.filter((item) => String(item.status || '').toLowerCase().includes('работ') || String(item.status || '').toLowerCase().includes('ожида')).length;

  const recentActivity = [
    orders[0] && { type: 'cart', title: `Новый заказ #${shortId(orders[0].id)}`, time: formatDate(orders[0].created_at) },
    requests[0] && { type: 'star', title: 'Новая заявка с сайта', time: formatDate(requests[0].created_at) },
    products[0] && { type: 'doc', title: `Товар в каталоге: ${products[0].title}`, time: 'сейчас' },
    { type: 'user', title: 'Панель управления готова к работе', time: 'сегодня' },
    paidOrders > 0 && { type: 'check', title: `${paidOrders} заказ(ов) оплачено/закрыто`, time: 'за период' }
  ].filter(Boolean) as { type: string; title: string; time: string }[];

  return (
    <div className="admin-dashboard-redesign">
      <section className="admin-hero-grid-redesign">
        <div className="admin-hero-card-redesign">
          <div className="admin-hero-card-head">
            <div>
              <p>Главный слайд / главная страница</p>
              <h1>Bullmet — производство изделий из металла с элементами дерева</h1>
              <span>Контролируйте витрину, товары, заказы и готовность сайта к продажам.</span>
            </div>
            <Link href="/admin/homepage">Редактировать</Link>
          </div>
          <div className="admin-hero-preview-redesign">
            <img src="/assets/hero-machine.jpg" alt="Главный слайд Bullmet" />
            <div>
              <h2>Bullmet — собственное производство</h2>
              <p>Часы, изделия из металла и направления, которые можно включать по мере готовности.</p>
              <span>Перейти в каталог</span>
            </div>
          </div>
        </div>

        <div className="admin-metric-grid-redesign">
          <Metric title="Заказы" value={String(orders.length)} hint={`+${activeOrders} активных`} tone="orange" />
          <Metric title="Выручка" value={`${money(revenue)} BYN`} hint="без отменённых" tone="green" />
          <Metric title="Покупатели" value={String(buyers)} hint={`${orders.length} заказ(ов)`} tone="blue" />
          <Metric title="Товары" value={String(products.length)} hint={`${activeProducts.length} активных`} tone="violet" />
        </div>
      </section>

      <section className="admin-main-grid-redesign">
        <article className="admin-panel-redesign admin-chart-card-redesign">
          <div className="admin-card-head-redesign">
            <div><h2>Динамика заказов</h2><span>Визуальный обзор активности</span></div>
            <select defaultValue="30"><option value="30">За последние 30 дней</option><option value="7">7 дней</option></select>
          </div>
          <div className="admin-line-chart-redesign">
            <svg viewBox="0 0 760 230" role="img" aria-label="Динамика заказов">
              <defs>
                <linearGradient id="adminLineFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e85b1c" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#e85b1c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2="760" y1={40 + line * 46} y2={40 + line * 46} />)}
              <polyline
                points={chart.map((value, index) => `${index * (760 / (chart.length - 1))},${210 - (value / maxChart) * 170}`).join(' ')}
              />
              {chart.map((value, index) => <circle key={index} cx={index * (760 / (chart.length - 1))} cy={210 - (value / maxChart) * 170} r="4" />)}
            </svg>
          </div>
        </article>

        <article className="admin-panel-redesign admin-traffic-card-redesign">
          <div className="admin-card-head-redesign"><div><h2>Источники трафика</h2><span>Демо-структура посещений</span></div></div>
          <div className="admin-donut-redesign">
            <div className="admin-donut-circle" />
            <div className="admin-donut-list">
              <p><i className="is-orange" />Прямые заходы <b>47%</b></p>
              <p><i className="is-blue" />Поисковые системы <b>32%</b></p>
              <p><i className="is-green" />Социальные сети <b>12%</b></p>
              <p><i className="is-violet" />Реферальные сайты <b>9%</b></p>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-content-grid-redesign">
        <article className="admin-panel-redesign">
          <div className="admin-card-head-redesign">
            <div><h2>Быстрые действия</h2><span>Основные задачи администратора</span></div>
          </div>
          <div className="admin-actions-redesign">
            <Link href="/admin/products"><span>＋</span><b>Добавить товар</b></Link>
            <Link href="/admin/homepage"><span>▣</span><b>Редактировать главную</b></Link>
            <Link href="/admin/media"><span>▧</span><b>Добавить баннер</b></Link>
            <Link href="/admin/requests"><span>✦</span><b>Обработать заявку</b></Link>
          </div>

          <div className="admin-card-head-redesign admin-section-spacer">
            <div><h2>Популярные товары</h2><span>Товары, которые можно выводить на главной</span></div>
            <Link href="/admin/products">Все товары</Link>
          </div>
          <div className="admin-products-list-redesign">
            {(popular.length ? popular : products.slice(0, 5)).map((product) => (
              <Link href={`/product/${product.slug}`} target="_blank" key={product.slug}>
                <img src={product.image} alt="" />
                <div><b>{product.title}</b><span>{product.category || 'Каталог'}</span></div>
                <strong>{money(product.price)} BYN</strong>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-panel-redesign">
          <div className="admin-card-head-redesign">
            <div><h2>Последние заказы</h2><span>Новые покупки и заявки на обработку</span></div>
            <Link href="/admin/orders">Все заказы</Link>
          </div>
          <div className="admin-orders-list-redesign">
            {orders.slice(0, 5).map((order) => (
              <Link href="/admin/orders" key={order.id}>
                <b>#{shortId(order.id)}</b>
                <span>{formatDate(order.created_at)}</span>
                <em>{order.customer?.name || order.customer?.phone || 'Клиент'}</em>
                <i className={statusClass(order.status)}>{order.status || 'Новый'}</i>
                <strong>{money(order.total)} BYN</strong>
              </Link>
            ))}
            {!orders.length && <p className="admin-empty-redesign">Заказов пока нет.</p>}
          </div>
        </article>

        <article className="admin-panel-redesign">
          <div className="admin-card-head-redesign">
            <div><h2>Активность на сайте</h2><span>Последние события</span></div>
          </div>
          <div className="admin-activity-redesign">
            {recentActivity.map((item, index) => (
              <div key={`${item.title}-${index}`}>
                <span className={`admin-activity-icon is-${item.type}`} />
                <div><b>{item.title}</b><small>{item.time}</small></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-bottom-grid-redesign">
        <article className="admin-panel-redesign admin-bars-card-redesign">
          <div className="admin-card-head-redesign">
            <div><h2>Статистика продаж</h2><span>Условная диаграмма для визуального контроля</span></div>
            <select defaultValue="30"><option>За последние 30 дней</option></select>
          </div>
          <div className="admin-bars-chart-redesign">
            {chart.slice(0, 14).map((value, index) => <i key={index} style={{ height: `${38 + value}%` }} />)}
          </div>
        </article>

        <article className="admin-panel-redesign admin-status-card-redesign">
          <div className="admin-card-head-redesign"><div><h2>Статусы заказов</h2><span>Распределение по текущим статусам</span></div></div>
          <div className="admin-status-content-redesign">
            <div className="admin-status-donut-redesign" />
            <div className="admin-status-list-redesign">
              <p><i className="is-blue" />Новые <b>{newOrders}</b><span>{percent(newOrders, totalOrderStatus)}%</span></p>
              <p><i className="is-orange" />В обработке <b>{progressOrders}</b><span>{percent(progressOrders, totalOrderStatus)}%</span></p>
              <p><i className="is-green" />Оплачены/закрыты <b>{paidOrders}</b><span>{percent(paidOrders, totalOrderStatus)}%</span></p>
              <p><i className="is-red" />Отменены <b>{cancelledOrders}</b><span>{percent(cancelledOrders, totalOrderStatus)}%</span></p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({ title, value, hint, tone }: { title: string; value: string; hint: string; tone: 'orange' | 'green' | 'blue' | 'violet' }) {
  return (
    <article className={`admin-metric-card-redesign is-${tone}`}>
      <span>{title}</span>
      <b>{value}</b>
      <small>{hint}</small>
      <i />
    </article>
  );
}
