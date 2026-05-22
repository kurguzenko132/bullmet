'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowIcon, CartIcon, ClockIcon, DraftIcon, FactoryIcon, MailIcon, PhoneIcon, PinIcon, SearchIcon, ShieldIcon, ToolsIcon, TruckIcon, UserIcon } from './Icons';
import { CartHeaderButton } from './CartHeaderButton';
import { defaultHomeSettings, HomeSettings, readHomeSettingsAsync } from './siteSettings';
import { useAdminProducts } from './useAdminProducts';
import type { AdminProduct } from './adminProductStore';

const nav = [
  { title: 'Каталог', href: '/catalog' },
  { title: 'Производство', href: '/production' },
  { title: 'Услуги', href: '/services' },
  { title: 'О компании', href: '/about' },
  { title: 'Контакты', href: '/contacts' },
];

const benefits = [
  { icon: FactoryIcon, title: 'Собственное', text: 'производство' },
  { icon: DraftIcon, title: 'Индивидуальные', text: 'заказы' },
  { icon: ToolsIcon, title: 'Металл', text: 'и дерево' },
  { icon: TruckIcon, title: 'Доставка по', text: 'Беларуси' },
];


const serviceCards = [
  { title: 'Резка металла', text: 'Для декора, деталей, табличек, конструкций и других изделий.', image: '/assets/service-metal.jpg', href: '/request?type=metal-cutting' },
  { title: 'Резка дерева', text: 'Для интерьерных элементов, вывесок, подарков, декора и других идей.', image: '/assets/service-wood.jpg', href: '/request?type=wood-cutting' },
];

const process = [
  { num: '01', title: 'Вы оставляете заявку', text: 'Через форму на сайте или по телефону', icon: DraftIcon },
  { num: '02', title: 'Мы уточняем детали', text: 'Размеры, материал, пожелания', icon: ToolsIcon },
  { num: '03', title: 'Рассчитываем стоимость', text: 'Согласовываем цену и сроки', icon: ShieldIcon },
  { num: '04', title: 'Изготавливаем изделие', text: 'Контроль качества на каждом этапе', icon: FactoryIcon },
  { num: '05', title: 'Передаем заказ', text: 'Самовывоз или доставка по Беларуси', icon: TruckIcon },
];

const gallery = ['gallery-1.jpg', 'gallery-2.jpg', 'gallery-3.jpg', 'gallery-4.jpg', 'gallery-5.jpg', 'gallery-6.jpg'];

function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Bullmet">
      <Image src="/assets/logo-mark.png" alt="" width={38} height={42} className="logo__mark" priority />
      <span>
        <b>BULLMET</b>
        <small>производство металла и дерева</small>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="header" id="top">
      <div className="container header__inner">
        <Logo />
        <nav className="nav" aria-label="Основное меню">
          {nav.map((item) => <Link href={item.href} key={item.title}>{item.title}</Link>)}
        </nav>
        <div className="header__actions">
          <button className="iconButton" aria-label="Поиск"><SearchIcon /></button>
          <Link className="accountButton" href="/account" aria-label="Войти в аккаунт"><UserIcon /></Link>
          <CartHeaderButton />
          <Link className="topCta" href="/request">Заказать расчет</Link>
          <button className="burger" aria-label="Открыть меню"><span /><span /><span /></button>
        </div>
      </div>
    </header>
  );
}

function Promo({ settings }: { settings: HomeSettings }) {
  return (
    <section className="promo">
      <div className="promo__bg"><Image src={settings.heroImage} alt="Производство Bullmet" fill priority sizes="100vw" /></div>
      <div className="container promo__content">
        <h1>Bullmet — собственное производство изделий из металла и дерева</h1>
        <p className="promo__text">Производим часы, садовые качели, элементы декора, а также выполняем резку металла и дерева под заказ.</p>
        <div className="promo__buttons">
          <Link className="button button--orange" href="/catalog">Перейти в каталог</Link>
          <Link className="button button--outline" href="/request">Заказать расчет</Link>
        </div>
      </div>
      <div className="container benefits">
        {benefits.map((item) => {
          const Icon = item.icon;
          return <div className="benefit" key={item.title}><Icon /><div><b>{item.title}</b><span>{item.text}</span></div></div>;
        })}
      </div>
    </section>
  );
}

function Categories({ settings }: { settings: HomeSettings }) {
  return (
    <section className="section section--compact" id="каталог">
      <div className="container categoryGrid">
        {settings.categories.map((card) => <Link className="category" href={card.href} key={card.key}><Image src={card.image} alt={card.title} fill sizes="(max-width: 900px) 50vw, 20vw" /><span>{card.title}</span><i><ArrowIcon /></i></Link>)}
      </div>
    </section>
  );
}

function Production() {
  return (
    <section className="section production" id="производство">
      <div className="container production__grid">
        <div className="production__text">
          <p className="sectionLabel">Мы производим сами</p>
          <h2>Собственное производство Bullmet</h2>
          <p>Мы не просто продаем готовые изделия — мы создаем их сами. Работаем с металлом и деревом, выполняем резку, сборку, покраску и изготовление изделий по индивидуальным размерам.</p>
          <Link className="button button--orange" href="/production">Подробнее о производстве</Link>
        </div>
        <div className="production__image"><Image src="/assets/production.jpg" alt="Цех Bullmet" fill sizes="50vw" /></div>
        <div className="production__list">
          <Feature icon={ToolsIcon} title="Лазерная и станочная резка" />
          <Feature icon={DraftIcon} title="Работа с металлом и деревом" />
          <Feature icon={FactoryIcon} title="Изготовление под заказ" />
          <Feature icon={ShieldIcon} title="Контроль качества на каждом этапе" />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title }: { icon: typeof FactoryIcon; title: string }) {
  return <div className="feature"><Icon /><span>{title}</span></div>;
}

