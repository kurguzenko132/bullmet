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
  const products = (await getCatalogProducts()).slice(0, 3);
  return (
    <>
      <Header />
      <main className="exact-home">
        <section className="hero-exact">
          <img src={img.hero} alt="Станок режет металл" className="hero-photo" />
          <div className="hero-fade" />
          <div className="home-container hero-inner">
            <div className="hero-copy">
              <h1>BULLMET — ИЗДЕЛИЯ ИЗ МЕТАЛЛА С ЭЛЕМЕНТАМИ ДЕРЕВА</h1>
              <p>Изготавливаем садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.</p>
              <div className="hero-actions">
                <Link href="/catalog" className="btn-orange">ПЕРЕЙТИ В КАТАЛОГ</Link>
                <Link href="/services#request" className="btn-outline">ЗАКАЗАТЬ РАСЧЕТ</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="home-container features-row">
          {featureItems.map((item) => (
            <div className="feature-item" key={item.text}>
              <Icon name={item.icon} />
              <p><Lines value={item.text} /></p>
            </div>
          ))}
        </section>

        <section className="home-container category-grid-exact">
          {categories.map((item) => (
            <Link href={item.href} className="category-tile" key={item.title}>
              <img src={item.img} alt={item.title.replace(/\n/g, ' ')} />
              <span className="tile-title"><Lines value={item.title} /></span>
              <span className="tile-arrow"><Icon name="arrow" /></span>
            </Link>
          ))}
        </section>

        <section className="home-container production-section" id="production">
          <div className="production-text">
            <p className="eyebrow">мы изготавливаем сами</p>
            <h2>Собственное производство Bullmet</h2>
            <p className="body-text">Мы изготавливаем садовую мебель, мебель для дома в стиле лофт, качели, навесы и малые архитектурные формы. Также выполняем художественную лазерную резку из листового металла.</p>
            <Link href="/production" className="small-orange">ПОДРОБНЕЕ О ПРОИЗВОДСТВЕ</Link>
          </div>
          <div className="production-image"><img src={img.workshop} alt="Производство Bullmet" /></div>
          <div className="production-list">
            {productionBenefits.map((item) => (
              <div key={item.title}><Icon name={item.icon} /><p><Lines value={item.title} /></p></div>
            ))}
          </div>
        </section>

        <section className="home-container products-services">
          <div className="popular-block">
            <h3>ПОПУЛЯРНЫЕ ТОВАРЫ</h3>
            <HomeProductsClient products={products} />
          </div>

          <div className="services-block">
            <h3>УСЛУГИ РЕЗКИ</h3>
            <div className="service-row-exact">
              <article>
                <img src={img.serviceMetal} alt="Лазерная резка" />
                <div><h4>Лазерная резка</h4><p>Художественная резка из листового металла для декора, вывесок, панелей и деталей</p><Link href="/services#request">ЗАКАЗАТЬ РАСЧЕТ</Link></div>
              </article>
              <article>
                <img src={img.serviceWood} alt="Гибка металла" />
                <div><h4>Гибка металла</h4><p>Гибка листового металла для мебельных каркасов, навесов, деталей и малых форм</p><Link href="/services#request">ЗАКАЗАТЬ РАСЧЕТ</Link></div>
              </article>
            </div>
          </div>
        </section>

        <section className="home-container steps-section steps-section-v2">
          <div className="steps-head-v2">
            <p>Как мы работаем</p>
            <h3>Простой алгоритм от идеи до результата</h3>
            <span>Мы берём на себя все этапы — вам остаётся получить готовое изделие.</span>
          </div>

          <div className="steps-grid steps-grid-v2">
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

          <div className="work-benefits-v2">
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

        <section className="home-container production-showcase-v2">
          <div className="production-showcase-head-v2">
            <div>
              <p className="eyebrow">фото производства и готовых изделий</p>
              <h3>ПРОИЗВОДСТВО BULLMET</h3>
            </div>
            <Link href="/about" className="production-showcase-link">Смотреть все фото</Link>
          </div>

          <div className="production-showcase-grid-v2">
            <article className="production-gallery-featured">
              <img src={productionGallery[0].src} alt={productionGallery[0].title} />
              <div className="production-gallery-featured-copy">
                <span>Собственное производство</span>
                <h4>{productionGallery[0].title}</h4>
                <p>{productionGallery[0].note}</p>
              </div>
            </article>

            <div className="production-gallery-list-v2">
              {productionGallery.slice(1).map((item) => (
                <article className="production-gallery-card-v2" key={item.src}>
                  <img src={item.src} alt={item.title} />
                  <div className="production-gallery-card-copy">
                    <h4>{item.title}</h4>
                    <p>{item.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="production-cta-v2">
            <div className="production-cta-copy-v2">
              <p className="eyebrow">индивидуальный заказ</p>
              <h2>Нужно изделие по вашим размерам?</h2>
              <p>Изготовим мебель, качели, навесы, декоративные панели, малые архитектурные формы и детали по вашему эскизу, фото или точным размерам.</p>

              <div className="production-cta-tags-v2">
                <span>По эскизу или фото</span>
                <span>Подбор размеров и материалов</span>
                <span>Согласование перед запуском</span>
              </div>

              <div className="production-cta-actions-v2">
                <Link href="/services#request" className="production-cta-primary">Обсудить проект</Link>
                <Link href="/production" className="production-cta-secondary">О производстве</Link>
              </div>
            </div>

            <div className="production-cta-visual-v2">
              <img src={img.cta} alt="Изготовление по индивидуальным размерам" />
              <div className="production-cta-facts-v2">
                <article>
                  <strong>Под заказ</strong>
                  <span>адаптируем форму, размер и комплектацию</span>
                </article>
                <article>
                  <strong>Контроль качества</strong>
                  <span>проверяем изделие до передачи клиенту</span>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
