import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { getSiteControlSettings } from '@/lib/siteControl';
import { getCatalogControlSettings, visibleCatalogCategories } from '@/lib/catalogControl';

export async function generateMetadata() {
  const site = await getSiteControlSettings();
  const anyServiceVisible = site.directions.some((direction) => direction.visible && direction.key !== 'clocks');
  return {
    title: anyServiceVisible ? 'Услуги Bullmet — производство металлоизделий' : 'Раздел временно скрыт | Bullmet',
    description: anyServiceVisible
      ? 'Производственные услуги Bullmet: лазерная резка, гибка металла, металлопрокат и изделия под заказ.'
      : 'Информационная страница о производственных направлениях Bullmet.',
    robots: anyServiceVisible && site.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false }
  };
}

const services = [
  {
    id: 'laser',
    directionKey: 'laser_cutting',
    icon: 'spark',
    title: 'Лазерная резка',
    subtitle: 'Декор, таблички, вывески, панели и детали из листового металла.',
    image: '/assets/service-metal.jpg',
    items: ['по чертежу или эскизу', 'аккуратный рез', 'подготовка под покраску'],
    href: '/contacts'
  },
  {
    id: 'bending',
    directionKey: 'metal_bending',
    icon: 'materials',
    title: 'Гибка металла',
    subtitle: 'Детали для мебели, навесов, каркасов и малых архитектурных форм.',
    image: '/assets/service-wood.jpg',
    items: ['индивидуальные размеры', 'разовые и серийные задачи', 'согласование до запуска'],
    href: '/contacts'
  },
  {
    id: 'custom',
    directionKey: 'loft_furniture',
    icon: 'custom',
    title: 'Изделия под заказ',
    subtitle: 'Изготовление по фото, ссылке на пример, чертежу или вашей идее.',
    image: '/assets/cat-custom.jpg',
    items: ['часы, качели, мебель', 'металл с элементами дерева', 'адаптация под задачу'],
    href: '/contacts'
  },
  {
    id: 'metal',
    directionKey: 'metal_wholesale',
    icon: 'factory',
    title: 'Мелкий опт металлопроката',
    subtitle: 'Подбор и подготовка металла под производство, участок или ремонт.',
    image: '/assets/cat-metal.jpg',
    items: ['подбор материала', 'ориентир по количеству', 'подготовка под задачу'],
    href: '/contacts'
  }
];

const steps = [
  ['01', 'Знакомство с задачей', 'Понимаем, какое изделие нужно и где оно будет использоваться.'],
  ['02', 'Уточнение деталей', 'Размеры, материал, покрытие, количество, сроки и назначение изделия.'],
  ['03', 'Подготовка решения', 'Подбираем оптимальный вариант изготовления и согласуем детали.'],
  ['04', 'Производство', 'Запускаем работу, проверяем качество и передаём готовое изделие.']
];

const examples = [
  'декоративное панно',
  'табличка или вывеска',
  'каркас для мебели',
  'навес или качели',
  'деталь по чертежу',
  'изделие по фото'
];

export default async function ServicesPage() {
  const [site, catalog] = await Promise.all([
    getSiteControlSettings(),
    getCatalogControlSettings()
  ]);

  const visibleDirectionKeys = new Set<string>(site.directions.filter((direction) => direction.visible).map((direction) => direction.key));
  const visibleServiceCategories = new Set(visibleCatalogCategories(catalog, 'service').map((category) => category.slug));
  const enabledServices = services.filter((service) => visibleDirectionKeys.has(service.directionKey) || visibleServiceCategories.has(service.directionKey));
  const visibleServices = enabledServices.length ? enabledServices : services;
  const isPreviewMode = !enabledServices.length;

  return (
    <>
      <Header />
      <main className="services-page-v2">
        <section className="services-hero-v2">
          <div className="services-hero-copy-v2">
            <nav className="services-breadcrumbs-v2" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link><span>›</span><span>Услуги</span>
            </nav>
            <p className="page-kicker">Услуги производства</p>
            <h1>Производственные возможности Bullmet</h1>
            <p>
              Работаем с металлом, элементами дерева и индивидуальными проектами. Здесь собраны основные производственные направления Bullmet.
            </p>
            <div className="services-hero-actions-v2">
              <Link href="/contacts">Связаться</Link>
              <Link href="/catalog">Смотреть каталог</Link>
            </div>
          </div>
          <div className="services-hero-media-v2">
            <Image src="/assets/hero-machine.jpg" alt="Лазерная резка Bullmet" width={900} height={560} priority />
            <div>
              <b>Собственное производство</b>
              <span>металл, дерево и изделия под задачу</span>
            </div>
          </div>
        </section>

        {isPreviewMode && (
          <section className="services-launch-notice-v2">
            <Icon name="clock" />
            <div>
              <b>Раздел услуг открыт как информационная страница</b>
              <p>Bullmet производит настенные часы и металлические изделия с элементами дерева. Для уточнения деталей можно связаться с нами через контакты.</p>
            </div>
          </section>
        )}

        <section className="services-quick-v2" aria-label="Основные услуги">
          {visibleServices.map((service) => (
            <Link href={service.href} key={service.id}>
              <Icon name={service.icon as any} />
              <span>{service.title}</span>
            </Link>
          ))}
        </section>

        <section className="services-list-v2">
          <div className="services-section-head-v2">
            <p className="page-kicker">Производственные направления</p>
            <h2>Что умеет производство Bullmet</h2>
            <span>Посмотрите направления производства и свяжитесь с нами, если нужна консультация по изделию.</span>
          </div>

          <div className="services-grid-v2">
            {visibleServices.map((service) => (
              <article id={service.id} key={service.id}>
                <div className="service-image-v2">
                  <Image src={service.image} alt={service.title} width={620} height={410} />
                </div>
                <div className="service-body-v2">
                  <Icon name={service.icon as any} />
                  <h3>{service.title}</h3>
                  <p>{service.subtitle}</p>
                  <ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  <Link href="/contacts">Подробнее</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-examples-v2">
          <div>
            <p className="page-kicker">Возможные задачи</p>
            <h2>Какие изделия можно делать</h2>
            <p>Эти примеры можно использовать как направления для будущего развития услуг и контента.</p>
          </div>
          <div className="services-example-tags-v2">
            {examples.map((example) => <span key={example}>{example}</span>)}
          </div>
        </section>

        <section className="services-process-v2">
          <div className="services-section-head-v2">
            <p className="page-kicker">Процесс</p>
            <h2>Как обычно проходит работа</h2>
          </div>
          <div className="services-process-grid-v2">
            {steps.map(([number, title, text]) => (
              <article key={number}>
                <b>{number}</b>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
}
