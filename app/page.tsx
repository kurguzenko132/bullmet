import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { HomeProductsClient } from '@/components/HomeProductsClient';
import { getCatalogProducts } from '@/lib/products';

const img = {
  hero: '/mockup/hero-right.jpg',
  clock: '/mockup/cat-clock.jpg',
  swing: '/mockup/cat-swing.jpg',
  metal: '/mockup/cat-metal.jpg',
  wood: '/mockup/cat-wood.jpg',
  custom: '/mockup/cat-custom.jpg',
  workshop: '/mockup/prod-workshop.jpg',
  serviceMetal: '/mockup/service-metal.jpg',
  serviceWood: '/mockup/service-wood.jpg',
  gallery1: '/mockup/gallery-1.jpg',
  gallery2: '/mockup/gallery-2.jpg',
  gallery3: '/mockup/gallery-3.jpg',
  gallery4: '/mockup/gallery-4.jpg',
  gallery5: '/mockup/gallery-5.jpg',
  gallery6: '/mockup/gallery-6.jpg',
  cta: '/mockup/cta-right.jpg'
};

const featureItems = [
  { icon: 'factory' as const, text: 'Собственное\nпроизводство' },
  { icon: 'clock' as const, text: 'Настенные\nчасы' },
  { icon: 'materials' as const, text: 'Металл\nс элементами дерева' },
  { icon: 'truck' as const, text: 'Доставка по\nБеларуси' }
];

const categories = [
  { title: 'Настенные\nчасы', img: img.clock, href: '/catalog?category=Настенные часы' },
  { title: 'Садовая\nмебель', img: img.swing, href: '/catalog?category=Садовая мебель' },
  { title: 'Мебель для дома\nв стиле лофт', img: img.custom, href: '/catalog?category=Мебель для дома в стиле лофт' },
  { title: 'Лазерная\nрезка', img: img.metal, href: '/services#laser' },
  { title: 'Мелкий опт\nметаллопроката', img: img.wood, href: '/services#metal' },
  { title: 'Гибка\nметалла', img: img.serviceMetal, href: '/services#bending' }
];

const productionBenefits = [
  { icon: 'clock' as const, title: 'Настенные часы\nсобственного изготовления' },
  { icon: 'materials' as const, title: 'Металл\nс элементами дерева' },
  { icon: 'tools' as const, title: 'Подбор размера\nи оформления' },
  { icon: 'shield' as const, title: 'Контроль качества\nперед выдачей' }
];

const steps = [
  { icon: 'search' as const, num: '01', title: 'Выбор часов', desc: 'Вы выбираете модель в каталоге или пишете нам, если нужен другой размер или цвет' },
  { icon: 'request' as const, num: '02', title: 'Уточнение деталей', desc: 'Мы подтверждаем наличие, стоимость, сроки изготовления и способ получения' },
  { icon: 'hammer' as const, num: '03', title: 'Изготовление', desc: 'Готовим часы на собственном производстве и контролируем качество изделия' },
  { icon: 'package' as const, num: '04', title: 'Передача заказа', desc: 'Передаём заказ самовывозом или согласуем доставку по Беларуси' }
];

const workBenefits = [
  { icon: 'shield' as const, title: 'Гарантия качества', desc: 'Проверяем часы перед передачей клиенту' },
  { icon: 'clock' as const, title: 'Согласуем сроки', desc: 'Заранее сообщаем дату готовности заказа' },
  { icon: 'factory' as const, title: 'Свое производство', desc: 'Делаем изделия сами, без лишних посредников' },
  { icon: 'truck' as const, title: 'Доставка по Беларуси', desc: 'Согласуем удобный способ получения' }
];

const productionGallery = [
  { src: img.gallery4, title: 'Готовые часы', note: 'Настенные часы из металла с элементами дерева' },
  { src: img.gallery1, title: 'Работа с деталями', note: 'Подготовка металлических элементов на производстве' },
  { src: img.gallery3, title: 'Производство', note: 'Собственное производство Bullmet в Беларуси' },
  { src: img.gallery5, title: 'Контроль качества', note: 'Проверяем внешний вид и сборку перед передачей' }
];

function Lines({ value }: { value: string }) {
  return <>{value.split('\n').map((line) => <span key={line}>{line}</span>)}</>;
}

