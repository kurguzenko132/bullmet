import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Производство Bullmet — настенные часы и изделия из металла',
  description: 'Собственное производство Bullmet. Настенные часы из металла с элементами дерева, аккуратная обработка и контроль качества.'
};

const directions = [
  {
    icon: 'clock',
    title: 'Настенные часы',
    text: 'Металлические часы с элементами дерева для дома, офиса, кафе и подарка.'
  },
  {
    icon: 'materials',
    title: 'Металл с элементами дерева',
    text: 'Сочетаем металлическую основу, декоративные элементы и аккуратную финишную обработку.'
  },
  {
    icon: 'tools',
    title: 'Индивидуальные детали',
    text: 'Поможем подобрать размер, цвет и исполнение модели под интерьер.'
  },
  {
    icon: 'shield',
    title: 'Контроль качества',
    text: 'Проверяем внешний вид, сборку, крепление и комплектацию перед передачей.'
  }
];

const stages = [
  ['01', 'Выбор модели', 'Вы выбираете часы в каталоге или пишете нам, если нужна консультация.'],
  ['02', 'Уточнение деталей', 'Подтверждаем наличие, размер, цвет и способ получения.'],
  ['03', 'Изготовление', 'Готовим изделие на собственном производстве Bullmet.'],
  ['04', 'Контроль', 'Проверяем внешний вид, сборку и комплектацию.'],
  ['05', 'Передача заказа', 'Согласовываем самовывоз или доставку по Беларуси.']
];

const showcase = [
  {
    title: 'Готовые часы',
    text: 'Настенные модели из металла с элементами дерева.',
    image: '/assets/prod-clock-loft.jpg',
    href: '/catalog'
  },
  {
    title: 'Детали и обработка',
    text: 'Аккуратная подготовка элементов перед сборкой.',
    image: '/assets/hero-machine.jpg',
    href: '/production'
  }
];

export default function ProductionPage() {
  return (
    <>
      <Header />
      <main className="production-page production-page--rich production-page--clean">
        <section className="production-hero-rich production-hero-clean">
          <div className="production-hero-content">
            <nav className="production-breadcrumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link>
              <span>›</span>
              <span>Производство</span>
            </nav>
            <p className="section-kicker">Производство Bullmet</p>
            <h1>Изготавливаем настенные часы из металла с элементами дерева</h1>
            <p>
              Bullmet — собственное производство металлических изделий. На сайте представлены настенные часы,
              которые можно выбрать в каталоге или уточнить по телефону.
            </p>
            <div className="production-hero-actions">
              <Link href="/catalog">Смотреть часы</Link>
              <Link href="/contacts">Связаться</Link>
            </div>
          </div>
          <div className="production-hero-media">
            <Image src="/assets/production.jpg" alt="Производство Bullmet" width={980} height={640} priority />
          </div>
        </section>

        <section className="production-directions-rich production-directions-clean">
          <div className="production-section-head">
            <p className="section-kicker">Что производим</p>
            <h2>Металл, дерево и аккуратная сборка</h2>
          </div>
          <div className="production-directions-grid">
            {directions.map((item) => (
              <article key={item.title}>
                <Icon name={item.icon as any} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="production-showcase-rich production-showcase-clean">
          <div>
            <p className="section-kicker">Изделия</p>
            <h2>Готовые модели и детали производства</h2>
            <p>
              На странице показаны основные возможности производства Bullmet. Для покупки настенных часов
              перейдите в каталог или свяжитесь с нами для уточнения деталей.
            </p>
            <Link href="/catalog">Перейти в каталог</Link>
          </div>
          <div className="production-showcase-gallery">
            {showcase.map((item) => (
              <Link href={item.href} key={item.title}>
                <Image src={item.image} alt={item.title} width={420} height={320} />
                <span>{item.title}</span>
                <small>{item.text}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="production-process-rich production-process-clean">
          <div className="production-section-head">
            <p className="section-kicker">Этапы</p>
            <h2>Как проходит заказ</h2>
          </div>
          <div className="production-process-grid">
            {stages.map(([number, title, text]) => (
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
