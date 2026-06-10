import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';

export const metadata = { title: 'Услуги Bullmet', description: 'Лазерная резка, гибка металла, изготовление изделий по чертежу или эскизу.' };

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="container-page py-10">
        <p className="text-sm text-bull-muted">Главная › Услуги</p>
        <h1 className="mt-4 text-5xl font-black">Услуги</h1>
        <p className="mt-4 max-w-2xl text-bull-muted">Современное оборудование и опыт специалистов для реализации ваших задач.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card title="Лазерная резка" img="/mockup/service-metal.jpg" />
          <Card title="Гибка металла" img="/mockup/service-wood.jpg" />
        </div>
        <section className="mt-10 grid gap-8 bg-white p-8 shadow-soft lg:grid-cols-2">
          <ServiceRequestForm />
          <Image src="/mockup/hero.jpg" alt="Детали производства" width={800} height={500} className="h-full min-h-80 w-full object-cover" />
        </section>
      </main>
      <Footer />
    </>
  );
}

function Card({ title, img }: { title: string; img: string }) {
  return (
    <article className="overflow-hidden bg-white shadow-soft">
      <Image src={img} alt={title} width={800} height={420} className="h-80 w-full object-cover" />
      <div className="p-8"><h2 className="text-3xl font-black">{title}</h2><p className="mt-4 text-bull-muted">Детали, таблички, декор, панно, элементы конструкций и индивидуальные проекты.</p><button className="mt-6 border border-bull-orange px-6 py-3 font-bold text-bull-orange">Заказать расчет</button></div>
    </article>
  );
}
