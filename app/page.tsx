import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { HomeProductsClient } from '@/components/HomeProductsClient';
import { HomePromoBanners } from '@/components/HomePromoBanners';
import { getHomepageControlSettings, visibleHomeItems } from '@/lib/homepageControl';
import { getCatalogProducts } from '@/lib/products';

const workProcessSteps = [
  { id: 'request', icon: 'request', num: '01', title: 'Вы оставляете заявку', desc: 'Через форму на сайте или по телефону' },
  { id: 'details', icon: 'ruler', num: '02', title: 'Мы уточняем детали', desc: 'Размеры, материал, пожелания' },
  { id: 'calculation', icon: 'calculator', num: '03', title: 'Рассчитываем стоимость', desc: 'Согласовываем цену и сроки' },
  { id: 'manufacturing', icon: 'hammer', num: '04', title: 'Изготавливаем изделие', desc: 'Контроль качества на каждом этапе' },
  { id: 'delivery', icon: 'package', num: '05', title: 'Передаём или доставляем заказ', desc: 'Самовывоз или доставка по Беларуси' }
] as const;

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

function cleanPublicText(value: string) {
  return String(value || '')
    .replace('Публичные направления можно включать в админке по мере готовности.', '')
    .replace('Основной запуск — настенные часы. Остальные направления подготовлены и будут включаться по мере готовности.', 'Основной акцент — настенные часы. Другие направления представлены как возможности производства Bullmet.')
    .replace('ИЗГОТАВЛИВАЕМ: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.', 'Настенные часы из металла с элементами дерева собственного производства Bullmet.')
    .replace('Выберите нужное направление: от настенных часов до резки, гибки и металлопроката.', 'Сейчас клиентам открыт каталог настенных часов Bullmet.')
    .replace('Клиент выбирает модель, мы уточняем детали и передаём готовые часы удобным способом.', '')
    .trim();
}

export default async function HomePage() {
  const [home, allProducts] = await Promise.all([
    getHomepageControlSettings(),
    getCatalogProducts()
  ]);

  const products = allProducts.slice(0, 4);

  const featureItems = visibleHomeItems(home.features);
  const categories = visibleHomeItems(home.directions).filter((item) => item.id !== 'bending');
  const productionBenefits = visibleHomeItems(home.productionBenefits);
  const productionGallery = visibleHomeItems(home.gallery);
  const heroTitle = `BULLMET — ${home.hero.title.replace(/^bullmet\s*[—-]\s*/i, '')}`;
  const heroDescription = 'Изготавливаем: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.';

  return (
    <>
      <Header />
      <main className="exact-home home-final-page">
        {home.hero.enabled && (
          <section className="hero-exact home-final-hero">
            <picture className="hero-background" aria-hidden="true">
              <img src="/assets/hero-bullmet.png" alt="" className="hero-photo" />
            </picture>
            <div className="hero-fade" />
            <div className="home-container hero-inner">
              <div className="hero-copy">
                <span className="home-hero-kicker">{home.hero.kicker}</span>
                <h1>{heroTitle}</h1>
                <p>{heroDescription}</p>
                <div className="hero-actions">
                  <Link href={home.hero.primaryHref} className="btn-orange">{home.hero.primaryLabel}</Link>
                </div>
              </div>
              {!!featureItems.length && (
                <div className="hero-features" aria-label="Преимущества Bullmet">
                  {featureItems.map((item) => (
                    <div className="feature-item" key={item.id}>
                      <Icon name={item.icon as any} />
                      <p><Lines value={item.text} /></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <HomePromoBanners placement="home_top" />

        {home.directionsSection.enabled && !!categories.length && (
          <section className="home-container home-categories-final">
            <div className="home-section-title-row">
              <div>
                <p className="eyebrow">{home.directionsSection.eyebrow}</p>
                <h2>{home.directionsSection.title}</h2>
                <span>{cleanPublicText(home.directionsSection.text)}</span>
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

        {home.productionSection.enabled && (
          <section className="home-container production-section production-section-final" id="production">
            <div className="production-text">
              <p className="eyebrow">{home.productionSection.eyebrow}</p>
              <h2>{home.productionSection.title}</h2>
              <p className="body-text">{cleanPublicText(home.productionSection.text)}</p>
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

        {home.productsSection.enabled && (
          <section className="home-container home-shop-final">
            <div className="products-services products-services-final">
              <div className="popular-block">
                <h2 className="products-services-title">Популярные товары</h2>
                <HomeProductsClient products={products} />
              </div>
              <aside className="services-block services-block-final">
                <h2 className="products-services-title">Услуги резки</h2>
                <div className="service-row-exact service-row-final">
                  <article>
                    <img src="/mockup/service-metal.jpg" alt="Резка металла" />
                    <div><h4>Резка металла</h4><p>Для декора, деталей, табличек, конструкций и других изделий.</p><Link href="/contacts">Заказать расчёт</Link></div>
                  </article>
                  <article>
                    <img src="/mockup/service-wood.jpg" alt="Резка дерева" />
                    <div><h4>Резка дерева</h4><p>Для интерьерных элементов, вывесок, подарков, мебели и других изделий.</p><Link href="/contacts">Заказать расчёт</Link></div>
                  </article>
                </div>
              </aside>
            </div>
          </section>
        )}

        {home.stepsSection.enabled && (
          <section className="home-container work-process">
            <h2 className="work-process__title">Как мы работаем</h2>
            <div className="work-process__panel">
              <div className="work-process__steps">
                {workProcessSteps.map((step, index) => (
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
                    {index < workProcessSteps.length - 1 && <ProcessArrow />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {home.gallerySection.enabled && !!productionGallery.length && (
          <section className="home-container production-simple production-simple-final">
            <div className="production-simple-head">
              <h2>Производство Bullmet</h2>
              <Link href="/production" className="production-simple-link">Смотреть все фото</Link>
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

        {home.cta.enabled && (
          <section className="home-container home-final-cta">
            <div>
              <p className="eyebrow">{home.cta.eyebrow}</p>
              <h2>{home.cta.title}</h2>
              <span>{cleanPublicText(home.cta.text)}</span>
            </div>
            <div className="home-final-cta-actions">
              <Link href={home.cta.primaryHref} className="btn-orange">{home.cta.primaryLabel}</Link>
              <Link href={home.cta.secondaryHref} className="btn-outline">{home.cta.secondaryLabel}</Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
