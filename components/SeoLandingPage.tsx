'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Header, Footer } from './HomePage';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { QuickOrderButton } from './QuickOrderButton';
import { ArrowIcon, DraftIcon, FactoryIcon, SearchIcon, ShieldIcon, ToolsIcon, TruckIcon } from './Icons';
import { expandProductVariants } from './shopData';
import { useAdminProducts } from './useAdminProducts';
import { getImageSettings } from '../lib/imageDisplay';
import type { SeoLandingConfig } from './seoLandingData';

function normalize(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е');
}

function faqJsonLd(config: SeoLandingConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function breadcrumbJsonLd(config: SeoLandingConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: '/' },
      { '@type': 'ListItem', position: 2, name: config.title, item: `/${config.slug}` },
    ],
  };
}

const process = [
  { icon: DraftIcon, title: 'Вы отправляете задачу', text: 'Описание, фото, размеры, эскиз, файл или ссылку на пример.' },
  { icon: SearchIcon, title: 'Уточняем детали', text: 'Материал, размер, цвет, количество, сроки и назначение изделия.' },
  { icon: ToolsIcon, title: 'Готовим расчет', text: 'Предлагаем вариант исполнения и согласовываем стоимость.' },
  { icon: FactoryIcon, title: 'Изготавливаем', text: 'Запускаем работу, обрабатываем детали и собираем изделие.' },
  { icon: ShieldIcon, title: 'Проверяем и передаем', text: 'Контроль качества, упаковка, самовывоз или доставка.' },
];

export function SeoLandingPage({ config }: { config: SeoLandingConfig }) {
  const { items, ready } = useAdminProducts();
  const visibleProducts = useMemo(() => {
    const keywords = config.filters?.keywords?.map(normalize) ?? [];
    return expandProductVariants(items)
      .filter((product) => {
        if (product.status === 'draft') return false;
        if (config.filters?.category && product.category !== config.filters.category) return false;
        if (config.filters?.clockTheme && product.clockTheme !== config.filters.clockTheme) return false;
        if (keywords.length) {
          const haystack = normalize([
            product.title,
            product.category,
            product.clockTheme ?? '',
            product.material,
            product.short,
            product.description,
          ].join(' '));
          return keywords.some((keyword) => haystack.includes(keyword));
        }
        return true;
      })
      .slice(0, 8);
  }, [items, config.filters]);

  return (
    <>
      <Header />
      <main className="seoLandingPage">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(config)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(config)) }} />

        <section className="seoLandingHero">
          <div className="container seoLandingHero__grid">
            <div className="seoLandingHero__content">
              <div className="breadcrumbs seoBreadcrumbs"><Link href="/">Главная</Link><span>/</span><span>{config.title}</span></div>
              <p className="sectionLabel">{config.label}</p>
              <h1>{config.title}</h1>
              <p>{config.lead}</p>
              <div className="seoLandingHero__actions">
                <Link className="button button--orange" href={config.primaryHref ?? '/request'}>Заказать расчет</Link>
                <Link className="button button--outline" href={config.secondaryHref ?? '/catalog'}>Смотреть каталог</Link>
              </div>
            </div>
            <div className="seoLandingHero__image">
              <Image src={config.image} alt={config.title} fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            </div>
          </div>
        </section>

        <section className="container seoStats" aria-label="Ключевые преимущества">
          {config.stats.map((item) => <article key={item.value + item.label}><b>{item.value}</b><span>{item.label}</span></article>)}
        </section>

        <section className="container seoIntroGrid">
          <article className="seoIntroCard seoIntroCard--large">
            <p className="sectionLabel">О направлении</p>
            <h2>Что делает Bullmet</h2>
            <p>{config.description}</p>
            <Link href="/request">Обсудить задачу <ArrowIcon /></Link>
          </article>
          {config.highlights.map((item) => (
            <article className="seoIntroCard" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="seoDarkBand">
          <div className="container seoDarkBand__grid">
            <div>
              <p className="sectionLabel">Где подходит</p>
              <h2>Для каких задач можно заказать</h2>
              <p>Подберем исполнение под интерьер, назначение, бюджет и визуальный стиль. Можно начать даже с простой идеи или фотографии похожего изделия.</p>
            </div>
            <div className="seoTagGrid">
              {config.useCases.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="container seoProductsSection">
          <div className="sectionHead seoSectionHead">
            <div>
              <p className="sectionLabel">Подборка из каталога</p>
              <h2>Товары по теме</h2>
            </div>
            <Link href="/catalog">Весь каталог</Link>
          </div>
          {ready && visibleProducts.length ? (
            <div className="seoProductGrid">
              {visibleProducts.map((product) => (
                <article className="seoProductCard" key={product.slug}>
                  <Link href={`/catalog/${product.slug}`} className="seoProductCard__image">
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: getImageSettings(product, product.image).catalogFit, objectPosition: getImageSettings(product, product.image).catalogPosition }} />
                  </Link>
                  <div className="seoProductCard__fav"><FavoriteButton product={product} /></div>
                  <div className="seoProductCard__body">
                    <Link href={`/catalog/${product.slug}`}><h3>{product.colorName ? `${product.title} — ${product.colorName}` : product.title}</h3></Link>
                    <p>{product.short}</p>
                    {product.clockTheme && <em>{product.clockTheme}</em>}
                    <div className="seoProductCard__bottom"><b>от {product.price} BYN</b><AddToCartButton product={product} iconOnly /></div>
                    <QuickOrderButton product={product} label="Купить в 1 клик" compact className="catalogQuickOrderBtn" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="seoEmptyProducts">
              <TruckIcon />
              <div>
                <h3>Готовые товары по этой теме появятся после добавления в админке</h3>
                <p>Пока можно отправить заявку на индивидуальное изготовление — мы рассчитаем изделие по фото, эскизу или описанию.</p>
              </div>
              <Link className="button button--orange" href="/request">Оставить заявку</Link>
            </div>
          )}
        </section>

        <section className="container seoTwoColumn">
          <div className="seoMaterials">
            <p className="sectionLabel">Материалы и варианты</p>
            <h2>Что можно согласовать</h2>
            <div className="seoMaterialGrid">
              {config.materials.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="seoProcessCompact">
            <p className="sectionLabel">Процесс</p>
            <h2>Как проходит заказ</h2>
            <div>
              {process.map(({ icon: Icon, title, text }, index) => (
                <article key={title}>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <Icon />
                  <div><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container seoFaqSection">
          <div className="seoFaqIntro">
            <p className="sectionLabel">FAQ</p>
            <h2>Частые вопросы</h2>
            <p>Собрали ответы, которые помогают быстрее понять стоимость, сроки и формат заказа.</p>
          </div>
          <div className="seoFaqList">
            {config.faq.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}
          </div>
        </section>

        <section className="container seoRelatedLinks">
          <div className="sectionHead seoSectionHead"><h2>Похожие направления</h2><Link href="/services">Все услуги</Link></div>
          <div>
            {config.relatedLinks.map((item) => <Link key={item.href} href={item.href}>{item.title}<ArrowIcon /></Link>)}
          </div>
        </section>

        <section className="container seoFinalCta">
          <div>
            <p className="sectionLabel">Расчет заказа</p>
            <h2>Хотите сделать изделие под себя?</h2>
            <p>Отправьте фото, эскиз, размеры или просто опишите идею. Мы уточним детали и подготовим расчет.</p>
          </div>
          <Link className="button button--orange" href="/request">Заказать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
