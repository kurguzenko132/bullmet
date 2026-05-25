'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from './HomePage';
import { SearchIcon, ToolsIcon, TruckIcon } from './Icons';
import { categories, clockCategory, clockThemes, expandProductVariants } from './shopData';
import { useAdminProducts } from './useAdminProducts';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { getImageSettings } from '../lib/imageDisplay';

const materialFilters = ['Металл', 'Дерево', 'Металл и дерево'];

export function CatalogPage() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const activeClockTheme = searchParams.get('clockTheme') || '';
  const { items, ready } = useAdminProducts();
  const catalogProducts = ready ? expandProductVariants(items.filter((product) => {
    if (product.status === 'draft') return false;
    if (activeCategory && product.category !== activeCategory) return false;
    if (activeClockTheme && product.clockTheme !== activeClockTheme) return false;
    return true;
  })) : [];

  return (
    <>
      <Header />
      <main className="catalogPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Каталог</span></div>
          <h1 className="pageTitle">Каталог товаров</h1>
        </section>

        <section className="container catalogLayout">
          <aside className="catalogSidebar" aria-label="Фильтры каталога">
            <div className="filterBox">
              <h3>Категории</h3>
              <nav className="categoryMenu">
                <Link href="/catalog" className={!activeCategory ? 'active' : ''}>Все товары</Link>
                {categories.map((category) => <Link className={activeCategory === category ? 'active' : ''} href={`/catalog?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Тематика часов</h3>
              <nav className="categoryMenu categoryMenu--compact">
                <Link className={!activeClockTheme ? 'active' : ''} href={activeCategory ? `/catalog?category=${encodeURIComponent(activeCategory)}` : '/catalog'}>Все тематики</Link>
                {clockThemes.map((theme) => {
                  const href = `/catalog?category=${encodeURIComponent(clockCategory)}&clockTheme=${encodeURIComponent(theme)}`;
                  return <Link className={activeClockTheme === theme ? 'active' : ''} href={href} key={theme}>{theme}</Link>;
                })}
              </nav>
            </div>

            <div className="filterBox filterBox--line">
              <h3>Фильтр</h3>
              <label className="filterLabel">Цена, BYN</label>
              <div className="priceLine"><span /><i /></div>
              <div className="priceInputs"><input defaultValue="0" /><span>до</span><input defaultValue="2000" /></div>
              <label className="filterLabel filterLabel--space">Материал</label>
              <div className="checks">
                {materialFilters.map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}
              </div>
              <button className="applyFilter">Применить</button>
              <button className="resetFilter">Сбросить</button>
            </div>
          </aside>

          <div className="catalogContent">
            <div className="catalogToolbar">
              <select defaultValue="popular" aria-label="Сортировка">
                <option value="popular">По популярности</option>
                <option value="price-low">Сначала дешевле</option>
                <option value="price-high">Сначала дороже</option>
                <option value="new">Новинки</option>
              </select>
              <p>Показано 1–{Math.min(12, catalogProducts.length)} из {catalogProducts.length}</p>
              <div className="viewButtons"><button aria-label="Плитка"><GridDots /></button><button aria-label="Список"><ListLines /></button></div>
            </div>

            <div className="productCatalogGrid">
              {catalogProducts.length ? catalogProducts.slice(0, 12).map((product) => (
                <article className="catalogCard" key={product.slug}>
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__overlay" aria-label={`Открыть ${product.title}`} />
                  <Link href={`/catalog/${product.slug}`} className="catalogCard__image">
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: getImageSettings(product, product.image).catalogFit, objectPosition: getImageSettings(product, product.image).catalogPosition }} />
                  </Link>
                  <div className="catalogCard__fav"><FavoriteButton product={product} /></div>
                  <div className="catalogCard__body">
                    {(product.colorName || product.variantName) && <span className="catalogCard__variantBadge" style={{ borderColor: product.colorHex ?? product.variantColorHex ?? undefined }}>{product.colorName || product.variantName}</span>}
                    <Link href={`/catalog/${product.slug}`} className="catalogCard__title">{product.colorName ? `${product.title} — ${product.colorName}` : product.variantName ? `${product.title} — ${product.variantName}` : product.title}</Link>
                    <p>{product.short}</p>{product.clockTheme && <em className="catalogCard__theme">{product.clockTheme}</em>}
                    <div className="catalogCard__bottom"><b>от {product.price} BYN</b><AddToCartButton product={product} iconOnly /></div>
                  </div>
                </article>
              )) : <div className="catalogEmpty"><b>Товаров пока нет</b><p>Добавьте товары через админку или проверьте подключение Supabase.</p></div>}
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
