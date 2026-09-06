import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  CheckCircle2,
  Clock3,
  Layers3,
  Paintbrush,
  ShieldCheck,
  ShoppingBag,
  Wrench
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Производство Bullmet — настенные часы из металла и дерева',
  description: 'Как создаются настенные часы Bullmet: металл, дерево, резка, обработка, покраска, сборка и контроль качества.'
};

const facts = [
  { icon: ShieldCheck, title: 'Собственное производство', text: 'Полный цикл работ без лишних посредников.' },
  { icon: Layers3, title: 'Металл + дерево', text: 'Сочетание прочности и тёплой фактуры.' },
  { icon: CheckCircle2, title: 'Контроль перед передачей', text: 'Проверяем внешний вид и сборку каждого изделия.' }
];

const clockParts = {
  left: [
    { icon: Layers3, title: 'Металлическая основа', text: 'Прочный металл обеспечивает форму, жёсткость и долговечность.' },
    { icon: Paintbrush, title: 'Покраска', text: 'Порошковое покрытие защищает металл и сохраняет аккуратный внешний вид.' }
  ],
  right: [
    { icon: Box, title: 'Деревянный элемент', text: 'Добавляет теплоту, фактуру и делает изделие ближе к интерьеру.' },
    { icon: Clock3, title: 'Механизм и стрелки', text: 'Тихий кварцевый механизм и стрелки под выбранный стиль.' },
    { icon: Wrench, title: 'Крепление', text: 'Продуманное крепление для простой установки на стену.' }
  ]
};

const processSteps = [
  { number: '01', title: 'Металл', text: 'Подбираем металл нужной толщины и качества.', image: '/assets/cat-metal.jpg' },
  { number: '02', title: 'Резка', text: 'Вырезаем элементы на современном оборудовании.', image: '/assets/hero-machine.jpg' },
  { number: '03', title: 'Обработка', text: 'Шлифуем края, убираем заусенцы и готовим поверхность.', image: '/assets/production.jpg' },
  { number: '04', title: 'Покраска', text: 'Наносим покрытие для ровного цвета и защиты.', image: '/assets/service-metal.jpg' },
  { number: '05', title: 'Сборка', text: 'Соединяем металл, дерево, механизм и стрелки.', image: '/assets/gallery-5.jpg' },
  { number: '06', title: 'Проверка', text: 'Проверяем ход часов, внешний вид и комплектацию.', image: '/assets/prod-clock-classic.jpg' }
];

const results = [
  { title: 'Для дома', text: 'Уютный акцент для гостиной, кухни или спальни.', image: '/assets/result-home.jpg' },
  { title: 'Для офиса', text: 'Строгий элемент интерьера для кабинета или переговорной.', image: '/assets/result-office.jpg' },
  { title: 'Для кафе и ресторанов', text: 'Декор, который поддерживает атмосферу заведения.', image: '/assets/result-cafe.jpg' },
  { title: 'В подарок', text: 'Практичный и запоминающийся подарок.', image: '/assets/result-gift.jpg' }
];

function ClockPoint({ item, side }: { item: { icon: typeof Layers3; title: string; text: string }; side: 'left' | 'right' }) {
  const Icon = item.icon;
  return (
    <article className={`production-clock-point production-clock-point--${side}`}>
      <Icon aria-hidden="true" />
      <div>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>
    </article>
  );
}

export default function ProductionPage() {
  return (
    <>
      <Header />
      <main className="production-story-page">
        <section className="production-story-hero">
          <div className="production-story-hero-copy">
            <nav className="production-story-breadcrumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link><span>›</span><span>Производство</span>
            </nav>
            <p className="production-story-kicker">Производство Bullmet</p>
            <h1>От металла до готовых настенных часов</h1>
            <p className="production-story-lead">
              Мы сами изготавливаем, окрашиваем, собираем и проверяем изделия, чтобы вы получали часы,
              которые будут выглядеть аккуратно и служить долго.
            </p>
            <div className="production-story-actions">
              <Link className="production-story-button production-story-button--accent" href="/catalog">Смотреть каталог</Link>
              <Link className="production-story-button production-story-button--light" href="/contacts">Связаться</Link>
            </div>
          </div>
          <div className="production-story-hero-media">
            <Image src="/assets/hero-bullmet.png" alt="Лазерная резка на производстве Bullmet" fill priority sizes="(max-width: 767px) 100vw, 57vw" />
          </div>
          <div className="production-story-facts">
            {facts.map(({ icon: FactIcon, title, text }) => (
              <article key={title}>
                <FactIcon aria-hidden="true" />
                <div><h2>{title}</h2><p>{text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="production-clock-structure">
          <div className="production-story-section-head">
            <p className="production-story-kicker">Детали</p>
            <h2>Из чего состоят наши часы</h2>
          </div>
          <div className="production-clock-diagram">
            <div className="production-clock-points production-clock-points--left">
              {clockParts.left.map((item) => <ClockPoint item={item} side="left" key={item.title} />)}
            </div>
            <div className="production-clock-image">
              <Image src="/assets/production-clock-numeral-clean.png" alt="Настенные часы Bullmet с крупными цифрами" fill sizes="(max-width: 767px) 80vw, 500px" />
            </div>
            <div className="production-clock-points production-clock-points--right">
              {clockParts.right.map((item) => <ClockPoint item={item} side="right" key={item.title} />)}
            </div>
          </div>
        </section>

        <section className="production-process-dark">
          <div className="production-process-head">
            <h2>Как создаются наши часы</h2>
          </div>
          <div className="production-process-timeline">
            {processSteps.map((step) => (
              <article className="production-process-step" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <div className="production-process-step-image"><Image src={step.image} alt="" fill sizes="(max-width: 767px) 100vw, 16vw" /></div>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="production-result-section">
          <div className="production-story-section-head">
            <h2>Готовый результат</h2>
            <p>Создаём часы для разных интерьеров, задач и подарков.</p>
          </div>
          <div className="production-result-grid">
            {results.map((item) => (
              <article className="production-result-card" key={item.title}>
                <div><Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, 21vw" /></div>
                <h3>{item.title}</h3><p>{item.text}</p>
              </article>
            ))}
            <aside className="production-result-cta">
              <ShoppingBag aria-hidden="true" />
              <h2>Выберите свои часы</h2>
              <p>Перейдите в каталог и найдите модель под ваш интерьер.</p>
              <Link className="production-story-button production-story-button--accent" href="/catalog">Смотреть каталог</Link>
            </aside>
          </div>
        </section>

        <section className="production-brand-strip">
          <div className="production-brand-intro"><ShieldCheck aria-hidden="true" /><p><strong>Bullmet</strong> — это сочетание металла, дерева и внимательного отношения к деталям.</p></div>
          <div className="production-brand-features">
            <span><Layers3 aria-hidden="true" />Качественные материалы</span>
            <span><Wrench aria-hidden="true" />Современное оборудование</span>
            <span><Paintbrush aria-hidden="true" />Аккуратная сборка</span>
            <span><CheckCircle2 aria-hidden="true" />Контроль качества</span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
