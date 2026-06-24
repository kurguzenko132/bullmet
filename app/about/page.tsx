import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'О компании Bullmet — производство металлоизделий',
  description: 'Bullmet — производство металлоизделий в Беларуси. Первый публичный запуск сайта сфокусирован на настенных часах из металла с элементами дерева.'
};

const facts = [
  ['BY', 'производство в Беларуси'],
  ['2017', 'опыт производства'],
  ['часы', 'первое публичное направление'],
  ['1 фокус', 'без лишних обещаний']
];

const values = [
  {
    icon: 'factory',
    title: 'Делаем сами',
    text: 'Bullmet — производство металлоизделий. Сейчас публично запускаем направление настенных часов и постепенно будем расширять каталог.'
  },
  {
    icon: 'clock',
    title: 'Фокус на часах',
    text: 'На первом этапе показываем клиентам только то, что готовы стабильно продавать и обрабатывать.'
  },
  {
    icon: 'shield',
    title: 'Не вводим в заблуждение',
    text: 'Информация о следующих направлениях сохранена внутри проекта, но будет включаться публично только по мере готовности.'
  },
  {
    icon: 'truck',
    title: 'Передаём удобно',
    text: 'Согласовываем самовывоз или доставку по Беларуси, остаёмся на связи по заказу.'
  }
];

const directions = [
  'настенные часы из металла с элементами дерева',
  'подбор размера и оформления модели',
  'консультация по наличию и срокам',
  'самовывоз или доставка по Беларуси'
];

const principles = [
  ['Честный запуск', 'Лучше показать меньше направлений, но не обещать клиенту то, что пока не готово к стабильной работе.'],
  ['Понятный каталог', 'Пользователь заходит на сайт и сразу понимает, что сейчас можно купить — настенные часы Bullmet.'],
  ['Постепенное развитие', 'Другие производственные направления останутся внутри проекта и будут открываться позже.'],
  ['Аккуратное качество', 'Для нас важно, чтобы изделие выглядело хорошо и было готово к реальному использованию.']
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
            <h1>Производство металлоизделий с первым фокусом на настенных часах</h1>
            <p>
              Bullmet — производство металлоизделий в Беларуси. Для первого публичного
              запуска сайта мы оставляем в продаже настенные часы из металла с элементами
              дерева, чтобы не перегружать клиентов направлениями, которые будут открываться позже.
            </p>
            <div className="about-hero-actions">
              <Link href="/catalog">Смотреть часы</Link>
              <Link href="/contacts">Связаться</Link>
            </div>
          </div>
          <div className="about-hero-photo">
            <Image src="/assets/production.jpg" alt="Производство Bullmet" width={920} height={620} priority />
            <div>
              <b>Собственное производство</b>
              <span>первый публичный запуск — каталог часов</span>
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
            <h2>Мы запускаемся аккуратно: сначала часы, затем расширение</h2>
          </div>
          <div>
            <p>
              Внутри проекта подготовлены разные производственные направления, но публично
              мы показываем только то, что готовы продавать сейчас. Такой подход помогает
              не вводить клиента в заблуждение и постепенно проверять спрос.
            </p>
            <p>
              Главная задача первого запуска — сделать понятный сайт, где человек может
              выбрать настенные часы, связаться с Bullmet и оформить заказ без лишней путаницы.
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
            <p className="section-kicker">Что доступно сейчас</p>
            <h2>Публичное направление — часы</h2>
            <p>
              Остальные производственные возможности будут подключаться позже, когда будет
              понятно, на какие направления хватает ресурсов и спроса.
            </p>
            <Link href="/catalog">Перейти в каталог часов</Link>
          </div>
          <div className="about-directions-list">
            {directions.map((item) => <article key={item}>✓ {item}</article>)}
          </div>
        </section>

        <section className="about-principles-rich">
          <div className="about-section-head">
            <p className="section-kicker">Подход</p>
            <h2>На чем держится запуск</h2>
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

        <section className="about-gallery-rich about-gallery-rich--clocks">
          <Image src="/assets/prod-clock-loft.jpg" alt="Настенные часы Bullmet" width={500} height={360} />
          <Image src="/assets/prod-clock-classic.jpg" alt="Классические часы Bullmet" width={500} height={360} />
          <Image src="/assets/cat-clock.jpg" alt="Каталог часов Bullmet" width={500} height={360} />
        </section>

        <section className="about-cta-rich">
          <div>
            <p className="section-kicker">Готовы выбрать часы?</p>
            <h2>Откройте каталог настенных часов Bullmet</h2>
            <span>Выберите модель или свяжитесь с нами, если хотите уточнить размер, цвет, сроки и способ получения.</span>
          </div>
          <Link href="/catalog">Смотреть каталог</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
