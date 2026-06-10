import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AdminStats() {
  const products = await getCatalogProducts();
  const active = products.filter((item) => item.status !== 'draft').length;
  const draft = products.length - active;
  const withPhotos = products.filter((item) => item.images.length > 1).length;
  const groups = new Set(products.map((item) => item.colorGroupId).filter(Boolean)).size;
  const byCategory = products.reduce<Record<string, number>>((acc, item) => {
    const key = item.category || 'Без категории';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const max = Math.max(1, ...Object.values(byCategory));

  return (
    <div className="admin-dashboard-pro">
      <div className="admin-page-head"><div><p>Аналитика</p><h1>Статистика</h1><span>Пока нет полноценной сквозной аналитики, показываем состояние каталога и готовность данных.</span></div></div>
      <section className="admin-stat-grid">
        <article><span>Всего товаров</span><b>{products.length}</b><em>{active} активных / {draft} черновиков</em></article>
        <article><span>С галереями</span><b>{withPhotos}</b><em>товары с несколькими фото</em></article>
        <article><span>Группы цвета</span><b>{groups}</b><em>варианты одной модели</em></article>
        <article><span>Средняя цена</span><b>{Math.round(products.reduce((s,p)=>s+p.price,0)/Math.max(1,products.length))} BYN</b><em>по каталогу</em></article>
      </section>
      <section className="admin-dashboard-grid two">
        <div className="admin-panel-card big"><div className="admin-card-title"><h2>Товары по категориям</h2><span>Распределение каталога</span></div><div className="admin-bars">{Object.entries(byCategory).map(([name,count])=><div key={name}><span>{name}</span><b>{count}</b><i style={{width:`${Math.max(8,(count/max)*100)}%`}} /></div>)}</div></div>
        <div className="admin-panel-card"><div className="admin-card-title"><h2>Что считать дальше</h2><span>Потенциальные метрики</span></div><div className="admin-warning-list"><p>Заказы: новые / в обработке / выполнены / отменены.</p><p>Выручка: считать только выполненные заказы.</p><p>Популярность: просмотры карточек, добавления в корзину, быстрые заявки.</p><p>Источники: utm_source/utm_medium и page_views.</p></div></div>
      </section>
    </div>
  );
}
