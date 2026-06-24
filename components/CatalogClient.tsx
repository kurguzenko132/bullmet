'use client';

import { KeyboardEvent, MouseEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import type { CatalogProduct, ProductReviewStats } from '@/lib/products';
import { clockCatalogCategories } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';

type MainCatalogGroup = 'clocks';

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

function isClockProduct(product: CatalogProduct) {
  const text = [product.title, product.slug, product.category, product.clockTheme].join(' ').toLowerCase();
  return text.includes('час') || Boolean(product.clockTheme);
}

function getInitialGroup(_initialCategory: string): MainCatalogGroup {
  return 'clocks';
}

function getInitialClockTheme(initialCategory: string) {
  return clockCatalogCategories.includes(initialCategory) ? initialCategory : '';
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

export function CatalogClient({ products, reviewStats, initialQuery = '', initialCategory = '' }: CatalogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [mainGroup, setMainGroup] = useState<MainCatalogGroup>(getInitialGroup(initialCategory));
  const [clockTheme, setClockTheme] = useState(getInitialClockTheme(initialCategory));
  const [material, setMaterial] = useState('');
  const [pricePreset, setPricePreset] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [notice, setNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const clockProducts = useMemo(() => products.filter(isClockProduct), [products]);
  const productsByMainGroup = useMemo(() => clockProducts, [clockProducts]);

  const materials = useMemo(() => Array.from(new Set(productsByMainGroup.map((product) => product.material).filter(Boolean))), [productsByMainGroup]);

  const clockThemeCounts = useMemo(() => {
    return clockProducts.reduce<Record<string, number>>((acc, product) => {
      const theme = product.clockTheme || product.category;
      if (theme && clockCatalogCategories.includes(theme)) acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {});
  }, [clockProducts]);

  const visibleClockThemes = useMemo(() => {
    return clockCatalogCategories.filter((item) => (clockThemeCounts[item] || 0) > 0 || item === clockTheme);
  }, [clockTheme, clockThemeCounts]);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Infinity);

    return productsByMainGroup
      .filter((product) => {
        const text = [product.title, product.slug, product.category, product.clockTheme, product.short, product.material, product.description].join(' ').toLowerCase();
        const matchesQuery = !q || text.includes(q);
        const matchesClockTheme = mainGroup !== 'clocks' || !clockTheme || product.clockTheme === clockTheme || product.category === clockTheme || text.includes(clockTheme.toLowerCase());
        const matchesMaterial = !material || product.material === material;
        const matchesPrice = product.price >= min && product.price <= max;
        return matchesQuery && matchesClockTheme && matchesMaterial && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'new') return Number(b.isNew) - Number(a.isNew) || a.title.localeCompare(b.title, 'ru');
        if (sort === 'discount') return Number(Boolean(b.oldPrice && b.oldPrice > b.price)) - Number(Boolean(a.oldPrice && a.oldPrice > a.price));
        return Number(b.isPopular) - Number(a.isPopular) || a.title.localeCompare(b.title, 'ru');
      });
  }, [productsByMainGroup, query, mainGroup, clockTheme, material, minPrice, maxPrice, sort]);

  const selectedFiltersCount = [query.trim(), clockTheme, material, minPrice, maxPrice].filter(Boolean).length;

  function reset() {
    setQuery('');
    setMainGroup('clocks');
    setClockTheme('');
    setMaterial('');
    setMinPrice('');
    setMaxPrice('');
    setPricePreset('');
    setSort('popular');
  }

  function chooseMainGroup(value: MainCatalogGroup) {
    setMainGroup(value);
    setClockTheme('');
    setMaterial('');
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
    <div className="catalog-layout-market">
      <div className="catalog-mobile-filter-trigger catalog-mobile-filter-trigger--market">
        <button type="button" onClick={() => setFiltersOpen(true)}>Фильтры {selectedFiltersCount > 0 && <span>{selectedFiltersCount}</span>}</button>
        {selectedFiltersCount > 0 && <button type="button" onClick={reset}>Сбросить</button>}
      </div>

      <aside className={filtersOpen ? 'catalog-filter-market is-open' : 'catalog-filter-market'} aria-label="Фильтры каталога">
        <div className="catalog-filter-market-head">
          <b>Фильтры</b>
          {selectedFiltersCount > 0 && <button type="button" onClick={reset}>Сбросить</button>}
          <button className="catalog-filter-close" type="button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтр">×</button>
        </div>

        <section className="catalog-filter-market-section catalog-filter-market-section--main">
          <h3>Раздел</h3>
          <div className="catalog-main-groups-market">
            <button className="is-active" type="button" onClick={() => chooseMainGroup('clocks')}><span>Настенные часы</span><b>{clockProducts.length}</b></button>
          </div>
        </section>

        {mainGroup === 'clocks' && (
          <section className="catalog-filter-market-section catalog-filter-market-section--themes">
            <h3>Тематика часов</h3>
            <div className="catalog-category-pills-market catalog-category-pills-market--nested">
              <button className={!clockTheme ? 'is-active' : ''} type="button" onClick={() => setClockTheme('')}><span>Все часы</span><b>{clockProducts.length}</b></button>
              {visibleClockThemes.map((item) => (
                <button key={item} className={clockTheme === item ? 'is-active' : ''} type="button" onClick={() => setClockTheme(item)}>
                  <span>{item}</span><b>{clockThemeCounts[item] || 0}</b>
                </button>
              ))}
            </div>
          </section>
        )}

        <details className="catalog-filter-market-section" open>
          <summary>Цена</summary>
          <div className="catalog-price-inputs-market">
            <input type="number" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPricePreset(''); }} placeholder="от" aria-label="Цена от" />
            <input type="number" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPricePreset(''); }} placeholder="до" aria-label="Цена до" />
          </div>
          <div className="catalog-price-presets-market">
            <button className={pricePreset === 'cheap' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('cheap')}>до 200</button>
            <button className={pricePreset === 'middle' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('middle')}>200–700</button>
            <button className={pricePreset === 'premium' ? 'is-active' : ''} type="button" onClick={() => choosePricePreset('premium')}>от 700</button>
          </div>
        </details>

        <details className="catalog-filter-market-section" open>
          <summary>Материал</summary>
          <div className="catalog-radio-list-market">
            <button className={!material ? 'is-active' : ''} type="button" onClick={() => setMaterial('')}>Все материалы</button>
            {materials.map((item) => <button className={material === item ? 'is-active' : ''} type="button" onClick={() => setMaterial(item)} key={item}>{item}</button>)}
          </div>
        </details>
      </aside>

      <section className="catalog-content-market" aria-label="Список товаров">
        <div className="catalog-toolbar-market">
          <label className="catalog-search-market">
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Искать часы: римские, кофе, классика..." />
          </label>

          <select aria-label="Сортировка" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="popular">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="new">Новинки</option>
            <option value="discount">Со скидкой</option>
          </select>

          <div className="view-switcher view-switcher--market" aria-label="Вид каталога">
            <button type="button" aria-label="Плитка" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><span className="grid-icon" /></button>
            <button type="button" aria-label="Список" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><span className="list-icon" /></button>
          </div>
        </div>

        <div className="catalog-results-row-market">
          <b>{filteredProducts.length} товаров</b>
          <div className="catalog-active-chips-market">
            {query.trim() && <button type="button" onClick={() => setQuery('')}>Поиск: {query} ×</button>}
            {clockTheme && <button type="button" onClick={() => setClockTheme('')}>{clockTheme} ×</button>}
            {material && <button type="button" onClick={() => setMaterial('')}>{material} ×</button>}
            {(minPrice || maxPrice) && <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setPricePreset(''); }}>Цена ×</button>}
          </div>
        </div>

        {notice && <div className="catalog-cart-notice catalog-cart-notice--market">{notice}</div>}

        <div className={view === 'grid' ? 'catalog-grid-market' : 'catalog-grid-market catalog-grid-market--list'}>
          {filteredProducts.map((product) => {
            const imageSettings = getImagePreset(product, product.image, 'catalog');
            const discount = discountPercent(product.price, product.oldPrice);
            const stats = reviewStats[product.slug] || { average: 0, count: 0 };
            const ratingLabel = stats.count ? stats.average.toFixed(1) : '0.0';
            const reviewsLabel = stats.count ? `${stats.count} ${reviewWord(stats.count)}` : 'нет отзывов';

            return (
              <article
                className="catalog-card-market"
                key={product.slug}
                role="link"
                tabIndex={0}
                onClick={() => openProduct(product.slug)}
                onKeyDown={(event) => onCardKeyDown(event, product.slug)}
                aria-label={`Открыть товар: ${product.title}`}
              >
                <div className="catalog-card-image-market">
                  <img src={product.image} alt={product.title} style={imageSettings.style} />
                  {discount && <span className="catalog-sale-market">-{discount}%</span>}
                </div>
                <div className="catalog-card-body-market">
                  <div className="catalog-card-rating-market">
                    <span>★ {ratingLabel}</span>
                    <small>{reviewsLabel}</small>
                  </div>
                  <h3>{product.title}</h3>
                  <p>{product.short || product.material}</p>
                  <div className="catalog-card-status-market">
                    <span className={product.inStock ? 'is-available' : 'is-order'}>{product.inStock ? 'В наличии' : 'Под заказ'}</span>
                    {product.category && <small>{product.category}</small>}
                  </div>
                  <div className="catalog-card-bottom-market">
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
