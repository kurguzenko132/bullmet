import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Производство Bullmet — настенные часы из металла с элементами дерева',
  description: 'Собственное производство Bullmet в Беларуси. Первый публичный запуск — настенные часы из металла с элементами дерева.'
};

const stats = [
  ['BY', 'производство в Беларуси'],
  ['2017', 'опыт производства'],
  ['100%', 'контроль качества'],
  ['часы', 'первый публичный запуск']
];

const directions = [
  {
    icon: 'clock',
    title: 'Настенные часы',
    text: 'Сейчас публичный каталог Bullmet сфокусирован на настенных часах из металла с элементами дерева.'
  },
  {
    icon: 'materials',
    title: 'Металл с элементами дерева',
    text: 'Сочетаем металлическую основу, декоративные элементы и аккуратную финишную обработку.'
  },
  {
    icon: 'tools',
    title: 'Подбор размера и оформления',
    text: 'Можно уточнить размер, цвет и оформление модели перед оформлением заказа.'
  },
  {
    icon: 'shield',
    title: 'Контроль перед выдачей',
    text: 'Проверяем внешний вид, сборку, крепление и комплектацию перед передачей клиенту.'
  }
];

const stages = [
  ['01', 'Выбор модели', 'Вы выбираете часы в каталоге или пишете нам, если нужна консультация.'],
  ['02', 'Уточнение деталей', 'Подтверждаем наличие, размер, цвет, срок изготовления и способ получения.'],
  ['03', 'Изготовление', 'Готовим изделие на собственном производстве Bullmet.'],
  ['04', 'Контроль', 'Проверяем внешний вид, сборку и комплектацию.'],
  ['05', 'Передача заказа', 'Согласовываем самовывоз или доставку по Беларуси.']
];

const quality = [
  'проверяем внешний вид и комплектность',
  'согласовываем размер и цвет при необходимости',
  'подбираем аккуратное оформление под интерьер',
  'перед выдачей проверяем качество сборки'
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
            <p className="section-kicker">Производство металлоизделий Bullmet</p>
            <h1>Сейчас запускаем публичный каталог настенных часов</h1>
            <p>
              Bullmet — производство металлоизделий в Беларуси. На первом этапе мы
              показываем клиентам только то направление, которое готовы стабильно продавать:
              настенные часы из металла с элементами дерева.
            </p>
            <div className="production-hero-actions">
              <Link href="/catalog">Смотреть часы</Link>
              <Link href="/contacts">Связаться</Link>
            </div>
          </div>
          <div className="production-hero-media">
            <Image src="/assets/production.jpg" alt="Производство Bullmet" width={980} height={640} priority />
            <div className="production-hero-note">
              <b>Честный запуск</b>
              <span>сначала часы, затем постепенное расширение каталога</span>
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
            <p className="section-kicker">Что видно клиенту сейчас</p>
            <h2>Публичный фокус — настенные часы</h2>
            <span>Мы не перегружаем сайт направлениями, которые пока не готовы полноценно принимать в работу. Информация о других возможностях сохранена в проекте и будет включаться постепенно.</span>
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
            <p className="section-kicker">Подход</p>
            <h2>Делаем меньше направлений, но аккуратнее</h2>
            <p>
              Для первого запуска важно не вводить клиента в заблуждение. Поэтому сайт
              продаёт часы, а остальные производственные направления будут открываться
              по мере готовности ресурсов и процессов.
            </p>
            <ul>
              {quality.map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
            <Link href="/catalog">Перейти в каталог часов</Link>
          </div>
          <div className="production-showcase-gallery">
            <Link href="/catalog">
              <Image src="/assets/prod-clock-loft.jpg" alt="Настенные часы Bullmet" width={420} height={320} />
              <span>Настенные часы</span>
            </Link>
            <Link href="/catalog?category=Кофе и кухня">
              <Image src="/assets/cat-clock.jpg" alt="Часы Bullmet" width={420} height={320} />
              <span>Модели для дома</span>
            </Link>
          </div>
        </section>

        <section className="production-process-rich">
          <div className="production-section-head">
            <p className="section-kicker">Процесс</p>
            <h2>Как проходит заказ часов</h2>
            <span>Клиент выбирает модель, мы уточняем детали и передаём готовые часы удобным способом.</span>
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
