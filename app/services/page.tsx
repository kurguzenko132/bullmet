import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { ArrowIcon, DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Услуги Bullmet — резка металла, резка дерева, изделия на заказ',
  description: 'Резка металла и дерева, изготовление декоративных изделий, часов, качелей и индивидуальных проектов на заказ от Bullmet.',
  alternates: { canonical: '/services' },
};

const mainServices = [
  {
    title: 'Резка металла',
    subtitle: 'Детали, декор, таблички и элементы конструкций',
    text: 'Выполняем резку металла для интерьерного декора, вывесок, номерных табличек, деталей, кронштейнов и нестандартных изделий. Подходит как для единичных заказов, так и для небольших партий.',
    image: '/assets/service-metal.jpg',
    href: '/request?type=metal-cutting',
    bullets: ['Декоративные панели и элементы', 'Таблички, номера, логотипы', 'Заготовки под дальнейшую сборку'],
  },
  {
    title: 'Резка дерева',
    subtitle: 'Панно, макеты, подарки и интерьерные элементы',
    text: 'Изготавливаем деревянные заготовки, декоративные панно, элементы оформления, подарки, вывески и детали по вашим размерам. Работаем по фото, эскизу, макету или техническому заданию.',
    image: '/assets/service-wood.jpg',
    href: '/request?type=wood-cutting',
    bullets: ['Декор для дома и бизнеса', 'Подарочные изделия', 'Вывески и интерьерные элементы'],
  },
  {
    title: 'Изделия на заказ',
    subtitle: 'От идеи до готового изделия',
    text: 'Если нужного товара нет в каталоге, мы можем изготовить похожий или полностью индивидуальный вариант: часы, садовые качели, декоративные элементы, металлические и деревянные конструкции.',
    image: '/assets/cat-custom.jpg',
    href: '/request?type=custom',
    bullets: ['Индивидуальные размеры', 'Подбор материала и формы', 'Изготовление по фото или чертежу'],
  },
];

const serviceDirections = [
  'Настенные часы и декоративные изделия',
  'Садовые качели и элементы для участка',
  'Металлические таблички и номера',
  'Панно, вывески и интерьерный декор',
  'Детали по размерам и эскизам',
  'Подарочные и тематические изделия',
];

const process = [
  { icon: DraftIcon, title: 'Заявка и материалы', text: 'Вы описываете задачу, отправляете размеры, фото, эскиз, чертеж или пример изделия.' },
  { icon: ToolsIcon, title: 'Уточнение деталей', text: 'Мы проверяем материал, толщину, размеры, сложность резки и способ обработки.' },
  { icon: FactoryIcon, title: 'Расчет и производство', text: 'Согласовываем стоимость, срок, запускаем резку, сборку и подготовку изделия.' },
  { icon: ShieldIcon, title: 'Проверка качества', text: 'Проверяем геометрию, внешний вид, комплектность и готовность к передаче.' },
  { icon: TruckIcon, title: 'Передача заказа', text: 'Передаем заказ самовывозом или согласовываем доставку по Беларуси.' },
];

const requirements = [
  { title: 'Для точного расчета', text: 'Укажите размеры, материал, количество, желаемый срок и прикрепите фото, эскиз или чертеж.' },
  { title: 'Если есть файл', text: 'Можно приложить макет, DXF, PDF, SVG, изображение или любой файл, который поможет понять задачу.' },
  { title: 'Если есть только идея', text: 'Опишите изделие словами. Мы уточним детали и подскажем, как лучше реализовать проект.' },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="servicesPage">
        <section className="servicesHero">
          <div className="container servicesHero__grid">
            <div className="servicesHero__content">
              <p className="sectionLabel">Услуги Bullmet</p>
              <h1>Резка металла, резка дерева и изделия на заказ</h1>
              <p>
                Помогаем превратить идею, эскиз или готовый чертеж в изделие: от небольшой декоративной детали до часов, качелей, вывески или элемента интерьера.
              </p>
              <div className="servicesHero__actions">
                <Link className="button button--orange" href="/request">Заказать расчет</Link>
                <Link className="button button--outline" href="/catalog">Смотреть товары</Link>
              </div>
            </div>
            <div className="servicesHero__image">
              <Image src="/assets/service-metal.jpg" alt="Резка металла Bullmet" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            </div>
          </div>
        </section>

        <section className="container servicesStats" aria-label="Преимущества услуг Bullmet">
          <article><b>Металл</b><span>резка, декор, детали, таблички</span></article>
          <article><b>Дерево</b><span>панно, вывески, подарки, заготовки</span></article>
          <article><b>На заказ</b><span>по фото, эскизу, размерам или чертежу</span></article>
          <article><b>Под ключ</b><span>расчет, изготовление, проверка, передача</span></article>
        </section>

        <section className="container servicesMainSection">
          <div className="sectionHead servicesSectionHead">
            <h2>Основные услуги</h2>
            <p>Выберите направление и отправьте заявку — мы уточним детали и подготовим расчет.</p>
          </div>
          <div className="servicesRichGrid">
            {mainServices.map((service) => (
              <article className="servicesRichCard" key={service.title}>
                <div className="servicesRichCard__image">
                  <Image src={service.image} alt={service.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
                <div className="servicesRichCard__body">
                  <span>{service.subtitle}</span>
                  <h2>{service.title}</h2>
                  <p>{service.text}</p>
                  <ul>
                    {service.bullets.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <Link href={service.href}>Заказать расчет <ArrowIcon /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="servicesDarkBlock">
          <div className="container servicesDarkBlock__grid">
            <div>
              <p className="sectionLabel">Что можно заказать</p>
              <h2>Работаем с задачами для дома, сада, бизнеса и подарков</h2>
              <p>
                Bullmet подходит для заказов, где важно сочетание аккуратного внешнего вида, индивидуального размера и надежного материала. Мы можем изготовить как готовый товар из каталога, так и полностью персональное изделие.
              </p>
            </div>
            <div className="servicesDirectionGrid">
              {serviceDirections.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="container servicesProcessSection">
          <div className="sectionHead servicesSectionHead">
            <h2>Как проходит работа</h2>
            <p>Понятный процесс без лишней переписки: сначала уточняем задачу, потом считаем и запускаем производство.</p>
          </div>
          <div className="servicesProcessGrid">
            {process.map(({ icon: Icon, title, text }, index) => (
              <article className="servicesProcessCard" key={title}>
                <div><Icon /><small>{String(index + 1).padStart(2, '0')}</small></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container servicesRequirements">
          <div className="servicesRequirements__intro">
            <p className="sectionLabel">Что отправить для расчета</p>
            <h2>Чем точнее вводные, тем быстрее расчет</h2>
            <p>Не обязательно иметь идеальный чертеж. Достаточно понятного описания, примерных размеров и фото похожего изделия.</p>
          </div>
          <div className="servicesRequirements__cards">
            {requirements.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container servicesCta">
          <div>
            <h2>Нужно рассчитать резку или изделие?</h2>
            <p>Отправьте задачу, фото или чертеж — мы уточним детали и подготовим расчет стоимости.</p>
          </div>
          <Link className="button button--orange" href="/request">Оставить заявку</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
