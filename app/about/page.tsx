import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'О компании', description: 'Bullmet — собственное производство изделий из металла с элементами дерева.' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="about-page-polished">
        <section className="container-page about-hero-polished">
          <div>
            <p>Главная › О компании</p>
            <h1>Собственное производство изделий из металла с элементами дерева</h1>
            <span>Bullmet изготавливает садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы и выполняет художественную лазерную резку.</span>
            <div className="about-actions-polished"><Link href="/production">Производство</Link><Link href="/services#request">Заказать расчет</Link></div>
          </div>
          <Image src="/mockup/prod-workshop.jpg" alt="Производство Bullmet" width={900} height={560} />
        </section>

        <section className="container-page about-stats-polished">
          <div><b>7+</b><span>лет опыта</span></div>
          <div><b>1000+</b><span>заказов</span></div>
          <div><b>100%</b><span>контроль качества</span></div>
          <div><b>BY</b><span>производство в Беларуси</span></div>
        </section>

        <section className="container-page about-values-polished">
          {[
            ['factory', 'Собственное производство', 'Контролируем процесс от чертежа до готового изделия.'],
            ['tools', 'Изготовление под заказ', 'Подстраиваем размеры, цвет и конструкцию под задачу.'],
            ['shield', 'Надежность', 'Проверяем металл, покрытие, крепления и сборку.'],
            ['truck', 'Доставка', 'Организуем передачу заказа по Беларуси.']
          ].map(([icon, title, text]) => (
            <article key={title}><Icon name={icon as any} /><h2>{title}</h2><p>{text}</p></article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
