import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { HomeProductsClient } from '@/components/HomeProductsClient';
import { HomePromoBanners } from '@/components/HomePromoBanners';
import { getHomepageControlSettings, visibleHomeItems } from '@/lib/homepageControl';
import { getCatalogProducts } from '@/lib/products';

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

function isClockProduct(product: Awaited<ReturnType<typeof getCatalogProducts>>[number]) {
  return [product.title, product.category, product.clockTheme, product.slug]
    .join(' ')
    .toLowerCase()
    .includes('час') || Boolean(product.clockTheme);
}

export default async function HomePage() {
  const [home, allProducts] = await Promise.all([
    getHomepageControlSettings(),
    getCatalogProducts()
  ]);

  const products = (home.productsSection.onlyClocks ? allProducts.filter(isClockProduct) : allProducts)
    .slice(0, Number(home.productsSection.limit || 4));

  const featureItems = visibleHomeItems(home.features);
  const categories = visibleHomeItems(home.directions);
  const productionBenefits = visibleHomeItems(home.productionBenefits);
  const steps = visibleHomeItems(home.steps);
  const workBenefits = visibleHomeItems(home.workBenefits);
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

            <div className="category-grid-exact category-grid-final">
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
                <div className="home-section-title-row">
                  <div>
                    <p className="eyebrow">{home.productsSection.eyebrow}</p>
                    <h2>{home.productsSection.title}</h2>
                  </div>
                  <Link href={home.productsSection.buttonHref}>{home.productsSection.buttonLabel}</Link>
                </div>
                <HomeProductsClient products={products} />
              </div>
              <aside className="services-block services-block-final">
                <div className="services-block-head-final">
                  <p className="eyebrow">услуги</p>
                  <h3>Услуги резки</h3>
                </div>
                <div className="service-row-exact service-row-final">
                  <article>
                    <img src="/mockup/service-metal.jpg" alt="Лазерная резка металла" />
                    <div><h4>Лазерная резка металла</h4><p>Точная обработка листового металла по вашему проекту.</p><Link href="/services#laser">Подробнее</Link></div>
                  </article>
                  <article>
                    <img src="/mockup/service-wood.jpg" alt="Работа с деревом" />
                    <div><h4>Изделия под заказ</h4><p>Подберём размер, материал и оформление для вашей задачи.</p><Link href="/contacts">Оставить заявку</Link></div>
                  </article>
                </div>
              </aside>
            </div>
          </section>
        )}

        {home.stepsSection.enabled && !!steps.length && (
          <section className="home-container steps-section steps-section-v2 steps-section-final">
            <div className="steps-head-v2">
              <p>{home.stepsSection.eyebrow}</p>
              <h3>{home.stepsSection.title}</h3>
              <span>{cleanPublicText(home.stepsSection.text)}</span>
            </div>

            <div className="steps-grid steps-grid-v2 steps-grid-final">
              {steps.map((step, index) => (
                <article key={step.id}>
                  <span className="step-num">{step.num}</span>
                  <div className="step-icon-circle"><Icon name={step.icon as any} className="step-icon" /></div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                  {index < steps.length - 1 && <span className="step-arrow-v2" aria-hidden="true">›</span>}
                </article>
              ))}
            </div>

            {!!workBenefits.length && (
              <div className="work-benefits-v2 work-benefits-final">
                {workBenefits.map((item) => (
                  <article key={item.id}>
                    <Icon name={item.icon as any} />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {home.gallerySection.enabled && !!productionGallery.length && (
          <section className="home-container production-simple production-simple-final">
            <div className="production-simple-head">
              <div>
                <p className="eyebrow">{home.gallerySection.eyebrow}</p>
                <h3>{home.gallerySection.title}</h3>
              </div>
              {home.gallerySection.buttonHref !== '/about' && home.gallerySection.buttonLabel !== 'О компании' ? (
                <Link href={home.gallerySection.buttonHref} className="production-simple-link">{home.gallerySection.buttonLabel}</Link>
              ) : (
                <Link href="/production" className="production-simple-link">Производство</Link>
              )}
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
