'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import type { CatalogProduct, ProductReviewStats } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';

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

function addToCart(product: CatalogProduct) {
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(cart) ? cart : [];
    const index = list.findIndex((item) => item.slug === product.slug && item.size === product.sizes?.[0]);
    const item = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      material: product.material,
      size: product.sizes?.[0] || 'Под заказ',
      quantity: 1
    };
    const next = index >= 0
      ? list.map((cartItem, i) => i === index ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem)
      : [...list, item];
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  } catch {}
}

export function CatalogClient({ products, reviewStats, categories, initialQuery = '' }: { products: CatalogProduct[]; reviewStats: ProductReviewStats; categories: string[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [notice, setNotice] = useState('');

  const materials = useMemo(() => Array.from(new Set(products.map((product) => product.material).filter(Boolean))), [products]);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Infinity);

    return products
      .filter((product) => {
        const text = [product.title, product.slug, product.category, product.clockTheme, product.short, product.material].join(' ').toLowerCase();
        const matchesQuery = !q || text.includes(q);
        const matchesCategory = !category || product.category === category || product.clockTheme === category || text.includes(category.toLowerCase());
        const matchesMaterial = !material || product.material === material;
        const matchesPrice = product.price >= min && product.price <= max;
        return matchesQuery && matchesCategory && matchesMaterial && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'new') return Number(b.isNew) - Number(a.isNew);
        return Number(b.isPopular) - Number(a.isPopular) || a.title.localeCompare(b.title, 'ru');
      });
  }, [products, query, category, material, minPrice, maxPrice, sort]);

  function reset() {
    setQuery('');
    setCategory('');
    setMaterial('');
    setMinPrice('');
    setMaxPrice('');
    setSort('popular');
  }

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar" aria-label="Фильтры каталога">
        <section className="catalog-filter-card catalog-category-card">
          <h2>Каталог</h2>
          <ul>
            <li><button className={!category ? 'active' : ''} type="button" onClick={() => setCategory('')}>Все товары</button></li>
            {categories.map((item) => (
              <li key={item}><button className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button></li>
            ))}
          </ul>
        </section>

        <section className="catalog-filter-card">
          <h2>Фильтр</h2>
          <div className="filter-group">
            <label>Поиск</label>
            <input className="filter-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или категория" />
          </div>

          <div className="filter-group">
            <label>Цена, BYN</label>
            <div className="price-inputs">
              <input type="number" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="от" aria-label="Цена от" />
              <span>до</span>
              <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="до" aria-label="Цена до" />
            </div>
          </div>

          <div className="filter-group">
            <label>Материал</label>
            <select className="filter-input" value={material} onChange={(event) => setMaterial(event.target.value)}>
              <option value="">Все материалы</option>
              {materials.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>

          <button className="reset-filter" type="button" onClick={reset}>Сбросить</button>
        </section>
      </aside>

      <section className="catalog-content" aria-label="Список товаров">
        <div className="catalog-toolbar">
          <select aria-label="Сортировка" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="popular">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="new">Новинки</option>
          </select>
          <p>Показано {filteredProducts.length} из {products.length}</p>
          <div className="view-switcher" aria-label="Вид каталога">
            <button type="button" aria-label="Плитка" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><span className="grid-icon" /></button>
            <button type="button" aria-label="Список" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><span className="list-icon" /></button>
          </div>
        </div>

        {notice && <div className="catalog-cart-notice">{notice}</div>}

        <div className={view === 'grid' ? 'catalog-products-grid catalog-products-grid--premium' : 'catalog-products-grid catalog-products-grid--premium catalog-products-grid--list'}>
          {filteredProducts.map((product) => {
            const imageSettings = getImagePreset(product, product.image, 'catalog');
            const discount = discountPercent(product.price, product.oldPrice);
            const stats = reviewStats[product.slug] || { average: 0, count: 0 };
            const ratingLabel = stats.count ? stats.average.toFixed(1) : '0.0';
            const reviewsLabel = stats.count ? `${stats.count} ${reviewWord(stats.count)}` : 'нет отзывов';

            return (
              <article className="catalog-product-card catalog-product-card--premium" key={product.slug}>
                <Link href={`/product/${product.slug}`} className="catalog-product-image catalog-product-image--premium">
                  <img src={product.image} alt={product.title} style={imageSettings.style} />
                  <span className="catalog-card-badges">
                    {discount && <b className="badge-sale">-{discount}%</b>}
                    {product.isNew && <b className="badge-new">Новинка</b>}
                    {product.isPopular && <b className="badge-hit">Хит</b>}
                  </span>
                </Link>
                <div className="catalog-product-body catalog-product-body--premium">
                  <div className={stats.count ? 'catalog-rating-row' : 'catalog-rating-row catalog-rating-row--empty'}>
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
                      <button type="button" aria-label={`Добавить в корзину: ${product.title}`} onClick={() => { addToCart(product); setNotice(`${product.title} добавлен в корзину`); }}><Icon name="cart" /></button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredProducts.length && <div className="catalog-empty-state"><h2>Товары не найдены</h2><p>Попробуйте изменить фильтры или поисковый запрос.</p><button type="button" onClick={reset}>Сбросить фильтры</button></div>}
      </section>
    </div>
  );
}
