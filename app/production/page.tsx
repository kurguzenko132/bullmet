import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Производство Bullmet', description: 'Собственное производство Bullmet: изделия из металла с элементами дерева, резка и гибка металла.' };

const stages = ['Заявка и чертеж', 'Расчет стоимости', 'Подготовка металла', 'Резка и гибка', 'Покраска и сборка', 'Передача заказа'];

export default function ProductionPage() {
  return (
    <>
      <Header />
      <main className="production-page-polished">
        <section className="container-page production-hero-polished">
          <div>
            <p>Главная › Производство</p>
            <h1>Производство Bullmet</h1>
            <span>Изготавливаем изделия из металла с элементами дерева: от настенных часов до садовой мебели, навесов и декоративных панелей.</span>
            <div><Link href="/services#request">Рассчитать изделие</Link><Link href="/catalog">Каталог</Link></div>
          </div>
          <Image src="/mockup/prod-workshop.jpg" alt="Производство Bullmet" width={900} height={560} />
        </section>

        <section className="container-page production-stage-polished">
          {stages.map((stage, index) => <article key={stage}><b>{String(index + 1).padStart(2, '0')}</b><span>{stage}</span></article>)}
        </section>

        <section className="container-page production-capabilities-polished">
          {[
            ['factory', 'Собственное оборудование', 'Работаем с металлом, элементами дерева и индивидуальными заказами.'],
            ['spark', 'Лазерная резка', 'Делаем декоративные панели, таблички, детали, вывески и элементы конструкций.'],
            ['materials', 'Гибка металла', 'Подготавливаем детали для мебели, навесов, каркасов и малых архитектурных форм.'],
            ['shield', 'Контроль качества', 'Проверяем изделие на каждом этапе перед передачей клиенту.']
          ].map(([icon, title, text]) => <article key={title}><Icon name={icon as any} /><h2>{title}</h2><p>{text}</p></article>)}
        </section>
      </main>
      <Footer />
    </>
  );
}
