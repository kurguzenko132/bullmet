'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from './HomePage';
import { SearchIcon, ToolsIcon, TruckIcon } from './Icons';
import { categories as fallbackCategories, clockCategory, clockThemes as fallbackClockThemes, expandProductVariants } from './shopData';
import { getActiveCategoryNames, getActiveClockThemeNames, readCatalogSettingsAsync } from './categoryStore';
import { useAdminProducts } from './useAdminProducts';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { QuickOrderButton } from './QuickOrderButton';
import { getImageSettings } from '../lib/imageDisplay';
import { loadReviewSummaries, type ProductReviewSummary } from '../lib/reviews';

const materialFilters = ['Металл', 'Дерево', 'Металл и дерево'];

export function CatalogPage() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(fallbackCategories);
  const [clockThemeOptions, setClockThemeOptions] = useState<string[]>(fallbackClockThemes);
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ProductReviewSummary>>({});
  const activeCategory = searchParams.get('category') || '';
  const activeClockTheme = searchParams.get('clockTheme') || '';
  const { items, ready } = useAdminProducts();
  // Filter and sort state
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('popular');

  useEffect(() => {
    let mounted = true;
    readCatalogSettingsAsync().then((settings) => {
      if (!mounted) return;
      const nextCategories = getActiveCategoryNames(settings);
      const nextThemes = getActiveClockThemeNames(settings);
      setCategoryOptions(nextCategories.length ? nextCategories : fallbackCategories);
      setClockThemeOptions(nextThemes.length ? nextThemes : fallbackClockThemes);
    });
    return () => { mounted = false; };
  }, []);
  // Compute base catalog products from items and active category/theme filters
  const baseProducts = useMemo(() => {
    if (!ready) return [] as ReturnType<typeof expandProductVariants>;
    const filtered = items.filter((product) => {
      if (product.status === 'draft') return false;
      if (activeCategory && product.category !== activeCategory) return false;
      if (activeClockTheme && product.clockTheme !== activeClockTheme) return false;
      return true;
    });
    return expandProductVariants(filtered);
  }, [items, ready, activeCategory, activeClockTheme]);

  // Apply price and material filters
  const filteredProducts = useMemo(() => {
    let result = baseProducts;
    // Filter by material
    if (selectedMaterials.length) {
      result = result.filter((product) => selectedMaterials.includes(product.material ?? ''));
    }
    // Filter by price range
    result = result.filter((product) => {
      const price = Number(product.price ?? 0);
      return price >= minPrice && price <= maxPrice;
    });
    return result;
  }, [baseProducts, selectedMaterials, minPrice, maxPrice]);

  // Sort products based on sortOption
  const catalogProducts = useMemo(() => {
    const products = filteredProducts.slice();
    switch (sortOption) {
      case 'price-low':
        products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-high':
        products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'new':
        products.sort((a, b) => {
          const aNew = a.isNew ? 1 : 0;
          const bNew = b.isNew ? 1 : 0;
          return bNew - aNew;
        });
        break;
      case 'popular':
      default:
        products.sort((a, b) => {
          const aPopular = a.isPopular ? 1 : 0;
          const bPopular = b.isPopular ? 1 : 0;
          return bPopular - aPopular;
        });
        break;
    }
    return products;
  }, [filteredProducts, sortOption]);

  useEffect(() => {
    let mounted = true;
    loadReviewSummaries(catalogProducts.slice(0, 24).map((product) => product.slug))
      .then((summaries) => { if (mounted) setReviewSummaries(summaries); })
      .catch(() => { if (mounted) setReviewSummaries({}); });
    return () => { mounted = false; };
  }, [catalogProducts]);

  return (
    <>
      <Header />
      <main className="catalogPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Каталог</span></div>
          <h1 className="pageTitle">Каталог товаров</h1>
        </section>

        <section className="container catalogLayout">
          <button type="button" className="mobileFilterToggle" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>
            <span>Фильтры</span>
            <b>{filtersOpen ? 'Свернуть' : 'Открыть'}</b>
          </button>
          <aside className={`catalogSidebar ${filtersOpen ? 'catalogSidebar--open' : ''}`} aria-label="Фильтры каталога">
            <div className="mobileFilterHead"><b>Фильтры каталога</b><button type="button" onClick={() => setFiltersOpen(false)}>Закрыть</button></div>
            <div className="filterBox">
              <h3>Категории</h3>
              <nav className="categoryMenu">
                <Link href="/catalog" className={!activeCategory ? 'active' : ''}>Все товары</Link>
                {categoryOptions.map((category) => <Link className={activeCategory === category ? 'active' : ''} href={`/catalog?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Тематика часов</h3>
              <nav className="categoryMenu categoryMenu--compact">
                <Link className={!activeClockTheme ? 'active' : ''} href={activeCategory ? `/catalog?category=${encodeURIComponent(activeCategory)}` : '/catalog'}>Все тематики</Link>
                {clockThemeOptions.map((theme) => {
                  const href = `/catalog?category=${encodeURIComponent(clockCategory)}&clockTheme=${encodeURIComponent(theme)}`;
                  return <Link className={activeClockTheme === theme ? 'active' : ''} href={href} key={theme}>{theme}</Link>;
                })}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Фильтр</h3>
              <label className="filterLabel">Цена, BYN</label>
              <div className="priceLine"><span /><i /></div>
              <div className="priceInputs">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                />
                <span>до</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                />
              </div>
              <label className="filterLabel filterLabel--space">Материал</label>
              <div className="checks">
                {materialFilters.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(item)}
                      onChange={() => {
                        setSelectedMaterials((current) =>
                          current.includes(item) ? current.filter((m) => m !== item) : [...current, item]
                        );
                      }}
                    />
                    {item}
                  </label>
                ))}
              </div>
              <button type="button" className="applyFilter" onClick={() => setFiltersOpen(false)}>
                Применить
              </button>
              <button
                type="button"
                className="resetFilter"
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(2000);
                  setSelectedMaterials([]);
                }}
              >
                Сбросить
              </button>
            </div>
          </aside>

          <div className="catalogContent">
            <div className="catalogToolbar">
              <select value={sortOption} aria-label="Сортировка" onChange={(event) => setSortOption(event.target.value)}>
                <option value="popular">По популярности</option>
                <option value="price-low">Сначала дешевле</option>
                <option value="price-high">Сначала дороже</option>
                <option value="new">Новинки</option>
              </select>
              <p>
                {catalogProducts.length <= 12
                  ? `Найдено ${catalogProducts.length} ${catalogProducts.length % 10 === 1 && catalogProducts.length % 100 !== 11 ? 'товар' : catalogProducts.length % 10 >= 2 && catalogProducts.length % 10 <= 4 && (catalogProducts.length % 100 < 10 || catalogProducts.length % 100 >= 20) ? 'товара' : 'товаров'}`
                  : `Показано 1–${Math.min(12, catalogProducts.length)} из ${catalogProducts.length}`}
              </p>
              <div className="viewButtons"><button aria-label="Плитка"><GridDots /></button><button aria-label="Список"><ListLines /></button></div>
            </div>

            <div className="productCatalogGrid">
              {catalogProducts.length ? catalogProducts.slice(0, 12).map((product) => {
                const review = reviewSummaries[product.slug];
                return (
                <article className="catalogCard catalogCard--mobileMarket" key={product.slug}>
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__overlay" aria-label={`Открыть ${product.title}`} />
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__image">
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: getImageSettings(product, product.image).catalogFit, objectPosition: getImageSettings(product, product.image).catalogPosition }} />
                  </Link>
                  <div className="catalogCard__fav"><FavoriteButton product={product} /></div>
                  <div className="catalogCard__body">
                    {(product.colorName || product.variantName) && <span className="catalogCard__variantBadge" style={{ borderColor: product.colorHex ?? product.variantColorHex ?? undefined }}>{product.colorName || product.variantName}</span>}
                    <Link href={`/catalog/${product.slug}`} className="catalogCard__title">{product.colorName ? `${product.title} — ${product.colorName}` : product.variantName ? `${product.title} — ${product.variantName}` : product.title}</Link>
                    <p>{product.short}</p>{product.clockTheme && <em className="catalogCard__theme">{product.clockTheme}</em>}
                    <div className="catalogCard__rating"><span>★</span>{review ? `${review.average.toFixed(1).replace('.', ',')} · ${review.count} ${review.count === 1 ? 'отзыв' : 'отзывов'}` : 'Пока нет отзывов'}</div>
                    <div className="catalogCard__bottom"><b>от {product.price} BYN</b><AddToCartButton product={product} iconOnly /></div><div className="catalogCard__quick"><QuickOrderButton product={product} label="Купить в 1 клик" compact className="catalogQuickOrderBtn" /></div>
                  </div>
                </article>
              );
              }) : <div className="catalogEmpty"><b>Товаров пока нет</b><p>Добавьте товары через админку или проверьте подключение Supabase.</p></div>}
            </div>

            {catalogProducts.length > 12 && <div className="pagination"><span className="active">1</span><span>2</span><span>3</span><span>4</span><button>→</button></div>}
          </div>
        </section>

        <section className="container catalogInfoStrip">
          <div><ToolsIcon /><b>Собственное производство</b><span>Изготавливаем изделия под задачи клиента</span></div>
          <div><SearchIcon /><b>Поможем с выбором</b><span>Подскажем материал, размер и покрытие</span></div>
          <div><TruckIcon /><b>Доставка по Беларуси</b><span>Самовывоз или отправка в ваш город</span></div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function GridDots() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 5h3v3H5V5Zm0 6h3v3H5v-3Zm0 6h3v3H5v-3Zm6-12h3v3h-3V5Zm0 6h3v3h-3v-3Zm0 6h3v3h-3v-3Zm6-12h3v3h-3V5Zm0 6h3v3h-3v-3Zm0 6h3v3h-3v-3Z" fill="currentColor" /></svg>;
}
function ListLines() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>;
}