function ProductsAndServices({ products }: { products: AdminProduct[] }) {
  const visibleProducts = products
    .filter((product) => product.status !== 'draft')
    .filter((product) => product.isPopular || product.inStock !== false)
    .slice(0, 4);

  return (
    <section className="section shopPreview" id="услуги">
      <div className="container shopPreview__grid">
        <div>
          <h3 className="blockTitle">Популярные товары</h3>
          {visibleProducts.length ? (
            <div className="productsGrid">
              {visibleProducts.map((product) => (
                <Link className="product product--link" href={`/catalog/${product.slug}`} key={product.slug}>
                  <div className="product__image"><Image src={product.image} alt={product.title} fill sizes="25vw" style={{ objectFit: product.catalogImageFit ?? 'cover', objectPosition: product.catalogImagePosition ?? 'center center' }} /></div>
                  <div className="product__body"><h4>{product.title}</h4><p>{product.short}</p><div><b>от {product.price} BYN</b><span className="miniCart" aria-label="Перейти к товару"><CartIcon /></span></div></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="frontEmptyProducts"><b>Товаров пока нет</b><p>Добавьте товары в админке — они появятся на главной и в каталоге.</p><Link href="/catalog">Открыть каталог</Link></div>
          )}
        </div>
        <div>
          <h3 className="blockTitle">Услуги резки</h3>
          <div className="servicesGrid">
            {serviceCards.map((s) => <article className="service" key={s.title}><div className="service__image"><Image src={s.image} alt={s.title} fill sizes="25vw" /></div><div className="service__body"><h4>{s.title}</h4><p>{s.text}</p><Link href={s.href}>Заказать расчет</Link></div></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkProcess() {
  return (
    <section className="section section--compact">
      <div className="container">
        <h3 className="blockTitle">Как мы работаем</h3>
        <div className="process">
          {process.map(({ num, title, text, icon: Icon }) => (
            <div className="processItem" key={num}>
              <div className="processItem__icon"><Icon /><small>{num}</small></div>
              <div className="processItem__content"><b>{title}</b><p>{text}</p></div>
              <span className="processItem__arrow"><ArrowIcon /></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section section--compact">
      <div className="container">
        <div className="sectionHead"><h3 className="blockTitle">Производство Bullmet</h3><Link href="/contacts">Смотреть все фото</Link></div>
        <div className="gallery">{gallery.map((img, i) => <div className="gallery__item" key={img}><Image src={`/assets/${img}`} alt={`Работа Bullmet ${i + 1}`} fill sizes="16vw" /></div>)}</div>
      </div>
    </section>
  );
}

function CustomOrder() {
  return (
    <section className="section customOrder" id="order">
      <div className="container customOrder__inner">
        <div>
          <h2>Нужно изделие по вашим размерам?</h2>
          <p>Изготовим часы, качели, металлические элементы, декор или деталь по вашему эскизу, фото, чертежу или идее.</p>
          <Link className="button button--orange" href="/request?type=custom">Обсудить проект</Link>
        </div>
        <Image src="/assets/custom-bg.jpg" alt="Индивидуальный заказ Bullmet" fill sizes="100vw" />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="контакты">
      <div className="container footer__grid">
        <div className="footer__brand"><Logo /><p>Собственное производство изделий из металла и дерева с 2017 года.</p><div className="socials"><Link href="/contacts">IG</Link><Link href="/contacts">TG</Link><Link href="/contacts">WA</Link></div></div>
        <FooterCol title="Каталог" items={[{ label: 'Часы', href: '/catalog?category=Часы собственного производства' }, { label: 'Садовые качели', href: '/catalog?category=Садовые качели' }, { label: 'Изделия из металла', href: '/request?type=metal-cutting' }, { label: 'Изделия из дерева', href: '/request?type=wood-cutting' }]} />
        <FooterCol title="Услуги" items={[{ label: 'Резка металла', href: '/services' }, { label: 'Резка дерева', href: '/services' }, { label: 'Индивидуальные заказы', href: '/request?type=custom' }]} />
        <FooterCol title="Компания" items={[{ label: 'О нас', href: '/about' }, { label: 'Производство', href: '/production' }, { label: 'Доставка и оплата', href: '/delivery' }, { label: 'Контакты', href: '/contacts' }]} />
        <div className="footerCol"><h4>Контакты</h4><p><PhoneIcon /> +375 29 123-45-67</p><p><MailIcon /> info@bullmet.by</p><p><PinIcon /> г. Минск, ул. Промышленная, 11</p><p><ClockIcon /> Пн–Пт: 9:00 — 18:00</p></div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return <div className="footerCol"><h4>{title}</h4>{items.map((item) => <Link href={item.href} key={item.label}>{item.label}</Link>)}</div>;
}

export function HomePage() {
  const [settings, setSettings] = useState<HomeSettings>(defaultHomeSettings);
  const { items: adminProducts } = useAdminProducts();

  useEffect(() => {
    readHomeSettingsAsync().then(setSettings);

    const updateSettings = () => readHomeSettingsAsync().then(setSettings);
    window.addEventListener('bullmet-home-settings-updated', updateSettings);
    window.addEventListener('storage', updateSettings);
    return () => {
      window.removeEventListener('bullmet-home-settings-updated', updateSettings);
      window.removeEventListener('storage', updateSettings);
    };
  }, []);

  return <><Header /><main><Promo settings={settings} /><Categories settings={settings} /><Production /><ProductsAndServices products={adminProducts} /><WorkProcess /><Gallery /><CustomOrder /></main><Footer /></>;
}
