import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon, DraftIcon, ClockIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'О компании Bullmet — производство изделий из металла и дерева',
  description: 'Bullmet — собственное производство настенных часов, садовых качелей, декоративных изделий, резки металла и дерева, а также индивидуальных проектов на заказ.',
  alternates: { canonical: '/about' },
};

const facts = [
  { value: '2017+', label: 'развиваем направление изделий из металла и дерева' },
  { value: '100+', label: 'идей и изделий можно адаптировать под клиента' },
  { value: '2', label: 'ключевых материала: металл и дерево' },
  { value: '1', label: 'производственный подход от эскиза до готового изделия' },
];

const values = [
  { icon: FactoryIcon, title: 'Собственное производство', text: 'Не просто перепродаем изделия, а создаем их сами: режем, собираем, подготавливаем и доводим до готового результата.' },
  { icon: ToolsIcon, title: 'Работа под задачу', text: 'Можем сделать готовый товар, изменить размер, подобрать цвет, материал или изготовить изделие по фото, эскизу и чертежу.' },
  { icon: ShieldIcon, title: 'Аккуратность и контроль', text: 'Следим за геометрией, качеством резки, креплениями, обработкой поверхности и тем, как изделие выглядит в интерьере.' },
  { icon: TruckIcon, title: 'Передача заказа', text: 'Подбираем удобный формат: самовывоз, доставка, изготовление под сроки и согласование деталей перед запуском.' },
];

const directions = [
  'настенные часы собственного производства',
  'садовые качели и конструкции для участка',
  'резка металла для декора, деталей и табличек',
  'резка дерева для панно, вывесок и подарков',
  'изделия на заказ по размерам клиента',
  'декоративные элементы для дома, сада и бизнеса',
];

const principles = [
  { title: 'Понятно объясняем', text: 'Перед расчетом уточняем размеры, материал, пожелания, назначение изделия и ограничения по срокам.' },
  { title: 'Думаем о применении', text: 'Изделие должно не только красиво смотреться на фото, но и быть удобным, прочным и понятным в использовании.' },
  { title: 'Делаем гибко', text: 'Одну модель можно адаптировать под другой цвет, размер, тематику, интерьер или назначение.' },
];

const steps = [
  { icon: DraftIcon, title: 'Идея или заявка', text: 'Клиент выбирает готовый товар или отправляет задачу на индивидуальное изделие.' },
  { icon: ToolsIcon, title: 'Расчет и подготовка', text: 'Согласовываем материал, размеры, цвет, стоимость и технические детали.' },
  { icon: FactoryIcon, title: 'Производство', text: 'Выполняем резку, обработку, сборку, подготовку поверхности и финальную проверку.' },
  { icon: TruckIcon, title: 'Передача', text: 'Передаем заказ клиенту, подбираем доставку или самовывоз и даем рекомендации по использованию.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="innerPage aboutPage">
        <section className="container innerHero innerHero--split aboutHero">
          <div>
            <p className="sectionLabel">О компании</p>
            <h1>Bullmet — производственная мастерская изделий из металла и дерева</h1>
            <p>
              Мы создаем настенные часы, садовые качели, декоративные элементы, выполняем резку металла и дерева, а также беремся за индивидуальные проекты по размерам, фото, эскизу или чертежу.
            </p>
            <div className="innerHero__actions">
              <Link className="button button--orange" href="/catalog">Перейти в каталог</Link>
              <Link className="button button--outline" href="/request?type=custom">Обсудить проект</Link>
            </div>
          </div>
          <div className="innerHero__image aboutHero__image">
            <Image src="/assets/hero-machine.jpg" alt="Производство Bullmet" fill sizes="50vw" priority />
          </div>
        </section>

        <section className="container aboutFacts" aria-label="Факты о Bullmet">
          {facts.map((fact) => (
            <article key={fact.value}>
              <b>{fact.value}</b>
              <span>{fact.label}</span>
            </article>
          ))}
        </section>

        <section className="container aboutIntroGrid">
          <div className="aboutIntroCard aboutIntroCard--dark">
            <p className="sectionLabel">Наша идея</p>
            <h2>Сделать производство ближе к клиенту</h2>
            <p>
              Bullmet строится вокруг простой логики: клиенту должно быть легко выбрать готовое изделие или отправить задачу на расчет. Поэтому сайт объединяет каталог, индивидуальные заявки, услуги резки и удобную админку для управления товарами.
            </p>
          </div>
          <div className="aboutIntroCard">
            <p className="sectionLabel">Что важно</p>
            <h2>Не шаблон, а вещь под задачу</h2>
            <p>
              Даже если изделие уже есть в каталоге, его можно адаптировать: изменить цвет, размер, тематику, материал или сделать похожий вариант под конкретный интерьер, участок, мастерскую, офис или подарок.
            </p>
          </div>
        </section>

        <section className="container innerSection">
          <div className="sectionHead sectionHead--wide">
            <div>
              <p className="sectionLabel">Направления</p>
              <h2>Что производим и рассчитываем</h2>
            </div>
            <Link href="/services">Все услуги</Link>
          </div>
          <div className="aboutDirections">
            {directions.map((item, index) => (
              <article key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{item}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="container infoFeatureGrid aboutValues">
          {values.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="container aboutProductionBlock">
          <div className="aboutProductionBlock__image">
            <Image src="/assets/production.jpg" alt="Производственный процесс Bullmet" fill sizes="44vw" />
          </div>
          <div className="aboutProductionBlock__content">
            <p className="sectionLabel">Подход к работе</p>
            <h2>От идеи до готового изделия</h2>
            <p>
              Мы смотрим на изделие целиком: как оно будет выглядеть, где будет стоять, как крепиться, какой материал подойдет лучше и как его аккуратно изготовить. Такой подход помогает делать вещи, которые выглядят законченно и служат в реальном использовании.
            </p>
            <div className="aboutPrinciples">
              {principles.map((item) => (
                <article key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container innerSection">
          <p className="sectionLabel">Как строится заказ</p>
          <h2 className="aboutSectionTitle">Прозрачный процесс без лишней сложности</h2>
          <div className="aboutSteps">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <div>
                  <Icon />
                  <small>{String(index + 1).padStart(2, '0')}</small>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container aboutQuality">
          <div>
            <p className="sectionLabel">Качество</p>
            <h2>Детали, которые влияют на результат</h2>
            <p>
              В изделиях из металла и дерева важны не только форма и картинка. Важны толщина материала, качество реза, обработка кромки, крепление, покраска, устойчивость конструкции и аккуратность сборки. Поэтому каждый проект мы рассматриваем не как отдельную картинку, а как готовую вещь, которая должна нормально работать у клиента.
            </p>
          </div>
          <ul>
            <li>подбор материала под задачу;</li>
            <li>согласование размеров до производства;</li>
            <li>контроль резки и внешнего вида;</li>
            <li>возможность повторить изделие в другом цвете или размере.</li>
          </ul>
        </section>

        <section className="container aboutCta">
          <div>
            <ClockIcon />
            <h2>Есть идея изделия или нужно рассчитать резку?</h2>
            <p>Отправьте описание, размеры, фото или чертеж — мы разберем задачу и подскажем, как лучше реализовать изделие.</p>
          </div>
          <Link className="button button--orange" href="/request">Заказать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
