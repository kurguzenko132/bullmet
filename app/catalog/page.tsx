import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { clockCatalogCategories, getCatalogProducts, getProductReviewStats } from '@/lib/products';
import { getImageSettings } from '@/lib/imageDisplay';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Каталог товаров Bullmet',
  description: 'Каталог Bullmet: настенные часы, садовая мебель, мебель для дома в стиле лофт, лазерная резка, гибка металла и мелкий опт металлопроката.'
};

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function reviewWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'отзыва';
  return 'отзывов';
}

export default async function CatalogPage() {
  const products = await getCatalogProducts();
  const reviewStats = await getProductReviewStats(products.map((product) => product.slug));
  const shownCount = products.length;

  return (
    <>
      <Header />
      <main className="catalog-page catalog-page--improved">
        <div className="catalog-container">
          <nav className="catalog-breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/">Главная</Link>
            <span>›</span>
            <span>Каталог</span>
          </nav>

          <h1 className="catalog-title">Каталог товаров</h1>

          <div className="catalog-layout">
            <aside className="catalog-sidebar" aria-label="Фильтры каталога">
              <section className="catalog-filter-card catalog-category-card">
                <h2>Каталог часов</h2>
                <ul>
                  {clockCatalogCategories.map((category) => (
                    <li key={category}>
                      <Link href="/catalog">{category}</Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="catalog-filter-card">
                <h2>Фильтр</h2>

                <div className="filter-group">
                  <label>Цена, BYN</label>
                  <div className="range-line" aria-hidden="true"><span /></div>
                  <div className="price-inputs">
                    <input type="text" defaultValue="0" aria-label="Цена от" />
                    <span>до</span>
                    <input type="text" defaultValue="2000" aria-label="Цена до" />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Материал</label>
                  <label className="check-row"><input type="checkbox" /> <span>Металл</span></label>
                  <label className="check-row"><input type="checkbox" /> <span>Дерево</span></label>
                  <label className="check-row"><input type="checkbox" /> <span>Металл с элементами дерева</span></label>
                </div>

                <button className="apply-filter">Применить</button>
                <button className="reset-filter">Сбросить</button>
              </section>
            </aside>

            <section className="catalog-content" aria-label="Список товаров">
              <div className="catalog-toolbar">
                <select aria-label="Сортировка">
                  <option>По популярности</option>
                  <option>Сначала дешевле</option>
                  <option>Сначала дороже</option>
                  <option>Новинки</option>
                </select>
                <p>Показано 1–{shownCount} из {shownCount}</p>
                <div className="view-switcher" aria-label="Вид каталога">
                  <button aria-label="Плитка" className="is-active"><span className="grid-icon" /></button>
                  <button aria-label="Список"><span className="list-icon" /></button>
                </div>
              </div>

              <div className="catalog-products-grid catalog-products-grid--premium">
                {products.map((product) => {
                  const imageSettings = getImageSettings(product, product.image);
                  const discount = discountPercent(product.price, product.oldPrice);
                  const stats = reviewStats[product.slug] || { average: 0, count: 0 };
                  const ratingLabel = stats.count ? stats.average.toFixed(1) : '5.0';
                  const reviewsLabel = stats.count ? `${stats.count} ${reviewWord(stats.count)}` : 'нет отзывов';

                  return (
                    <article className="catalog-product-card catalog-product-card--premium" key={product.slug}>
                      <Link href={`/product/${product.slug}`} className="catalog-product-image catalog-product-image--premium">
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            objectFit: imageSettings.catalogFit,
                            objectPosition: imageSettings.catalogPosition,
                            transform: `scale(${imageSettings.catalogZoom || 1})`
                          }}
                        />
                        <span className="catalog-card-badges">
                          {discount && <b className="badge-sale">-{discount}%</b>}
                          {product.isNew && <b className="badge-new">Новинка</b>}
                          {product.isPopular && <b className="badge-hit">Хит</b>}
                        </span>
                      </Link>
                      <div className="catalog-product-body catalog-product-body--premium">
                        <div className="catalog-rating-row">
                          <span>★ {ratingLabel}</span>
                          <small>{reviewsLabel}</small>
                        </div>
                        <Link href={`/product/${product.slug}`} className="catalog-product-title">{product.title}</Link>
                        <p>{product.short || product.material}</p>
                        <div className="catalog-product-meta">
                          <span>{product.category || 'Каталог'}</span>
                          <span>{product.inStock ? 'В наличии / под заказ' : 'Под заказ'}</span>
                        </div>
                        <div className="catalog-product-bottom catalog-product-bottom--premium">
                          <div className="catalog-price-box">
                            <b>от {money(product.price)} BYN</b>
                            {product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)} BYN</del>}
                          </div>
                          <div className="catalog-card-actions">
                            <Link href={`/product/${product.slug}`}>Подробнее</Link>
                            <button aria-label={`Добавить в корзину: ${product.title}`}><Icon name="cart" /></button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="catalog-pagination" aria-label="Пагинация">
                <Link className="active" href="/catalog">1</Link>
                <Link href="/catalog">2</Link>
                <Link href="/catalog">3</Link>
                <Link href="/catalog">4</Link>
                <Link className="next" href="/catalog">→</Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
