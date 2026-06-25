import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Package, Rocket, ShoppingBag, Star, Users } from 'lucide-react';
import { getAuditReport, getBackupOverview } from '@/lib/adminBackup';
import { formatDate, getAdminOrders, getAdminRequests, money, statusClass } from '@/lib/adminCommerce';
import { getAdminCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Админка Bullmet' };

function shortId(value?: string) {
  return value?.startsWith('local-') ? value.slice(0, 12) : value?.slice(0, 8) || '—';
}

function readinessLabel(score: number) {
  if (score >= 85) return 'Сайт почти готов к запуску';
  if (score >= 60) return 'Есть пункты для проверки';
  return 'Нужна техническая проверка';
}

function auditTone(score: number) {
  if (score >= 85) return 'is-good';
  if (score >= 60) return 'is-warn';
  return 'is-bad';
}

export default async function AdminPage() {
  const [products, orders, requests, overview, audit] = await Promise.all([
    getAdminCatalogProducts(),
    getAdminOrders(),
    getAdminRequests(),
    getBackupOverview(),
    getAuditReport()
  ]);

  const activeOrders = orders.filter((item) => !['Выполнен', 'Отменён'].includes(String(item.status || '')));
  const newOrders = orders.filter((item) => item.status === 'Новый' || !item.status);
  const newRequests = requests.filter((item) => item.status === 'Новая' || !item.status);
  const revenue = orders.filter((item) => item.status !== 'Отменён').reduce((sum, item) => sum + Number(item.total || 0), 0);
  const buyers = new Set(orders.map((item) => item.customer?.email || item.customer?.phone || item.customer?.name).filter(Boolean)).size;
  const popular = products.filter((item) => item.isPopular).slice(0, 4);
  const criticalAudit = audit.items.filter((item) => item.status === 'bad');
  const warnAudit = audit.items.filter((item) => item.status === 'warn');
  const latestOrders = orders.slice(0, 5);
  const latestRequests = requests.slice(0, 5);

  const launchSteps = [
    { title: 'Боевой тест', text: 'Пройти путь клиента и чек-лист запуска', href: '/admin/launch-test', icon: Rocket, tone: 'orange' },
    { title: 'Товары', text: 'Проверить цены, фото, статусы и категории', href: '/admin/products', icon: Package, tone: 'blue' },
    { title: 'Заказы', text: `${newOrders.length} новых, ${activeOrders.length} активных`, href: '/admin/orders', icon: ShoppingBag, tone: 'green' },
    { title: 'Резервная копия', text: 'Скачать JSON перед изменениями', href: '/admin/backup', icon: ClipboardCheck, tone: 'violet' }
  ] as const;

  return (
    <div className="admin-dashboard-clean">
      <section className="admin-clean-hero">
        <div className="admin-clean-hero-copy">
          <p>Центр управления Bullmet</p>
          <h1>{readinessLabel(audit.score)}</h1>
          <span>Сначала проверь запуск, затем обрабатывай заказы, товары, заявки и контент. Всё важное собрано на одном экране.</span>
          <div className="admin-clean-hero-actions">
            <Link href="/admin/launch-test">Открыть боевой тест <ArrowRight size={16} /></Link>
            <Link href="/" target="_blank">Перейти на сайт</Link>
          </div>
        </div>

        <div className={`admin-clean-readiness ${auditTone(audit.score)}`}>
          <div><b>{audit.score}</b><span>/100</span></div>
          <p>Оценка готовности</p>
          <small>{criticalAudit.length} критично · {warnAudit.length} проверить</small>
        </div>
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
            <Link href="/admin/launch-test">Весь чек-лист</Link>
          </div>
          <div className="admin-clean-actions-grid">
            {launchSteps.map((item) => {
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
            <div><p>Аудит</p><h2>Проблемы</h2></div>
            <Link href="/admin/backup">Аудит</Link>
          </div>
          <div className="admin-clean-audit-list">
            {(criticalAudit.length ? criticalAudit : warnAudit).slice(0, 5).map((item) => (
              <Link href={item.href || '/admin/backup'} key={item.id} className={`is-${item.status}`}>
                <AlertTriangle size={17} />
                <div><b>{item.title}</b><span>{item.message}</span></div>
              </Link>
            ))}
            {!criticalAudit.length && !warnAudit.length && <p className="admin-clean-empty">Критичных проблем не найдено.</p>}
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
            <div><p>Запуск</p><h2>Финальный порядок</h2></div>
          </div>
          <ol className="admin-clean-checklist">
            <li>Скачать резервную копию в JSON.</li>
            <li>Пройти боевой тест запуска.</li>
            <li>Проверить sitemap.xml и robots.txt.</li>
            <li>Сделать тестовый заказ и заявку.</li>
            <li>Задеплоить и повторить проверку на Vercel.</li>
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