export default async function HomePage() {
  const products = (await getCatalogProducts()).filter((product) => [product.title, product.category, product.clockTheme, product.slug].join(' ').toLowerCase().includes('час') || Boolean(product.clockTheme)).slice(0, 4);
  return (
    <>
      <Header />
      <main className="exact-home home-final-page">
        <section className="hero-exact home-final-hero">
          <img src={img.hero} alt="Станок режет металл" className="hero-photo" />
          <div className="hero-fade" />
          <div className="home-container hero-inner">
            <div className="hero-copy">
              <span className="home-hero-kicker">Производство металлоизделий Bullmet</span>
              <h1>Изделия из металла с элементами дерева</h1>
              <p>ИЗГОТАВЛИВАЕМ: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.</p>
              <div className="hero-actions">
                <Link href="/catalog" className="btn-orange">Перейти в каталог</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="home-container features-row home-trust-row">
          {featureItems.map((item) => (
            <div className="feature-item" key={item.text}>
              <Icon name={item.icon} />
              <p><Lines value={item.text} /></p>
            </div>
          ))}
        </section>

        <section className="home-container home-categories-final">
          <div className="home-section-title-row">
            <div>
              <p className="eyebrow">главные переходы</p>
              <h2>Направления Bullmet</h2>
              <span>Выберите нужное направление: от настенных часов до резки, гибки и металлопроката.</span>
            </div>
            <Link href="/catalog">Смотреть каталог</Link>
          </div>

          <div className="category-grid-exact category-grid-final">
            {categories.map((item) => (
              <Link href={item.href} className="category-tile" key={item.title}>
                <img src={item.img} alt={item.title.replace(/\n/g, ' ')} />
                <span className="tile-title"><Lines value={item.title} /></span>
                <span className="tile-arrow"><Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-container home-shop-final">
          <div className="home-section-title-row">
            <div>
              <p className="eyebrow">популярные модели</p>
              <h2>Популярные часы</h2>
              <span>Модели, с которых удобно начать знакомство с Bullmet.</span>
            </div>
            <Link href="/catalog">Все часы</Link>
          </div>

          <div className="products-services products-services-final products-services-final--clocks">
            <div className="popular-block">
              <HomeProductsClient products={products} />
            </div>
          </div>
        </section>

        <section className="home-container production-section production-section-final" id="production">
          <div className="production-text">
            <p className="eyebrow">производство металлоизделий</p>
            <h2>Собственное производство Bullmet</h2>
            <p className="body-text">ИЗГОТАВЛИВАЕМ: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.</p>
            <Link href="/production" className="small-orange">О производстве</Link>
          </div>
          <div className="production-image"><img src={img.workshop} alt="Производство Bullmet" /></div>
          <div className="production-list">
            {productionBenefits.map((item) => (
              <div key={item.title}><Icon name={item.icon} /><p><Lines value={item.title} /></p></div>
            ))}
          </div>
        </section>

        <section className="home-container steps-section steps-section-v2 steps-section-final">
          <div className="steps-head-v2">
            <p>Как мы работаем</p>
            <h3>Как заказать часы Bullmet</h3>
            <span>Простой путь: выбрали модель, уточнили детали, получили готовые часы.</span>
          </div>

          <div className="steps-grid steps-grid-v2 steps-grid-final">
            {steps.map((step, index) => (
              <article key={step.num}>
                <span className="step-num">{step.num}</span>
                <div className="step-icon-circle"><Icon name={step.icon} className="step-icon" /></div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                {index < steps.length - 1 && <span className="step-arrow-v2" aria-hidden="true">›</span>}
              </article>
            ))}
          </div>

          <div className="work-benefits-v2 work-benefits-final">
            {workBenefits.map((item) => (
              <article key={item.title}>
                <Icon name={item.icon} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-container production-simple production-simple-final">
          <div className="production-simple-head">
            <div>
              <p className="eyebrow">производство и детали</p>
              <h3>Как выглядят изделия Bullmet</h3>
            </div>
            <Link href="/about" className="production-simple-link">О компании</Link>
          </div>

          <div className="production-simple-grid">
            {productionGallery.slice(0, 4).map((item) => (
              <article className="production-simple-card" key={item.src}>
                <img src={item.src} alt={item.title} />
                <div className="production-simple-card-copy">
                  <h4>{item.title}</h4>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-container home-final-cta">
          <div>
            <p className="eyebrow">готовы выбрать часы?</p>
            <h2>Откройте каталог настенных часов</h2>
            <span>Выберите модель, добавьте товар в корзину или свяжитесь с нами для уточнения деталей.</span>
          </div>
          <div className="home-final-cta-actions">
            <Link href="/catalog" className="btn-orange">Перейти в каталог</Link>
            <Link href="/contacts" className="btn-outline">Связаться</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
