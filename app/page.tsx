import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { Factory, PaintBucket, Palette, Truck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { HomeProductsClient } from '@/components/HomeProductsClient';
import { HomePromoBanners } from '@/components/HomePromoBanners';
import { HomeReviewsClient, type HomeReview } from '@/components/HomeReviewsClient';
import { HomeFaqClient } from '@/components/HomeFaqClient';
import { HomeCustomOptions } from '@/components/HomeCustomOptions';
import { getHomepageControlSettings, visibleHomeItems } from '@/lib/homepageControl';
import { getCatalogProducts, getProductReviewStats, isPublicCatalogProduct, withProductReviewStats } from '@/lib/products';
import { getPublishedReviews } from '@/lib/publicReviews';
import { getReviewControlSettings } from '@/lib/reviewControl';
import { getSiteControlSettings, isClocksOnly } from '@/lib/siteControl';
import { getCatalogControlSettings, isProductCategoryPublic } from '@/lib/catalogControl';
import { getServicesControlSettings, visibleServicesItems } from '@/lib/servicesControl';

export const dynamic = 'force-dynamic';

function ProcessArrow() {
  return (
    <span className="process-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 40"><path d="M4 3 20 20 4 37" /></svg>
    </span>
  );
}

function Lines({ value }: { value: string }) {
  return <>{value.split('\n').map((line) => <span key={line}>{line}</span>)}</>;
}

export async function generateMetadata(): Promise<Metadata> {
  const [home, site] = await Promise.all([getHomepageControlSettings(), getSiteControlSettings()]);
  return {
    title: home.seo.title,
    description: home.seo.description,
    alternates: { canonical: home.seo.canonical },
    robots: { index: site.seo.robotsIndex && home.seo.robotsIndex, follow: site.seo.robotsIndex && home.seo.robotsIndex },
    openGraph: {
      title: home.seo.ogTitle || home.seo.title,
      description: home.seo.ogDescription || home.seo.description,
      images: home.seo.ogImage ? [{ url: home.seo.ogImage }] : []
    }
  };
}

export default async function HomePage() {
  const [home, allProducts, allReviews, site, catalog, reviewSettings, servicesControl] = await Promise.all([
    getHomepageControlSettings(),
    getCatalogProducts(),
    getPublishedReviews(),
    getSiteControlSettings(),
    getCatalogControlSettings(),
    getReviewControlSettings(),
    getServicesControlSettings()
  ]);

  const clocksOnly = isClocksOnly(site) || home.productsSection.onlyClocks;
  const popularProducts = allProducts.filter((product) => product.isPopular && isPublicCatalogProduct(product, {
    clocksOnly,
    categoryPublic: isProductCategoryPublic(catalog, product)
  }));
  const selectedProducts = popularProducts.slice(0, Math.min(8, Math.max(1, home.productsSection.limit || 3)));
  const products = withProductReviewStats(selectedProducts, await getProductReviewStats(selectedProducts.map((product) => product.slug)));

  const featureItems = visibleHomeItems(home.features);
  const categories = visibleHomeItems(home.directions).filter((item) => item.id !== 'bending' && (!isClocksOnly(site) || item.id === 'clocks'));
  const collections = visibleHomeItems(home.collections);
  const productionBenefits = visibleHomeItems(home.productionBenefits);
  const productionGallery = visibleHomeItems(home.gallery);
  const steps = visibleHomeItems(home.steps);
  const homeServices = visibleServicesItems(servicesControl.services).filter((service) => service.showOnHomepage).slice(0, 2);
  const featuredReviews = allReviews.some((review) => review.show_on_homepage) ? allReviews.filter((review) => review.show_on_homepage) : allReviews;
  const homeReviews = (home.reviewsSection.mode === 'manual'
    ? home.reviewsSection.selectedIds.map((id) => allReviews.find((review) => review.id === id)).filter(Boolean)
    : [...featuredReviews].sort((a, b) => {
      const photoDifference = Number(Boolean(b.photo_urls?.length)) - Number(Boolean(a.photo_urls?.length));
      if (photoDifference) return photoDifference;
      const ratingDifference = Number(b.rating || 0) - Number(a.rating || 0);
      if (ratingDifference) return ratingDifference;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }))
    .slice(0, Math.min(3, Math.max(1, home.reviewsSection.limit || 3))) as HomeReview[];
  const heroSlides = visibleHomeItems(home.heroSlides);
  const sectionVisible = (id: string, enabled: boolean) => (home.layout.find((item) => item.id === id)?.visible ?? true) && enabled;
  const layoutOrder = (id: string, fallback: number) => {
    const configuredOrder = home.layout.find((item) => item.id === id)?.order;
    return typeof configuredOrder === 'number' && Number.isFinite(configuredOrder)
      ? configuredOrder
      : fallback;
  };
  // CSS `order` accepts only integers. Keep slots between CMS sections for
  // supplementary public blocks (banners, collections, FAQ) without turning
  // their order into an invalid fractional CSS value.
  const sectionStyle = (id: string, fallback: number) => ({ order: layoutOrder(id, fallback) * 10 });

  return (
    <>
      <Header />
      <main className="exact-home home-final-page home-layout-order">
        {sectionVisible('hero', home.hero.enabled) && <HomeHeroCarousel slides={heroSlides} features={featureItems} autoplay={home.settings.heroAutoplay} interval={home.settings.heroInterval} showDots={home.settings.showDots} showArrows={home.settings.showArrows} lazyImages={home.settings.lazyImages} style={sectionStyle('hero', 1)} />}

        <div className="home-layout-banner-slot" style={{ order: layoutOrder('hero', 1) * 10 + 1 }}><HomePromoBanners placement="home_top" /></div>

        {sectionVisible('directions', home.directionsSection.enabled) && !!categories.length && (
          <section className="home-container home-categories-final" style={sectionStyle('directions', 2)}>
            <div className="home-section-title-row">
              <div>
                <p className="eyebrow">{home.directionsSection.eyebrow}</p>
                <h2>{home.directionsSection.title}</h2>
                <span>{home.directionsSection.text}</span>
              </div>
              <Link href={home.directionsSection.buttonHref}>{home.directionsSection.buttonLabel}</Link>
            </div>

            <div className="category-grid-exact category-grid-final" style={{ '--directions-count': categories.length } as CSSProperties}>
              {categories.map((item) => (
                <Link href={item.href} className="category-tile" key={item.id}>
                  <img src={item.img} alt={item.title.replace(/\n/g, ' ')} />
                  <span className="tile-title"><Lines value={item.title} /></span>
                  <span className="tile-arrow"><Icon name="arrow" /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sectionVisible('production', home.productionSection.enabled) && (
          <section className="home-container production-section production-section-final" id="production" style={sectionStyle('production', 3)}>
            <div className="production-text">
              <p className="eyebrow">{home.productionSection.eyebrow}</p>
              <h2>{home.productionSection.title}</h2>
              <p className="body-text">{home.productionSection.text}</p>
              <Link href={home.productionSection.buttonHref} className="small-orange">{home.productionSection.buttonLabel}</Link>
            </div>
            <div className="production-image"><img src={home.productionSection.image} alt={home.productionSection.title} /></div>
            <div className="production-list">
              {productionBenefits.map((item) => (
                <div key={item.id}><Icon name={item.icon as any} /><p><Lines value={item.text} /></p></div>
              ))}
            </div>
          </section>
        )}

        {sectionVisible('products', home.productsSection.enabled) && products.length > 0 && (
          <section className="home-container home-shop-final" style={sectionStyle('products', 4)}>
            <div className="products-services products-services-final">
              <div className="popular-block">
                <h2 className="products-services-title">{home.productsSection.title}</h2>
                <HomeProductsClient products={products} reviewSettings={reviewSettings} />
              </div>
              {homeServices.length > 0 && <aside className="services-block services-block-final">
                <h2 className="products-services-title">Услуги Bullmet</h2>
                <div className="service-row-exact service-row-final">
                  {homeServices.map((service) => <article key={service.id}>
                    <img src={service.image} alt={service.title} />
                    <div><h4>{service.title}</h4><p>{service.subtitle}</p><Link href={`/services/${service.slug}`}>Подробнее</Link></div>
                  </article>)}
                </div>
              </aside>}
            </div>
          </section>
        )}

        {home.collectionsSection.enabled && collections.length > 0 && (
          <section className="home-container home-collections" aria-labelledby="home-collections-title" style={{ order: layoutOrder('steps', 5) * 10 - 2 }}>
            <header className="home-collections__head">
              <div><p>{home.collectionsSection.eyebrow}</p><h2 id="home-collections-title">{home.collectionsSection.title}</h2></div>
              <Link href={home.collectionsSection.buttonHref}>{home.collectionsSection.buttonLabel} <span>→</span></Link>
            </header>
            <div className="home-collections__grid">
              {collections.map((item) => <Link className="home-collection-card" href={item.href} key={item.id}>
                <img src={item.img} alt={item.title} />
                <span className="home-collection-card__shade" aria-hidden="true" />
                <span className="home-collection-card__copy"><b>{item.title}</b><small><Lines value={item.description} /></small></span>
                <span className="home-collection-card__arrow" aria-hidden="true">→</span>
              </Link>)}
            </div>
          </section>
        )}

        {sectionVisible('steps', home.stepsSection.enabled) && (
          <section className="home-container work-process" style={sectionStyle('steps', 5)}>
            <p className="eyebrow">{home.stepsSection.eyebrow}</p><h2 className="work-process__title">{home.stepsSection.title}</h2>
            {home.stepsSection.text && <p className="body-text">{home.stepsSection.text}</p>}
            <div className="work-process__panel">
              <div className="work-process__steps">
                {steps.map((step, index) => (
                  <div className="work-process__item" key={step.id}>
                    <article className="process-step">
                      <div className="process-step__visual">
                        <Icon name={step.icon} className="process-step__icon" />
                        <span className="process-step__number">{step.num}</span>
                      </div>
                      <div className="process-step__copy">
                        <h3 className="process-step__title">{step.title}</h3>
                        <p className="process-step__description">{step.desc}</p>
                      </div>
                    </article>
                    {index < steps.length - 1 && <ProcessArrow />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {sectionVisible('gallery', home.gallerySection.enabled) && !!productionGallery.length && (
          <section className="home-container production-simple production-simple-final" style={sectionStyle('gallery', 6)}>
            <div className="production-simple-head">
              <div><p className="eyebrow">{home.gallerySection.eyebrow}</p><h2>{home.gallerySection.title}</h2></div>
              <Link href={home.gallerySection.buttonHref} className="production-simple-link">{home.gallerySection.buttonLabel}</Link>
            </div>

            <div className="production-simple-grid">
              {productionGallery.slice(0, 6).map((item) => (
                <article className="production-simple-card" key={item.id}>
                  <img src={item.src} alt={item.title} />
                  <div className="production-simple-card-copy">
                    <h4>{item.title}</h4>
                    <p>{item.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="home-container bullmet-advantages" aria-labelledby="bullmet-advantages-title" style={{ order: layoutOrder('gallery', 6) * 10 + 2 }}>
          <div className="bullmet-advantages__intro">
            <p>Почему выбирают Bullmet</p>
            <h2 id="bullmet-advantages-title">Надёжные решения для вашего интерьера</h2>
            <span>Собственное производство, качественные материалы и внимание к деталям на каждом этапе.</span>
          </div>
          <div className="bullmet-advantages__grid">
            <article>
              <div className="bullmet-advantages__icon"><Factory aria-hidden="true" /></div>
              <h3>Собственное производство</h3>
              <p>Изготавливаем часы сами и контролируем качество на каждом этапе.</p>
            </article>
            <article>
              <div className="bullmet-advantages__icon"><Palette aria-hidden="true" /></div>
              <h3>Выбор размера и цвета</h3>
              <p>Для большинства моделей можно подобрать подходящий размер и цвет исполнения.</p>
            </article>
            <article>
              <div className="bullmet-advantages__icon"><PaintBucket aria-hidden="true" /></div>
              <h3>Порошковая покраска</h3>
              <p>Стойкое покрытие помогает сохранить внешний вид металлических деталей.</p>
            </article>
            <article>
              <div className="bullmet-advantages__icon"><Truck aria-hidden="true" /></div>
              <h3>Доставка по Беларуси</h3>
              <p>Согласуем удобный способ получения заказа по Беларуси.</p>
            </article>
          </div>
        </section>

        {reviewSettings.homepage && home.reviewsSection.enabled && homeReviews.length > 0 && <div style={{ order: layoutOrder('gallery', 6) * 10 + 4 }}><HomeReviewsClient eyebrow={home.reviewsSection.eyebrow} title={home.reviewsSection.title} reviews={homeReviews} /></div>}

        {home.faqSection.enabled && <div style={{ order: layoutOrder('gallery', 6) * 10 + 6 }}><HomeFaqClient eyebrow={home.faqSection.eyebrow} title={home.faqSection.title} text={home.faqSection.text} image={home.faqSection.image} items={visibleHomeItems(home.faqItems).slice(0, 6)} /></div>}
        {sectionVisible('cta', home.cta.enabled) && (
          <div style={sectionStyle('cta', 7)}><HomeCustomOptions {...home.cta} benefits={visibleHomeItems(home.cta.benefits)} /></div>
        )}
      </main>
      <Footer />
    </>
  );
}
