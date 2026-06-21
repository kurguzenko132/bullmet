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
  { icon: 'custom' as const, text: 'Индивидуальные\nзаказы' },
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
  { icon: 'spark' as const, title: 'Лазерная и станочная\nрезка' },
  { icon: 'materials' as const, title: 'Работа с металлом\nи элементами дерева' },
  { icon: 'tools' as const, title: 'Изготовление\nпод заказ' },
  { icon: 'shield' as const, title: 'Контроль качества\nна каждом этапе' }
];

const steps = [
  { icon: 'request' as const, num: '01', title: 'Заявка', desc: 'Вы оставляете заявку на сайте или связываетесь с нами удобным способом' },
  { icon: 'calculator' as const, num: '02', title: 'Расчёт', desc: 'Мы рассчитываем стоимость, сроки и предлагаем подходящий вариант' },
  { icon: 'ruler' as const, num: '03', title: 'Проектирование', desc: 'При необходимости готовим чертёж и согласовываем все детали' },
  { icon: 'hammer' as const, num: '04', title: 'Производство', desc: 'Запускаем изделие в работу на собственном производстве Bullmet' },
  { icon: 'package' as const, num: '05', title: 'Передача заказа', desc: 'Передаём готовое изделие, организуем самовывоз или доставку' }
];

const workBenefits = [
  { icon: 'shield' as const, title: 'Гарантия качества', desc: 'Контролируем каждый этап производства' },
  { icon: 'clock' as const, title: 'Соблюдаем сроки', desc: 'Заранее согласовываем дату готовности' },
  { icon: 'factory' as const, title: 'Опыт и производство', desc: 'Делаем изделия сами, без лишних посредников' },
  { icon: 'truck' as const, title: 'Доставка по Беларуси', desc: 'Аккуратно передаём заказ в нужный регион' }
];


const productionGallery = [
  { src: img.gallery1, title: 'Лазерная резка', note: 'Ровный и аккуратный рез листового металла' },
  { src: img.gallery2, title: 'Сварка и сборка', note: 'Подготавливаем и собираем конструкцию под задачу' },
  { src: img.gallery3, title: 'Работа оборудования', note: 'Используем современное оборудование на производстве' },
  { src: img.gallery4, title: 'Готовые изделия', note: 'Показываем реальные изделия и элементы отделки' },
  { src: img.gallery5, title: 'Контроль деталей', note: 'Проверяем качество и точность перед выдачей' }
];

function Lines({ value }: { value: string }) {
  return <>{value.split('\n').map((line) => <span key={line}>{line}</span>)}</>;
}

export default async function HomePage() {
  const products = (await getCatalogProducts()).slice(0, 4);
  return (
    <>
      <Header />
      <main className="exact-home home-final-page">
        <section className="hero-exact home-final-hero">
          <img src={img.hero} alt="Станок режет металл" className="hero-photo" />
          <div className="hero-fade" />
          <div className="home-container hero-inner">
            <div className="hero-copy">
              <span className="home-hero-kicker">Собственное производство Bullmet</span>
              <h1>Изделия из металла с элементами дерева</h1>
              <p>Настенные часы, садовая мебель, качели, мебель в стиле лофт и услуги лазерной резки — изготавливаем под заказ и продаём готовые изделия.</p>
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
              <p className="eyebrow">выберите направление</p>
              <h2>Каталог и услуги Bullmet</h2>
              <span>Готовые изделия, мебель и производственные услуги в одном месте.</span>
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
              <p className="eyebrow">покупают чаще всего</p>
              <h2>Популярные товары</h2>
              <span>Подборка изделий, которые проще всего выбрать и заказать сразу.</span>
            </div>
            <Link href="/catalog">Все товары</Link>
          </div>

          <div className="products-services products-services-final">
            <div className="popular-block">
              <HomeProductsClient products={products} />
            </div>

            <div className="services-block services-block-final">
              <div className="services-block-head-final">
                <p className="eyebrow">производственные услуги</p>
                <h3>Резка и гибка металла</h3>
                <span>Подойдёт для декора, панелей, вывесок, мебельных деталей и индивидуальных проектов.</span>
              </div>
              <div className="service-row-exact service-row-final">
                <article>
                  <img src={img.serviceMetal} alt="Лазерная резка" />
                  <div><h4>Лазерная резка</h4><p>Аккуратная резка листового металла для декора, вывесок, панелей и деталей</p><Link href="/services">Подробнее</Link></div>
                </article>
                <article>
                  <img src={img.serviceWood} alt="Гибка металла" />
                  <div><h4>Гибка металла</h4><p>Гибка листового металла для мебельных каркасов, навесов и малых форм</p><Link href="/services">Подробнее</Link></div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="home-container production-section production-section-final" id="production">
          <div className="production-text">
            <p className="eyebrow">мы изготавливаем сами</p>
            <h2>Собственное производство</h2>
            <p className="body-text">Изготавливаем изделия на собственном производстве: работаем с металлом, деревом, декоративными элементами и готовим изделия под конкретную задачу.</p>
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
            <h3>Понятный путь от идеи до готового изделия</h3>
            <span>Мы заранее согласуем стоимость, сроки, материалы и детали заказа.</span>
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
              <p className="eyebrow">детали и готовые изделия</p>
              <h3>Производство Bullmet</h3>
            </div>
            <Link href="/about" className="production-simple-link">Больше о компании</Link>
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
            <p className="eyebrow">готовы выбрать изделие?</p>
            <h2>Посмотрите каталог Bullmet</h2>
            <span>Выберите готовый товар или свяжитесь с нами, если нужен индивидуальный размер, цвет или проект.</span>
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
