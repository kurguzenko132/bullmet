import Link from 'next/link';
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
import { SectionHeader } from '@/components/layout/SectionHeader';
import { FeatureCard } from '@/components/cards/FeatureCard';
import { HomeCategoryCarousel } from '@/components/HomeCategoryCarousel';
import { getHomepageControlSettings, visibleHomeItems } from '@/lib/homepageControl';
import { getCatalogProducts, getProductReviewStats, withProductReviewStats } from '@/lib/products';
import { getPublishedReviews } from '@/lib/publicReviews';
import { getReviewControlSettings } from '@/lib/reviewControl';
import { getSiteControlSettings } from '@/lib/siteControl';
import { getCatalogControlSettings, visibleCatalogCategories } from '@/lib/catalogControl';

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
  const [home, allProducts, allReviews, site, reviewSettings, catalogControl] = await Promise.all([
    getHomepageControlSettings(),
    getCatalogProducts(),
    getPublishedReviews(),
    getSiteControlSettings(),
    getReviewControlSettings(),
    getCatalogControlSettings()
  ]);

  const selectedProducts = allProducts.slice(0, 6);
  const products = withProductReviewStats(selectedProducts, await getProductReviewStats(selectedProducts.map((product) => product.slug)));

  const featureItems = visibleHomeItems(home.features);
  const categories = visibleCatalogCategories(catalogControl, 'clock').map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    img: category.id === 'clock-auto' && (!category.image || category.image === '/mockup/cat-clock.jpg')
      ? '/assets/category-auto-world.png'
      : category.image || '/mockup/cat-clock.jpg',
    href: `/catalog?category=${encodeURIComponent(category.slug)}`
  }));
  const productionBenefits = visibleHomeItems(home.productionBenefits);
  const productionGallery = visibleHomeItems(home.gallery);
  const steps = visibleHomeItems(home.steps);
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
            <HomeCategoryCarousel categories={categories} />
          </section>
        )}

        {sectionVisible('production', home.productionSection.enabled) && (
          <section className="home-container production-section production-section-final" id="production" style={sectionStyle('production', 5)}>
            <div className="production-text">
              {home.productionSection.eyebrow && <p className="production-section__eyebrow">{home.productionSection.eyebrow}</p>}
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

        {sectionVisible('products', home.productsSection.enabled) && (
          <section className="home-container home-products-section" style={sectionStyle('products', 3)}>
            <SectionHeader title="Популярные модели" description="Самые востребованные часы среди наших покупателей." />
            <HomeProductsClient products={products} reviewSettings={reviewSettings} />
          </section>
        )}

        {sectionVisible('steps', home.stepsSection.enabled) && (
          <section className="home-container work-process" style={sectionStyle('steps', 5)}>
            <h2 className="work-process__title">{home.stepsSection.title}</h2>
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

        <section className="home-container bullmet-advantages" aria-labelledby="bullmet-advantages-title" style={{ order: layoutOrder('gallery', 6) * 10 + 2 }}>
          <div className="bullmet-advantages__intro">
            <p id="bullmet-advantages-title">Почему выбирают Bullmet</p>
            <span>Собственное производство, качественные материалы и внимание к деталям на каждом этапе – надёжные решения для вашего интерьера.</span>
          </div>
          <div className="bullmet-advantages__grid">
            <FeatureCard icon={Factory} title="Собственное производство" text="Изготавливаем часы сами и контролируем качество на каждом этапе." />
            <FeatureCard icon={Palette} title="Выбор размера и цвета" text="Для большинства моделей можно подобрать подходящий размер и цвет исполнения." />
            <FeatureCard icon={PaintBucket} title="Порошковая покраска" text="Стойкое покрытие помогает сохранить внешний вид металлических деталей." />
            <FeatureCard icon={Truck} title="Доставка по Беларуси" text="Согласуем удобный способ получения заказа по Беларуси." />
          </div>
        </section>

        {reviewSettings.homepage && home.reviewsSection.enabled && homeReviews.length > 0 && <div style={{ order: layoutOrder('gallery', 6) * 10 + 4 }}><HomeReviewsClient eyebrow={home.reviewsSection.eyebrow} title={home.reviewsSection.title} reviews={homeReviews} /></div>}

        {home.faqSection.enabled && <div style={{ order: layoutOrder('gallery', 6) * 10 + 6 }}><HomeFaqClient title={home.faqSection.title} text={home.faqSection.text} image={home.faqSection.image} items={visibleHomeItems(home.faqItems).slice(0, 6)} /></div>}

        {sectionVisible('gallery', home.gallerySection.enabled) && !!productionGallery.length && (
          <section className="home-container production-simple production-simple-final" style={{ order: layoutOrder('cta', 7) * 10 - 1 }}>
            <div className="production-simple-head">
              <div><h2>{home.gallerySection.title}</h2></div>
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

        {sectionVisible('cta', home.cta.enabled) && (
          <div style={sectionStyle('cta', 7)}><HomeCustomOptions {...home.cta} benefits={visibleHomeItems(home.cta.benefits)} /></div>
        )}
      </main>
      <Footer />
    </>
  );
}
