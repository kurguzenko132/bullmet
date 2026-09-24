'use client';

import { KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from './Icon';
import { CatalogFilterSidebar } from './CatalogFilterSidebar';
import { productAvailability, type CatalogProduct, type ProductReviewStats } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';
import type { ReviewControlSettings } from '@/lib/reviewControl';

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
  if (productAvailability(product) === 'unavailable') return;
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(cart) ? cart : [];
    const size = product.sizes?.[0] || 'Под заказ';
    const index = list.findIndex((item) => item.slug === product.slug && item.size === size);
    const item = {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      material: product.material,
      size,
      availability: productAvailability(product),
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
  reviewSettings: Pick<ReviewControlSettings, 'productRating' | 'productCount'>;
  categories: string[];
  initialQuery?: string;
  initialCategory?: string;
  initialMaterial?: string;
  initialPriceFrom?: string;
  initialPriceTo?: string;
  initialSort?: string;
};

type CatalogFilterState = {
  query: string;
  category: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
};

function stateFromSearchParams(searchParams: URLSearchParams): CatalogFilterState {
  return {
    query: searchParams.get('search') || searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    material: searchParams.get('material') || '',
    minPrice: searchParams.get('priceFrom') || '',
    maxPrice: searchParams.get('priceTo') || '',
    sort: searchParams.get('sort') || 'popular'
  };
}

function stateKey(state: CatalogFilterState) {
  return [state.query, state.category, state.material, state.minPrice, state.maxPrice, state.sort].join('\u0001');
}

function invalidPriceRange(minPrice: string, maxPrice: string) {
  if (!minPrice || !maxPrice) return false;
  return Number(minPrice) > Number(maxPrice);
}

function catalogUrl(state: CatalogFilterState) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('search', state.query.trim());
  if (state.category) params.set('category', state.category);
  if (state.minPrice) params.set('priceFrom', state.minPrice);
  if (state.maxPrice) params.set('priceTo', state.maxPrice);
  if (state.material) params.set('material', state.material);
  if (state.sort !== 'popular') params.set('sort', state.sort);
  return `/catalog${params.size ? `?${params.toString()}` : ''}`;
}

