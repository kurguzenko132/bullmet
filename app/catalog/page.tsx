import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { clockCatalogCategories, getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Каталог товаров Bullmet',
  description: 'Каталог Bullmet: настенные часы, садовая мебель, мебель для дома в стиле лофт, лазерная резка, гибка металла и мелкий опт металлопроката.'
};

export default async function CatalogPage() {
  const products = await getCatalogProducts();
  const shownCount = products.length;

  return (
    <>
      <Header />
      <main className="catalog-page">
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

              <div className="catalog-products-grid">
                {products.map((product) => (
                  <article className="catalog-product-card" key={product.slug}>
                    <Link href={`/product/${product.slug}`} className="catalog-product-image">
                      <img src={product.image} alt={product.title} />
                    </Link>
                    <div className="catalog-product-body">
                      <Link href={`/product/${product.slug}`} className="catalog-product-title">{product.title}</Link>
                      <p>{product.material}</p>
                      <div className="catalog-product-bottom">
                        <b>от {product.price} BYN</b>
                        <button aria-label={`Добавить в корзину: ${product.title}`}><Icon name="cart" /></button>
                      </div>
                    </div>
                  </article>
                ))}
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
