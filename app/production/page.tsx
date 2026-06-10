import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Производство Bullmet — изготовление изделий из металла с элементами дерева',
  description: 'Собственное производство Bullmet: настенные часы, садовая мебель, мебель лофт, навесы, малые архитектурные формы, лазерная резка и гибка металла под заказ.'
};

const stats = [
  ['7+', 'лет опыта'],
  ['1000+', 'изготовленных заказов'],
  ['100%', 'контроль качества'],
  ['1 проект', 'от эскиза до изделия']
];

const directions = [
  {
    icon: 'factory',
    title: 'Изделия собственного производства',
    text: 'Настенные часы, садовая мебель, мебель для дома в стиле лофт, качели, навесы и малые архитектурные формы.'
  },
  {
    icon: 'spark',
    title: 'Художественная лазерная резка',
    text: 'Декор, панно, таблички, вывески, элементы интерьера, детали конструкций и индивидуальные проекты по эскизу.'
  },
  {
    icon: 'materials',
    title: 'Гибка и работа с металлом',
    text: 'Подготовка деталей для мебели, каркасов, навесов, кронштейнов и других изделий под нужный размер.'
  },
  {
    icon: 'custom',
    title: 'Индивидуальные заказы',
    text: 'Работаем по фото, чертежу, ссылке на пример товара или простой идее, которую нужно превратить в изделие.'
  }
];

const stages = [
  ['01', 'Заявка или идея', 'Вы присылаете фото, чертеж, ссылку на пример или коротко описываете задачу.'],
  ['02', 'Уточнение деталей', 'Согласовываем размеры, материал, цвет, покрытие, назначение и желаемые сроки.'],
  ['03', 'Расчет стоимости', 'Подбираем оптимальное решение по цене, прочности и внешнему виду.'],
  ['04', 'Подготовка производства', 'Готовим макет, металл, расходные материалы и запускаем изделие в работу.'],
  ['05', 'Изготовление', 'Выполняем резку, гибку, сварку, обработку, покраску и сборку.'],
  ['06', 'Контроль и передача', 'Проверяем изделие, согласовываем итог и передаем заказ самовывозом или доставкой.']
];

const equipment = [
  ['Лазерная и станочная резка', 'Для декоративных деталей, панно, вывесок, табличек и элементов конструкций.'],
  ['Гибка листового металла', 'Для каркасов, мебельных элементов, навесов и деталей сложной формы.'],
  ['Сварка и сборка', 'Соединяем металлические элементы, проверяем жесткость и аккуратность конструкции.'],
  ['Покраска и финишная обработка', 'Подготавливаем поверхность, подбираем цвет и защищаем изделие от износа.']
];

const quality = [
  'проверяем размеры и геометрию изделия',
  'согласовываем внешний вид до запуска',
  'подбираем материал под условия эксплуатации',
  'контролируем качество покрытия и сборки',
  'помогаем адаптировать изделие под интерьер или участок'
];

const examples = [
  { title: 'Настенные часы', image: '/assets/prod-clock-loft.jpg', href: '/catalog?section=clocks' },
  { title: 'Садовые качели', image: '/assets/prod-swing.jpg', href: '/catalog?section=swings' },
  { title: 'Лазерная резка', image: '/assets/service-metal.jpg', href: '/services#request' },
  { title: 'Декоративные панели', image: '/assets/cat-wood.jpg', href: '/services#request' }
];

export default function ProductionPage() {
  return (
    <>
      <Header />
      <main className="production-page production-page--rich">
        <section className="production-hero-rich">
          <div className="production-hero-content">
            <nav className="production-breadcrumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link>
              <span>›</span>
              <span>Производство</span>
            </nav>
            <p className="section-kicker">Собственное производство Bullmet</p>
            <h1>Изготавливаем изделия из металла с элементами дерева под заказ</h1>
            <p>
              От настенных часов и садовой мебели до лазерной резки, гибки металла,
              навесов и малых архитектурных форм. Берем идею, чертеж или пример и
              доводим изделие до готового результата.
            </p>
            <div className="production-hero-actions">
              <Link href="/services#request">Рассчитать изделие</Link>
              <Link href="/catalog">Смотреть каталог</Link>
            </div>
          </div>
          <div className="production-hero-media">
            <Image src="/assets/production.jpg" alt="Производство Bullmet" width={980} height={640} priority />
            <div className="production-hero-note">
              <b>Работаем под задачу</b>
              <span>размер, цвет, материал и оформление можно адаптировать</span>
            </div>
          </div>
        </section>

        <section className="production-stats-rich" aria-label="Показатели производства">
          {stats.map(([value, label]) => (
            <article key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section className="production-directions-rich">
          <div className="production-section-head">
            <p className="section-kicker">Что производим</p>
            <h2>Основные направления</h2>
            <span>В Bullmet можно заказать как готовое изделие из каталога, так и индивидуальное изготовление под ваш размер, интерьер или участок.</span>
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

        <section className="production-showcase-rich">
          <div>
            <p className="section-kicker">Возможности</p>
            <h2>От декоративной детали до готовой конструкции</h2>
            <p>
              Мы не ограничиваемся одной категорией товаров. На производстве можно
              изготовить изделие по индивидуальному эскизу, повторить пример по фото,
              доработать готовую модель или адаптировать каталог Bullmet под вашу задачу.
            </p>
            <ul>
              {quality.map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
            <Link href="/services#request">Отправить задачу на расчет</Link>
          </div>
          <div className="production-showcase-gallery">
            {examples.map((item) => (
              <Link href={item.href} key={item.title}>
                <Image src={item.image} alt={item.title} width={420} height={320} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="production-process-rich">
          <div className="production-section-head">
            <p className="section-kicker">Процесс</p>
            <h2>Как мы работаем над заказом</h2>
            <span>Процесс построен так, чтобы клиент понимал, за что платит, какие этапы проходит изделие и когда будет готов результат.</span>
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

        <section className="production-equipment-rich">
          <div className="production-equipment-media">
            <Image src="/assets/hero-machine.jpg" alt="Работа с металлом Bullmet" width={780} height={560} />
          </div>
          <div>
            <p className="section-kicker">Оборудование и работа</p>
            <h2>Используем несколько производственных операций</h2>
            <p>
              Для каждого изделия подбирается подходящий набор работ: резка, гибка,
              сварка, обработка, покраска и сборка. Это помогает делать не просто
              красивую картинку, а изделие, которым удобно пользоваться.
            </p>
            <div className="production-equipment-list">
              {equipment.map(([title, text]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="production-quality-rich">
          <div>
            <p className="section-kicker">Контроль качества</p>
            <h2>Проверяем изделие до передачи клиенту</h2>
          </div>
          <div className="production-quality-list">
            <article><Icon name="ruler" /><b>Размеры</b><span>сверяем габариты и посадочные размеры</span></article>
            <article><Icon name="shield" /><b>Покрытие</b><span>проверяем внешний вид и защитный слой</span></article>
            <article><Icon name="tools" /><b>Сборка</b><span>контролируем жесткость, крепления и аккуратность</span></article>
            <article><Icon name="package" /><b>Передача</b><span>готовим изделие к самовывозу или доставке</span></article>
          </div>
        </section>

        <section className="production-cta-rich">
          <div>
            <p className="section-kicker">Есть идея или чертеж?</p>
            <h2>Рассчитаем стоимость изготовления</h2>
            <span>Пришлите фото, ссылку на пример, чертеж или просто описание — подскажем по материалу, срокам и цене.</span>
          </div>
          <Link href="/services#request">Заказать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