export function CatalogClient({
  products,
  reviewStats,
  reviewSettings,
  categories,
  initialQuery = '',
  initialCategory = '',
  initialMaterial = '',
  initialPriceFrom = '',
  initialPriceTo = '',
  initialSort = 'popular'
}: CatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [material, setMaterial] = useState(initialMaterial);
  const [minPrice, setMinPrice] = useState(initialPriceFrom);
  const [maxPrice, setMaxPrice] = useState(initialPriceTo);
  const [sort, setSort] = useState(initialSort);
  const [notice, setNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceError, setPriceError] = useState('');
  const skipUrlWriteFor = useRef<string | null>(null);

  const filterState = { query, category, material, minPrice, maxPrice, sort };
  const filterKey = stateKey(filterState);
  const searchKey = searchParams.toString();

  useEffect(() => {
    const next = stateFromSearchParams(new URLSearchParams(searchKey));
    if (stateKey(next) === filterKey) {
      setPriceError(invalidPriceRange(next.minPrice, next.maxPrice) ? 'Цена «от» не может быть больше цены «до».' : '');
      return;
    }
    skipUrlWriteFor.current = stateKey(next);
    setQuery(next.query);
    setCategory(next.category);
    setMaterial(next.material);
    setMinPrice(next.minPrice);
    setMaxPrice(next.maxPrice);
    setSort(next.sort);
    setPriceError(invalidPriceRange(next.minPrice, next.maxPrice) ? 'Цена «от» не может быть больше цены «до».' : '');
  }, [searchKey]);

  useEffect(() => {
    if (skipUrlWriteFor.current === filterKey) {
      skipUrlWriteFor.current = null;
      return;
    }
    if (invalidPriceRange(minPrice, maxPrice)) return;
    const nextUrl = catalogUrl(filterState);
    if (`${pathname}${window.location.search}` !== nextUrl) router.replace(nextUrl, { scroll: false });
  }, [filterKey, pathname, router]);

  const materials = useMemo(() => Array.from(new Set(products.map((product) => product.material).filter(Boolean))), [products]);
  const categoryOptions = useMemo(() => categories.map((item) => ({
    id: item,
    label: item,
    count: products.filter((product) => product.category === item || product.clockTheme === item).length
  })), [categories, products]);

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
    setPriceError('');
  }

  function openProduct(slug: string) {
    router.push(`/product/${slug}`);
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>, slug: string) {
    if (event.target !== event.currentTarget) return;
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

      <CatalogFilterSidebar
        categories={categoryOptions}
        materials={materials.map((item) => ({ id: item, label: item }))}
        productsCount={products.length}
        selectedCategory={category}
        selectedMaterial={material}
        priceFrom={minPrice}
        priceTo={maxPrice}
        priceError={priceError}
        activeFiltersCount={selectedFiltersCount}
        resultsCount={filteredProducts.length}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onCategoryChange={setCategory}
        onMaterialChange={setMaterial}
        onPriceApply={(from, to) => {
          if (invalidPriceRange(from, to)) {
            setPriceError('Цена «от» не может быть больше цены «до».');
            return;
          }
          setPriceError('');
          setMinPrice(from);
          setMaxPrice(to);
        }}
        onReset={reset}
      />

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

        </div>

        <div className="catalog-results-row-market">
          <b>Показано {filteredProducts.length ? `1–${filteredProducts.length}` : '0'} из {filteredProducts.length}</b>
          <div className="catalog-active-chips-market">
            {query.trim() && <button type="button" onClick={() => setQuery('')}>Поиск: {query} ×</button>}
            {category && <button type="button" onClick={() => setCategory('')}>{category} ×</button>}
            {material && <button type="button" onClick={() => setMaterial('')}>{material} ×</button>}
            {(minPrice || maxPrice) && <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Цена ×</button>}
          </div>
        </div>

        {notice && <div className="catalog-cart-notice catalog-cart-notice--market">{notice}</div>}

        <div className="catalog-grid-market">
          {filteredProducts.map((product) => {
            const imageSettings = getImagePreset(product, product.image, 'catalog');
            const discount = discountPercent(product.price, product.oldPrice);
            const availability = productAvailability(product);
            const storedStats = reviewStats[product.slug] || { average: 0, count: 0 };
            const stats = {
              count: storedStats.count || product.reviewsCount || 0,
              average: storedStats.count ? storedStats.average : (product.rating || 0)
            };
            const ratingLabel = stats.average.toFixed(1);
            const reviewsLabel = stats.count ? `${stats.count} ${reviewWord(stats.count)}` : 'Нет отзывов';

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
                    {stats.count ? <>{reviewSettings.productRating && <span>★ {ratingLabel}</span>}{reviewSettings.productCount && <small>{reviewSettings.productRating ? '· ' : ''}{reviewsLabel}</small>}</> : reviewSettings.productCount && <small>{reviewsLabel}</small>}
                  </div>
                  <h3>{product.title}</h3>
                  <p>{product.material || product.short}</p>
                  <small>{availability === 'in_stock' ? 'В наличии' : availability === 'made_to_order' ? 'Под заказ · 5–7 дней' : 'Недоступен к покупке'}</small>
                  <p className="catalog-card-color-market">Цвет: <span>{product.colorName || 'не указан'}</span></p>
                  <div className="catalog-card-bottom-market">
                    <div>
                      <b>от {money(product.price)} BYN</b>
                      {product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)} BYN</del>}
                    </div>
                    <button type="button" disabled={availability === 'unavailable'} aria-label={availability === 'unavailable' ? `${product.title} недоступен` : `Добавить в корзину: ${product.title}`} onClick={(event) => onCartClick(event, product)}><Icon name="cart" /></button>
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
