'use client';

import { useRouter } from 'next/navigation';
import { KeyboardEvent, MouseEvent, useMemo, useState } from 'react';
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
    const size = product.sizes?.[0] || 'Под заказ';
    const index = list.findIndex((item) => item.slug === product.slug && item.size === size);
    const item = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      material: product.material,
      size,
      quantity: 1
    };
    const next = index >= 0
      ? list.map((cartItem, i) => i === index ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem)
      : [...list, item];
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  } catch {}
}

type CatalogProps = {
  products: CatalogProduct[];
  reviewStats: ProductReviewStats;
  categories: string[];
  initialQuery?: string;
  initialCategory?: string;
};

export function CatalogClient({ products, reviewStats, categories, initialQuery = '', initialCategory = '' }: CatalogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [material, setMaterial] = useState('');
  const [pricePreset, setPricePreset] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [notice, setNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const materials = useMemo(() => Array.from(new Set(products.map((product) => product.material).filter(Boolean))), [products]);
  const maxProductPrice = useMemo(() => Math.max(...products.map((product) => product.price), 0), [products]);

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const keys = [product.category, product.clockTheme].filter(Boolean) as string[];
      keys.forEach((key) => { acc[key] = (acc[key] || 0) + 1; });
      return acc;
    }, {});
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Infinity);

    return products
      .filter((product) => {
        const text = [product.title, product.slug, product.category, product.clockTheme, product.short, product.material, product.description].join(' ').toLowerCase();
        const matchesQuery = !q || text.includes(q);
        const matchesCategory = !category || product.category === category || product.clockTheme === category || text.includes(category.toLowerCase());
        const matchesMaterial = !material || product.material === material;
        const matchesPrice = product.price >= min && product.price <= max;
        return matchesQuery && matchesCategory && matchesMaterial && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'new') return Number(b.isNew) - Number(a.isNew) || a.title.localeCompare(b.title, 'ru');
        if (sort === 'discount') return Number(Boolean(b.oldPrice && b.oldPrice > b.price)) - Number(Boolean(a.oldPrice && a.oldPrice > a.price));
        return Number(b.isPopular) - Number(a.isPopular) || a.title.localeCompare(b.title, 'ru');
      });
  }, [products, query, category, material, minPrice, maxPrice, sort]);

  const selectedFiltersCount = [query.trim(), category, material, minPrice, maxPrice].filter(Boolean).length;

  function reset() {
    setQuery('');
    setCategory('');
    setMaterial('');
    setMinPrice('');
    setMaxPrice('');
    setPricePreset('');
    setSort('popular');
  }

  function choosePricePreset(value: string) {
    setPricePreset(value);
    if (value === 'cheap') { setMinPrice(''); setMaxPrice('200'); }
    if (value === 'middle') { setMinPrice('200'); setMaxPrice('700'); }
    if (value === 'premium') { setMinPrice('700'); setMaxPrice(''); }
  }

  function openProduct(slug: string) {
    router.push(`/product/${slug}`);
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>, slug: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProduct(slug);
    }
  }

  function onCartClick(event: MouseEvent<HTMLButtonElement>, product: CatalogProduct) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
    setNotice(`${product.title} добавлен в корзину`);
    window.setTimeout(() => setNotice(''), 2200);
  }

  return (
    <div className="catalog-layout catalog-layout--shop">
      <aside className={filtersOpen ? 'catalog-smart-filter is-open' : 'catalog-smart-filter'} aria-label="Фильтры каталога">
        <div className="catalog-smart-filter-head">
          <div>
            <span>Фильтр</span>
            <h2>Подберите изделие</h2>
          </div>
          <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтр">×</button>
        </div>

        <label className="catalog-filter-search-modern">
          <Icon name="search" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск: римские, кофе, качели..." />
        </label>

        <div className="catalog-filter-section-modern">
          <div className="catalog-filter-title-modern"><b>Категории</b><small>{category || 'Все товары'}</small></div>
          <div className="catalog-category-modern-list">
            <button className={!category ? 'is-active' : ''} type="button" onClick={() => setCategory('')}><span>Все товары</span><b>{products.length}</b></button>
            {categories.map((item) => (
              <button key={item} className={category === item ? 'is-active' : ''} type="button" onClick={() => setCategory(item)}>
                <span>{item}</span><b>{categoryCounts[item] || 0}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-filter-section-modern">
          <div className="catalog-filter-title-modern"><b>Цена</b><small>{maxProductPrice ? `до ${money(maxProductPrice)} BYN` : 'по каталогу'}</small></div>
          <div className="catalog-price-grid-modern">
            <input type="number" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPricePreset(''); }} placeholder="от" aria-label="Цена от" />
            <input type="number" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPricePreset(''); }} placeholder="до" aria-label="Цена до" />
          </div>
          <div className="catalog-price-presets-modern">
            <button className={pricePreset === 'cheap' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('cheap')}>до 200</button>
            <button className={pricePreset === 'middle' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('middle')}>200–700</button>
            <button className={pricePreset === 'premium' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('premium')}>от 700</button>
          </div>
        </div>

        <div className="catalog-filter-section-modern">
          <div className="catalog-filter-title-modern"><b>Материал</b><small>{material || 'Все'}</small></div>
          <select value={material} onChange={(event) => setMaterial(event.target.value)}>
            <option value="">Все материалы</option>
            {materials.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>

        {selectedFiltersCount > 0 && (
          <div className="catalog-active-chips-modern">
            {query.trim() && <button type="button" onClick={() => setQuery('')}>Поиск: {query} ×</button>}
            {category && <button type="button" onClick={() => setCategory('')}>{category} ×</button>}
            {material && <button type="button" onClick={() => setMaterial('')}>{material} ×</button>}
            {(minPrice || maxPrice) && <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setPricePreset(''); }}>Цена ×</button>}
          </div>
        )}

        <button className="catalog-reset-modern" type="button" onClick={reset}>Сбросить фильтры</button>
      </aside>

      <section className="catalog-content catalog-content--shop" aria-label="Список товаров">
        <div className="catalog-mobile-filter-trigger">
          <button type="button" onClick={() => setFiltersOpen(true)}>Фильтры {selectedFiltersCount > 0 && <span>{selectedFiltersCount}</span>}</button>
          <button type="button" onClick={reset}>Сбросить</button>
        </div>

        <div className="catalog-toolbar catalog-toolbar--shop">
          <div>
            <span>Найдено</span>
            <b>{filteredProducts.length} из {products.length}</b>
          </div>
          <select aria-label="Сортировка" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="popular">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="new">Новинки</option>
            <option value="discount">Со скидкой</option>
          </select>
          <div className="view-switcher" aria-label="Вид каталога">
            <button type="button" aria-label="Плитка" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><span className="grid-icon" /></button>
            <button type="button" aria-label="Список" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><span className="list-icon" /></button>
          </div>
        </div>

        {notice && <div className="catalog-cart-notice">{notice}</div>}

        <div className={view === 'grid' ? 'catalog-products-grid catalog-products-grid--shop' : 'catalog-products-grid catalog-products-grid--shop catalog-products-grid--list'}>
          {filteredProducts.map((product) => {
            const imageSettings = getImagePreset(product, product.image, 'catalog');
            const discount = discountPercent(product.price, product.oldPrice);
            const stats = reviewStats[product.slug] || { average: 0, count: 0 };
            const ratingLabel = stats.count ? stats.average.toFixed(1) : '0.0';
            const reviewsLabel = stats.count ? `${stats.count} ${reviewWord(stats.count)}` : 'нет отзывов';

            return (
              <article
                className="catalog-product-card-shop"
                key={product.slug}
                role="link"
                tabIndex={0}
                onClick={() => openProduct(product.slug)}
                onKeyDown={(event) => onCardKeyDown(event, product.slug)}
                aria-label={`Открыть товар: ${product.title}`}
              >
                <div className="catalog-product-image-shop">
                  <img src={product.image} alt={product.title} style={imageSettings.style} />
                  <span className="catalog-card-badges catalog-card-badges--shop">
                    {discount && <b className="badge-sale">-{discount}%</b>}
                    {product.isNew && <b className="badge-new">Новинка</b>}
                    {product.isPopular && <b className="badge-hit">Хит</b>}
                  </span>
                </div>
                <div className="catalog-product-body-shop">
                  <div className={stats.count ? 'catalog-rating-row-shop' : 'catalog-rating-row-shop is-empty'}>
                    <span>★ {ratingLabel}</span>
                    <small>{reviewsLabel}</small>
                  </div>
                  <h3>{product.title}</h3>
                  <p>{product.short || product.material}</p>
                  <div className="catalog-product-tags-shop">
                    <span>{product.category || 'Каталог'}</span>
                    <span>{product.inStock ? 'В наличии / под заказ' : 'Под заказ'}</span>
                  </div>
                  <div className="catalog-product-bottom-shop">
                    <div>
                      <b>от {money(product.price)} BYN</b>
                      {product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)} BYN</del>}
                    </div>
                    <button type="button" aria-label={`Добавить в корзину: ${product.title}`} onClick={(event) => onCartClick(event, product)}><Icon name="cart" /></button>
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
