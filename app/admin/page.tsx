import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, ClipboardCheck, FileText, Image, MessageSquare, Package, Settings, ShoppingBag, Star, Tags, Users } from 'lucide-react';
import { getBackupOverview } from '@/lib/adminBackup';
import { formatDate, getAdminOrders, getAdminRequests, money, statusClass } from '@/lib/adminCommerce';
import { getAdminCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Админка Bullmet' };

function shortId(value?: string) {
  return value?.startsWith('local-') ? value.slice(0, 12) : value?.slice(0, 8) || '—';
}

export default async function AdminPage() {
  const [products, orders, requests, overview] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getBackupOverview()
  ]);

  const activeOrders = orders.filter((item) => !['Выполнен', 'Отменён'].includes(String(item.status || '')));
  const newOrders = orders.filter((item) => item.status === 'Новый' || !item.status);
  const newRequests = requests.filter((item) => item.status === 'Новая' || !item.status);
  const revenue = orders.filter((item) => item.status !== 'Отменён').reduce((sum, item) => sum + Number(item.total || 0), 0);
  const buyers = new Set(orders.map((item) => item.customer?.email || item.customer?.phone || item.customer?.name).filter(Boolean)).size;
  const popular = products.filter((item) => item.isPopular).slice(0, 4);
  const latestOrders = orders.slice(0, 5);
  const latestRequests = requests.slice(0, 5);
  const withoutPhoto = products.filter((item) => !item.image && !item.images?.length).length;
  const withoutPrice = products.filter((item) => !Number(item.price)).length;
  const visibleProducts = products.filter((item) => item.status !== 'hidden' && item.status !== 'draft').length;

  const managementSteps = [
    { title: 'Товары', text: 'Проверить цены, фото, статусы и категории', href: '/admin/products', icon: Package, tone: 'blue' },
    { title: 'Страницы', text: 'Создавать и редактировать CMS-страницы', href: '/admin/pages', icon: FileText, tone: 'orange' },
    { title: 'Заказы', text: `${newOrders.length} новых, ${activeOrders.length} активных`, href: '/admin/orders', icon: ShoppingBag, tone: 'green' },
    { title: 'Экспорт данных', text: 'Скачать JSON или CSV перед изменениями', href: '/admin/backup', icon: ClipboardCheck, tone: 'violet' }
  ] as const;

  const fastModules = [
    { title: 'Категории', text: `${overview.visibleCategories} видно клиенту`, href: '/admin/categories', icon: Tags },
    { title: 'Отзывы', text: 'Скрыть, вернуть, проверить фото', href: '/admin/reviews', icon: Star },
    { title: 'Баннеры', text: 'Акции и промо на главной', href: '/admin/banners', icon: Image },
    { title: 'Заявки', text: `${newRequests.length} новых обращений`, href: '/admin/requests', icon: MessageSquare },
    { title: 'Настройки', text: 'SEO, контакты, видимость', href: '/admin/settings', icon: Settings },
    { title: 'Отчёты', text: 'Статистика и итоги', href: '/admin/reports', icon: Activity }
  ] as const;

  const todayFocus = [
    { label: 'Активные заказы', value: activeOrders.length, href: '/admin/orders' },
    { label: 'Новые заявки', value: newRequests.length, href: '/admin/requests' },
    { label: 'Товары без фото', value: withoutPhoto, href: '/admin/products' },
    { label: 'Товары на витрине', value: visibleProducts, href: '/admin/products' }
  ];

  const storefrontNeeds = [
    { label: 'Без фото', value: withoutPhoto, text: 'добавьте изображения в карточки товаров', href: '/admin/products' },
    { label: 'Без цены', value: withoutPrice, text: 'заполните цену или оставьте понятный статус под заказ', href: '/admin/products' },
    { label: 'CMS-страницы', value: overview.pages, text: 'страницы можно создавать и менять без кода', href: '/admin/pages' },
    { label: 'Категории', value: overview.visibleCategories, text: 'видимые категории управляются из админки', href: '/admin/categories' }
  ];

  return (
    <div className="admin-dashboard-clean">
      <section className="admin-clean-hero">
        <div className="admin-clean-hero-copy">
          <p>Центр управления Bullmet</p>
          <h1>Управление сайтом без кода</h1>
          <span>Редактируйте товары, страницы, категории, заявки, заказы, отзывы, баннеры и настройки из одной панели.</span>
          <div className="admin-clean-hero-actions">
            <Link href="/admin/products">Управлять каталогом <ArrowRight size={16} /></Link>
            <Link href="/" target="_blank">Перейти на сайт</Link>
          </div>
        </div>

        <div className="admin-clean-readiness is-good">
          <div><b>{visibleProducts}</b><span>тов.</span></div>
          <p>На витрине</p>
          <small>{overview.pages} CMS-страниц · {overview.visibleCategories} категорий</small>
        </div>
      </section>

      <section className="admin-clean-workbench">
        <article className="admin-clean-workbench-card admin-clean-workbench-card--today">
          <div className="admin-clean-panel-head">
            <div><p>Оперативно</p><h2>Сегодня в работе</h2></div>
            <Link href="/admin/orders">Заказы</Link>
          </div>
          <div className="admin-clean-today-list">
            {todayFocus.map((item) => (
              <Link href={item.href} key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-clean-workbench-card">
          <div className="admin-clean-panel-head">
            <div><p>Витрина</p><h2>Контент и товары</h2></div>
            <Link href="/admin/products">Исправить</Link>
          </div>
          <div className="admin-clean-health-grid">
            <div><b>{products.length}</b><span>товаров всего</span></div>
            <div><b>{withoutPhoto}</b><span>без фото</span></div>
            <div><b>{withoutPrice}</b><span>без цены</span></div>
            <div><b>{overview.visibleCategories}</b><span>категорий</span></div>
          </div>
        </article>

        <article className="admin-clean-workbench-card">
          <div className="admin-clean-panel-head">
            <div><p>Быстрые разделы</p><h2>Управление</h2></div>
          </div>
          <div className="admin-clean-mini-links">
            {fastModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title}>
                  <Icon size={17} />
                  <div><b>{item.title}</b><span>{item.text}</span></div>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="admin-clean-metrics">
        <Metric title="Заказы" value={String(orders.length)} hint={`${activeOrders.length} активных`} icon={<ShoppingBag size={19} />} />
        <Metric title="Выручка" value={`${money(revenue)} BYN`} hint="без отменённых" icon={<CheckCircle2 size={19} />} />
        <Metric title="Покупатели" value={String(buyers)} hint="уникальные контакты" icon={<Users size={19} />} />
        <Metric title="Товары" value={String(products.length)} hint={`${overview.visibleCategories} категорий`} icon={<Package size={19} />} />
      </section>

      <section className="admin-clean-grid">
        <article className="admin-clean-panel admin-clean-panel--wide">
          <div className="admin-clean-panel-head">
            <div><p>Следующие действия</p><h2>Что проверить сейчас</h2></div>
            <Link href="/admin/products">Каталог</Link>
          </div>
          <div className="admin-clean-actions-grid">
            {managementSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className={`is-${item.tone}`}>
                  <span><Icon size={20} /></span>
                  <div><b>{item.title}</b><small>{item.text}</small></div>
                  <ArrowRight size={16} />
                </Link>
              );
            })}
          </div>
        </article>

        <article className="admin-clean-panel">
          <div className="admin-clean-panel-head">
            <div><p>Витрина</p><h2>Контроль данных</h2></div>
            <Link href="/admin/products">Товары</Link>
          </div>
          <div className="admin-clean-control-list">
            {storefrontNeeds.map((item) => (
              <Link href={item.href} key={item.label} className={item.value ? 'is-warn' : 'is-ok'}>
                <CheckCircle2 size={17} />
                <div><b>{item.label}: {item.value}</b><span>{item.text}</span></div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-clean-grid admin-clean-grid--three">
        <article className="admin-clean-panel">
          <div className="admin-clean-panel-head">
            <div><p>CRM</p><h2>Последние заказы</h2></div>
            <Link href="/admin/orders">Все</Link>
          </div>
          <div className="admin-clean-orders">
            {latestOrders.map((order) => (
              <Link href="/admin/orders" key={order.id}>
                <div><b>#{shortId(order.id)}</b><span>{order.customer?.name || order.customer?.phone || 'Клиент'}</span></div>
                <em className={statusClass(order.status)}>{order.status || 'Новый'}</em>
                <strong>{money(order.total)} BYN</strong>
              </Link>
            ))}
            {!latestOrders.length && <p className="admin-clean-empty">Заказов пока нет. Сделайте тестовый заказ через корзину.</p>}
          </div>
        </article>

        <article className="admin-clean-panel">
          <div className="admin-clean-panel-head">
            <div><p>Обращения</p><h2>Новые заявки</h2></div>
            <Link href="/admin/requests">Все</Link>
          </div>
          <div className="admin-clean-requests">
            {latestRequests.map((request) => (
              <Link href="/admin/requests" key={request.id}>
                <div><b>{request.type || request.kind || 'Заявка'}</b><span>{request.customer?.name || request.customer?.phone || 'Клиент'} · {formatDate(request.created_at)}</span></div>
                <em className={statusClass(request.status)}>{request.status || 'Новая'}</em>
              </Link>
            ))}
            {!latestRequests.length && <p className="admin-clean-empty">Заявок пока нет. Проверьте форму заявки перед запуском.</p>}
          </div>
        </article>

        <article className="admin-clean-panel">
          <div className="admin-clean-panel-head">
            <div><p>Витрина</p><h2>Популярные товары</h2></div>
            <Link href="/admin/products">Все</Link>
          </div>
          <div className="admin-clean-products">
            {(popular.length ? popular : products.slice(0, 4)).map((product) => (
              <Link href={`/product/${product.slug}`} target="_blank" key={product.slug}>
                <img src={product.image} alt="" />
                <div><b>{product.title}</b><span>{product.category || 'Каталог'}</span></div>
                <strong>{money(product.price)} BYN</strong>
              </Link>
            ))}
            {!products.length && <p className="admin-clean-empty">Добавьте товары перед запуском.</p>}
          </div>
        </article>
      </section>

      <section className="admin-clean-bottom">
        <article className="admin-clean-panel">
          <div className="admin-clean-panel-head">
            <div><p>Рабочий порядок</p><h2>Перед крупными изменениями</h2></div>
          </div>
          <ol className="admin-clean-checklist">
            <li>Скачать полный JSON в разделе экспорта данных.</li>
            <li>Обновить товары, категории, страницы и баннеры через админку.</li>
            <li>Проверить заказы и заявки перед передачей менеджеру.</li>
            <li>Открыть публичный сайт и убедиться, что нужные разделы видны клиенту.</li>
          </ol>
        </article>
      </section>
    </div>
  );
}

function Metric({ title, value, hint, icon }: { title: string; value: string; hint: string; icon: React.ReactNode }) {
  return (
    <article className="admin-clean-metric">
      <span>{icon}</span>
      <div><p>{title}</p><b>{value}</b><small>{hint}</small></div>
    </article>
  );
}
