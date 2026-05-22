import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Производство Bullmet — металл и дерево на заказ',
  description: 'Собственное производство Bullmet: изделия из металла и дерева, резка, сборка, покраска и контроль качества.',
  alternates: { canonical: '/production' },
};

const steps = [
  { icon: DraftIcon, title: 'Проектируем', text: 'Уточняем размеры, материал, назначение изделия и визуальный стиль.' },
  { icon: ToolsIcon, title: 'Режем и обрабатываем', text: 'Работаем с металлом и деревом, подготавливаем детали к сборке.' },
  { icon: FactoryIcon, title: 'Собираем', text: 'Собираем конструкцию, проверяем геометрию, крепления и внешний вид.' },
  { icon: ShieldIcon, title: 'Проверяем качество', text: 'Контролируем прочность, аккуратность обработки и соответствие заказу.' },
];

export default function ProductionPage() {
  return (
    <>
      <Header />
      <main className="innerPage">
        <section className="container innerHero innerHero--split">
          <div>
            <p className="sectionLabel">Производство Bullmet</p>
            <h1>Собственное производство изделий из металла и дерева</h1>
            <p>Мы создаем настенные часы, садовые качели, декоративные элементы, детали и индивидуальные изделия под задачу клиента. Работаем с идеей, фото, эскизом или готовым чертежом.</p>
            <div className="innerHero__actions">
              <Link className="button button--orange" href="/request?type=custom">Заказать расчет</Link>
              <Link className="button button--outline" href="/catalog">Смотреть каталог</Link>
            </div>
          </div>
          <div className="innerHero__image"><Image src="/assets/production.jpg" alt="Производство Bullmet" fill sizes="50vw" /></div>
        </section>

        <section className="container productionFacts">
          <article><b>Металл</b><span>декор, детали, конструкции, элементы интерьера</span></article>
          <article><b>Дерево</b><span>панно, часы, декоративные элементы и заготовки</span></article>
          <article><b>На заказ</b><span>изделия по вашим размерам, фото или чертежу</span></article>
          <article><b>Контроль</b><span>проверка качества перед передачей клиенту</span></article>
        </section>

        <section className="container innerSection">
          <div className="sectionHead"><h2>Как устроен процесс</h2><Link href="/request">Оставить заявку</Link></div>
          <div className="infoFeatureGrid">
            {steps.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container productionBanner">
          <TruckIcon />
          <div><h2>Готовые изделия можно забрать самостоятельно или оформить доставку</h2><p>Условия доставки и срок изготовления уточняются после расчета заказа.</p></div>
          <Link className="button button--orange" href="/delivery">Доставка</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
