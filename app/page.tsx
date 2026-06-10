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
  { icon: 'request' as const, num: '01', title: 'Вы оставляете\nзаявку', desc: 'Через форму на сайте\nили по телефону' },
  { icon: 'ruler' as const, num: '02', title: 'Мы уточняем детали', desc: 'Размеры, материалы,\nпожелания' },
  { icon: 'calculator' as const, num: '03', title: 'Рассчитываем\nстоимость', desc: 'Согласовываем цену\nи сроки' },
  { icon: 'hammer' as const, num: '04', title: 'Изготавливаем\nизделие', desc: 'Контроль качества\nна каждом этапе' },
  { icon: 'package' as const, num: '05', title: 'Передаем или\nдоставляем заказ', desc: 'Самовывоз или доставка\nпо Беларуси' }
];

const gallery = [img.gallery1, img.gallery2, img.gallery3, img.gallery4, img.gallery5, img.gallery6];

function Lines({ value }: { value: string }) {
  return <>{value.split('\n').map((line) => <span key={line}>{line}</span>)}</>;
}

export default async function HomePage() {
  const products = (await getCatalogProducts()).slice(0, 4);
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

        <section className="home-container steps-section">
          <h3>КАК МЫ РАБОТАЕМ</h3>
          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.num}>
                <Icon name={step.icon} className="step-icon" />
                <span className="step-num">{step.num}</span>
                <h4><Lines value={step.title} /></h4>
                <p><Lines value={step.desc} /></p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-container gallery-section">
          <div className="section-head">
            <h3>ПРОИЗВОДСТВО BULLMET</h3>
            <Link href="/about">Смотреть все фото</Link>
          </div>
          <div className="gallery-slider" aria-label="Фото производства Bullmet">
            {gallery.map((src, index) => (
              <article className="gallery-slide" key={src}>
                <img src={src} alt={`Производство Bullmet ${index + 1}`} />
              </article>
            ))}
          </div>
        </section>

        <section className="home-container cta-exact">
          <div className="cta-copy">
            <h2>НУЖНО ИЗДЕЛИЕ ПО ВАШИМ РАЗМЕРАМ?</h2>
            <p>Изготовим мебель, качели, навесы, малые архитектурные формы, декоративные панели или детали по вашему эскизу и размерам.</p>
            <Link href="/services#request">ОБСУДИТЬ ПРОЕКТ</Link>
          </div>
          <div className="cta-image"><img src={img.cta} alt="Изделие по вашим размерам" /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
