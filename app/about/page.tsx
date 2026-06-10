import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'О компании Bullmet — производство изделий из металла с элементами дерева',
  description: 'Bullmet — белорусское производство настенных часов, садовой мебели, мебели лофт, качелей, навесов, лазерной резки и изделий из металла под заказ.'
};

const facts = [
  ['7+', 'лет опыта в изготовлении'],
  ['1000+', 'выполненных заказов'],
  ['BY', 'производство в Беларуси'],
  ['1 проект', 'от идеи до готового изделия']
];

const values = [
  {
    icon: 'factory',
    title: 'Делаем сами',
    text: 'Мы не просто продаем картинки из каталога. Изделия проходят через собственное производство: подготовку, резку, обработку, сборку и контроль.'
  },
  {
    icon: 'custom',
    title: 'Работаем под задачу',
    text: 'Можно изменить размер, цвет, материал, конструкцию или заказать изделие по фото, эскизу, ссылке на пример или чертежу.'
  },
  {
    icon: 'shield',
    title: 'Контролируем качество',
    text: 'Проверяем геометрию, покрытие, крепления и внешний вид, чтобы изделие было не только красивым, но и пригодным для реального использования.'
  },
  {
    icon: 'truck',
    title: 'Передаем удобно',
    text: 'Согласовываем самовывоз или доставку по Беларуси, помогаем с деталями заказа и остаемся на связи после передачи изделия.'
  }
];

const directions = [
  'настенные часы из металла с элементами дерева',
  'садовая мебель, качели и малые архитектурные формы',
  'мебель для дома в стиле лофт',
  'навесы, каркасы и металлические конструкции',
  'художественная лазерная резка из листового металла',
  'гибка металла и изготовление деталей под заказ'
];

const principles = [
  ['Честный расчет', 'Сначала уточняем задачу, потом считаем стоимость. Без случайных обещаний и непонятных доплат.'],
  ['Понятный процесс', 'Объясняем, какой материал подойдет, какие размеры лучше выбрать и что влияет на итоговую цену.'],
  ['Аккуратный внешний вид', 'Для нас важно, чтобы изделие выглядело уместно: в доме, на участке, в салоне, кафе или офисе.'],
  ['Практичность', 'Думаем не только о дизайне, но и о прочности, креплениях, покрытии и удобстве эксплуатации.']
];

const steps = [
  ['01', 'Вы оставляете заявку', 'Через сайт, телефон, мессенджер или форму расчета.'],
  ['02', 'Мы уточняем детали', 'Размер, материал, цвет, назначение, сроки и пожелания.'],
  ['03', 'Считаем стоимость', 'Предлагаем оптимальный вариант под задачу и бюджет.'],
  ['04', 'Изготавливаем', 'Запускаем изделие в работу и контролируем этапы производства.'],
  ['05', 'Передаем заказ', 'Согласовываем самовывоз или доставку по Беларуси.']
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="about-page about-page--rich">
        <section className="about-hero-rich">
          <div className="about-hero-text">
            <nav className="about-breadcrumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link>
              <span>›</span>
              <span>О компании</span>
            </nav>
            <p className="section-kicker">Bullmet</p>
            <h1>Производство изделий из металла с элементами дерева</h1>
            <p>
              Мы изготавливаем настенные часы, садовую мебель, мебель лофт, качели,
              навесы, малые архитектурные формы и изделия под заказ. Работаем с
              металлом, элементами дерева и индивидуальными задачами клиентов.
            </p>
            <div className="about-hero-actions">
              <Link href="/catalog">Смотреть каталог</Link>
              <Link href="/services#request">Заказать расчет</Link>
            </div>
          </div>
          <div className="about-hero-photo">
            <Image src="/assets/production.jpg" alt="Производство Bullmet" width={920} height={620} priority />
            <div>
              <b>Собственное производство</b>
              <span>от идеи и чертежа до готового изделия</span>
            </div>
          </div>
        </section>

        <section className="about-facts-rich" aria-label="Факты о компании">
          {facts.map(([value, label]) => (
            <article key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section className="about-story-rich">
          <div>
            <p className="section-kicker">Кто мы</p>
            <h2>Мы делаем изделия, которые должны выглядеть хорошо и служить долго</h2>
          </div>
          <div>
            <p>
              Bullmet — это производство, где можно заказать готовое изделие из каталога
              или сделать вещь под конкретное место: дом, участок, салон, кафе, офис или
              подарок. Нам важно, чтобы клиент понимал, из чего сделано изделие, как оно
              будет выглядеть и почему такая конструкция подойдет именно под его задачу.
            </p>
            <p>
              Мы не гонимся за лишней сложностью. Наша задача — сделать аккуратно,
              надежно и понятно: подобрать материал, согласовать внешний вид, изготовить
              изделие и передать его в готовом виде.
            </p>
          </div>
        </section>

        <section className="about-values-rich">
          {values.map((item) => (
            <article key={item.title}>
              <Icon name={item.icon as any} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="about-directions-rich">
          <div className="about-directions-card">
            <p className="section-kicker">Что можно заказать</p>
            <h2>Основные направления Bullmet</h2>
            <p>
              Мы работаем как с готовыми товарами, так и с индивидуальными изделиями.
              Можно выбрать товар из каталога или прислать пример того, что нужно изготовить.
            </p>
            <Link href="/services#request">Отправить задачу на расчет</Link>
          </div>
          <div className="about-directions-list">
            {directions.map((item) => <article key={item}>✓ {item}</article>)}
          </div>
        </section>

        <section className="about-principles-rich">
          <div className="about-section-head">
            <p className="section-kicker">Подход</p>
            <h2>На чем держится работа</h2>
          </div>
          <div className="about-principles-grid">
            {principles.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-process-rich">
          <div className="about-section-head">
            <p className="section-kicker">Как работаем</p>
            <h2>Понятный путь от заявки до готового изделия</h2>
          </div>
          <div className="about-process-grid">
            {steps.map(([number, title, text]) => (
              <article key={number}>
                <b>{number}</b>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-gallery-rich">
          <Image src="/assets/prod-clock-loft.jpg" alt="Настенные часы Bullmet" width={500} height={360} />
          <Image src="/assets/prod-swing.jpg" alt="Садовые качели Bullmet" width={500} height={360} />
          <Image src="/assets/service-metal.jpg" alt="Лазерная резка Bullmet" width={500} height={360} />
        </section>

        <section className="about-cta-rich">
          <div>
            <p className="section-kicker">Хотите изделие под себя?</p>
            <h2>Пришлите идею, фото или чертеж — рассчитаем стоимость</h2>
            <span>Подскажем по материалу, размеру, цвету, срокам и возможным вариантам изготовления.</span>
          </div>
          <Link href="/services#request">Заказать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
