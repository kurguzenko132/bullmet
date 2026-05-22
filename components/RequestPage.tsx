import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Header, Footer } from './HomePage';
import { DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from './Icons';

export function RequestPage({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="requestPage">
        <section className="container requestHero">
          <div className="requestHero__content">
            <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Заявка на расчет</span></div>
            <h1 className="pageTitle">Заявка на расчет</h1>
            <p>Опишите задачу: изделие на заказ, резка металла или дерева, садовые качели, часы или декор. Мы уточним детали и подготовим расчет.</p>
            <div className="requestHero__points">
              <span><FactoryIcon /> Собственное производство</span>
              <span><ToolsIcon /> Металл и дерево</span>
              <span><ShieldIcon /> Расчет до запуска</span>
            </div>
          </div>
          <div className="requestHero__image">
            <Image src="/assets/service-metal.jpg" alt="Расчет изделия Bullmet" fill priority sizes="40vw" />
          </div>
        </section>

        <section className="container requestLayout">
          <aside className="requestAside">
            <h2>Что можно рассчитать</h2>
            <div className="requestAside__list">
              <div><DraftIcon /><b>Индивидуальное изделие</b><span>По фото, эскизу или чертежу</span></div>
              <div><ToolsIcon /><b>Резка металла / дерева</b><span>По размерам, макету или файлу</span></div>
              <div><TruckIcon /><b>Доставка и самовывоз</b><span>Подберем удобный вариант</span></div>
            </div>
            <p className="requestNote">После отправки заявки менеджер свяжется с вами для уточнения деталей. Позже подключим сохранение заявок в Supabase.</p>
          </aside>
          {children}
        </section>
      </main>
      <Footer />
    </>
  );
}
