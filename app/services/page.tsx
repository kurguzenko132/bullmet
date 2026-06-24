import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Услуги Bullmet — лазерная резка, гибка металла и изделия под заказ',
  description: 'Производственные услуги Bullmet: лазерная резка, гибка металла, мелкий опт металлопроката и изготовление изделий по чертежу, фото или эскизу.'
};

const services = [
  {
    id: 'laser',
    icon: 'spark',
    title: 'Лазерная резка',
    subtitle: 'Декор, таблички, вывески, панели и детали из листового металла.',
    image: '/assets/service-metal.jpg',
    items: ['по чертежу или эскизу', 'аккуратный рез', 'подготовка под покраску'],
    href: '#request'
  },
  {
    id: 'bending',
    icon: 'materials',
    title: 'Гибка металла',
    subtitle: 'Детали для мебели, навесов, каркасов и малых архитектурных форм.',
    image: '/assets/service-wood.jpg',
    items: ['индивидуальные размеры', 'разовые и серийные задачи', 'согласование до запуска'],
    href: '#request'
  },
  {
    id: 'custom',
    icon: 'custom',
    title: 'Изделия под заказ',
    subtitle: 'Изготовление по фото, ссылке на пример, чертежу или вашей идее.',
    image: '/assets/cat-custom.jpg',
    items: ['часы, качели, мебель', 'металл с элементами дерева', 'адаптация под задачу'],
    href: '#request'
  },
  {
    id: 'metal',
    icon: 'factory',
    title: 'Мелкий опт металлопроката',
    subtitle: 'Подбор и подготовка металла под производство, участок или ремонт.',
    image: '/assets/cat-metal.jpg',
    items: ['подбор материала', 'расчет количества', 'подготовка под задачу'],
    href: '#request'
  }
];

const steps = [
  ['01', 'Пришлите задачу', 'Фото, чертеж, ссылку на пример или описание простыми словами.'],
  ['02', 'Уточним детали', 'Размеры, материал, покрытие, количество, сроки и назначение изделия.'],
  ['03', 'Рассчитаем стоимость', 'Предложим понятный вариант по цене, срокам и исполнению.'],
  ['04', 'Изготовим и передадим', 'Запустим в работу, проверим качество и передадим заказ.']
];

const examples = [
  'декоративное панно',
  'табличка или вывеска',
  'каркас для мебели',
  'навес или качели',
  'деталь по чертежу',
  'изделие по фото'
];

export default function ServicesPage() {
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
            <h1>Резка, гибка и изготовление изделий под заказ</h1>
            <p>
              Рассчитаем стоимость по чертежу, фото, ссылке на пример или короткому описанию.
              Работаем с металлом, элементами дерева и индивидуальными проектами.
            </p>
            <div className="services-hero-actions-v2">
              <Link href="#request">Отправить на расчет</Link>
              <Link href="/production">Как производим</Link>
            </div>
          </div>
          <div className="services-hero-media-v2">
            <Image src="/assets/hero-machine.jpg" alt="Лазерная резка Bullmet" width={900} height={560} priority />
            <div>
              <b>Можно без готового чертежа</b>
              <span>достаточно фото, примера или описания задачи</span>
            </div>
          </div>
        </section>

        <section className="services-quick-v2" aria-label="Основные услуги">
          {services.map((service) => (
            <Link href={service.href} key={service.id}>
              <Icon name={service.icon as any} />
              <span>{service.title}</span>
            </Link>
          ))}
        </section>

        <section className="services-list-v2">
          <div className="services-section-head-v2">
            <p className="page-kicker">Что можно заказать</p>
            <h2>Основные направления услуг</h2>
            <span>Выберите готовое направление или отправьте задачу в свободной форме — подскажем, как лучше изготовить.</span>
          </div>

          <div className="services-grid-v2">
            {services.map((service) => (
              <article id={service.id} key={service.id}>
                <div className="service-image-v2">
                  <Image src={service.image} alt={service.title} width={620} height={410} />
                </div>
                <div className="service-body-v2">
                  <Icon name={service.icon as any} />
                  <h3>{service.title}</h3>
                  <p>{service.subtitle}</p>
                  <ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  <Link href="#request">Рассчитать</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-examples-v2">
          <div>
            <p className="page-kicker">Формат заявки</p>
            <h2>Что можно прислать для расчета</h2>
            <p>Не обязательно сразу готовить техническое задание. Для первого расчета подойдет любая отправная точка.</p>
          </div>
          <div className="services-example-tags-v2">
            {examples.map((example) => <span key={example}>{example}</span>)}
          </div>
        </section>

        <section className="services-process-v2">
          <div className="services-section-head-v2">
            <p className="page-kicker">Процесс</p>
            <h2>Как проходит расчет и заказ</h2>
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

        <section id="request" className="services-request-v2">
          <div className="services-request-copy-v2">
            <p className="page-kicker">Расчет проекта</p>
            <h2>Отправьте задачу — мы рассчитаем стоимость</h2>
            <p>
              Укажите, что нужно изготовить, примерные размеры, материал, количество и прикрепите файл,
              если он есть. После заявки мы свяжемся с вами и уточним детали.
            </p>
            <div className="services-request-points-v2">
              <span><Icon name="shield" /> Без обязательств</span>
              <span><Icon name="calculator" /> Расчет по задаче</span>
              <span><Icon name="truck" /> Доставка по Беларуси</span>
            </div>
          </div>
          <ServiceRequestForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
