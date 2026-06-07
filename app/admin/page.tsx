import Link from 'next/link';
import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Админка Bullmet' };

export default async function AdminPage() {
  const products = await getCatalogProducts();
  const active = products.filter((item) => item.status !== 'draft').length;
  const groups = new Set(products.map((item) => item.colorGroupId).filter(Boolean)).size;
  const withManyPhotos = products.filter((item) => item.images.length > 1).length;
  const popular = products.filter((item) => item.isPopular).slice(0, 6);

  return (
    <div className="admin-dashboard-pro">
      <div className="admin-page-head">
        <div><p>Панель управления</p><h1>Главная админки</h1><span>Контроль товаров, фото-групп, заявок и готовности сайта к продажам.</span></div>
        <div className="admin-head-actions"><Link href="/" target="_blank">Перейти на сайт ↗</Link><Link href="/admin/products">Добавить товар</Link></div>
      </div>

      <section className="admin-stat-grid">
        <article><span>Товары</span><b>{products.length}</b><em>{active} активных</em></article>
        <article><span>Фото-галереи</span><b>{withManyPhotos}</b><em>с несколькими фото</em></article>
        <article><span>Группы цвета</span><b>{groups}</b><em>переключатели вариантов</em></article>
        <article><span>Популярные</span><b>{products.filter((p) => p.isPopular).length}</b><em>на главной/в каталоге</em></article>
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-panel-card big">
          <div className="admin-card-title"><h2>Готовность production</h2><span>Что сейчас важно проверить перед деплоем</span></div>
          <div className="admin-checklist">
            <p><b>✓</b> Supabase подключен через env на Vercel</p>
            <p><b>✓</b> Товары загружаются из таблицы products</p>
            <p><b>✓</b> Фото товаров лежат в Storage bucket product-images</p>
            <p><b>✓</b> Цветовые варианты объединяются через color_group_id</p>
            <p><b>✓</b> Карточка товара показывает галерею, характеристики, отзывы и похожие товары</p>
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-card-title"><h2>Быстрые действия</h2><span>Основные разделы</span></div>
          <div className="admin-quick-grid">
            <Link href="/admin/products">Товары и фото</Link>
            <Link href="/admin/homepage">Главная страница</Link>
            <Link href="/admin/orders">Заказы</Link>
            <Link href="/admin/stats">Статистика</Link>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-grid two">
        <div className="admin-panel-card">
          <div className="admin-card-title"><h2>Популярные товары</h2><span>То, что можно выводить на главной</span></div>
          <div className="admin-mini-products">
            {(popular.length ? popular : products.slice(0, 6)).map((product) => (
              <Link href={`/product/${product.slug}`} target="_blank" key={product.slug}>
                <img src={product.image} alt="" />
                <div><b>{product.title}</b><span>{product.category} · {product.price} BYN</span></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="admin-panel-card">
          <div className="admin-card-title"><h2>Диагностика данных</h2><span>На что обратить внимание</span></div>
          <div className="admin-warning-list">
            {products.filter((item) => !item.images.length).length > 0 && <p>Есть товары без изображений.</p>}
            {products.filter((item) => !item.description).length > 0 && <p>Есть товары без описания.</p>}
            {products.filter((item) => item.colorGroupId && !item.colorName).length > 0 && <p>Есть цветовые группы без названия цвета.</p>}
            <p>Для проверки Supabase откройте <code>/api/debug/supabase</code>, если этот endpoint есть в проекте.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
