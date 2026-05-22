import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'О компании Bullmet',
  description: 'Bullmet — производство изделий из металла и дерева: настенные часы, садовые качели, декоративные элементы, резка и проекты на заказ.',
  alternates: { canonical: '/about' },
};

const values = [
  { icon: FactoryIcon, title: 'Собственное производство', text: 'Мы контролируем процесс от идеи и раскроя до сборки и передачи изделия.' },
  { icon: ToolsIcon, title: 'Металл и дерево', text: 'Сочетаем материалы, фактуры и технологии для прочных и выразительных изделий.' },
  { icon: ShieldIcon, title: 'Аккуратность', text: 'Следим за качеством обработки, креплениями, геометрией и итоговым внешним видом.' },
  { icon: TruckIcon, title: 'Работа под задачу', text: 'Делаем готовые товары и индивидуальные проекты по размерам клиента.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="innerPage">
        <section className="container innerHero innerHero--split">
          <div>
            <p className="sectionLabel">О компании</p>
            <h1>Bullmet — изделия из металла и дерева для дома, сада и бизнеса</h1>
            <p>Мы развиваем производство, где можно купить готовое изделие или заказать индивидуальный проект: часы, качели, декор, детали, таблички и элементы интерьера.</p>
            <div className="innerHero__actions">
              <Link className="button button--orange" href="/catalog">Каталог</Link>
              <Link className="button button--outline" href="/request">Индивидуальный заказ</Link>
            </div>
          </div>
          <div className="innerHero__image"><Image src="/assets/hero-machine.jpg" alt="Bullmet" fill sizes="50vw" /></div>
        </section>

        <section className="container infoFeatureGrid">
          {values.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="container aboutTextBlock">
          <h2>Что делает Bullmet</h2>
          <p>Основные направления — настенные часы собственного производства, садовые качели, резка металла и дерева, декоративные элементы и изделия на заказ. Сайт постепенно станет полноценной системой: каталог, заявки, заказы, админка, личный кабинет и управление контентом.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
