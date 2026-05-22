import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { DraftIcon, FactoryIcon, ToolsIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Услуги Bullmet — резка металла, резка дерева, изделия на заказ',
  description: 'Услуги Bullmet: резка металла, резка дерева, изготовление декоративных изделий, часов, качелей и проектов на заказ.',
  alternates: { canonical: '/services' },
};

const services = [
  { title: 'Резка металла', text: 'Детали, таблички, декор, элементы конструкций и интерьерные изделия.', image: '/assets/service-metal.jpg', href: '/request?type=metal-cutting' },
  { title: 'Резка дерева', text: 'Панно, заготовки, вывески, декоративные элементы и подарочные изделия.', image: '/assets/service-wood.jpg', href: '/request?type=wood-cutting' },
  { title: 'Изделия на заказ', text: 'Разработка и изготовление изделий по фото, эскизу, размерам или чертежу.', image: '/assets/cat-custom.jpg', href: '/request?type=custom' },
];

const serviceSteps = [
  { icon: DraftIcon, title: 'Вы отправляете задачу', text: 'Опишите изделие, прикрепите фото, размеры или чертеж.' },
  { icon: ToolsIcon, title: 'Мы считаем стоимость', text: 'Уточняем материал, объем работ, сроки и способ передачи заказа.' },
  { icon: FactoryIcon, title: 'Изготавливаем', text: 'Запускаем резку, обработку, сборку и финальную проверку.' },
  { icon: TruckIcon, title: 'Передаем заказ', text: 'Самовывоз или доставка после согласования деталей.' },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="innerPage">
        <section className="container innerHero">
          <p className="sectionLabel">Услуги</p>
          <h1>Резка металла, резка дерева и изготовление изделий на заказ</h1>
          <p>Вы можете заказать как готовое изделие, так и индивидуальную работу: от декоративной детали до полноценного проекта для дома, сада или бизнеса.</p>
        </section>

        <section className="container servicePageGrid">
          {services.map((service) => (
            <article className="servicePageCard" key={service.title}>
              <div className="servicePageCard__image"><Image src={service.image} alt={service.title} fill sizes="33vw" /></div>
              <div>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <Link href={service.href}>Заказать расчет</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="container innerSection">
          <h2>Как заказать услугу</h2>
          <div className="infoFeatureGrid infoFeatureGrid--steps">
            {serviceSteps.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon />
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
