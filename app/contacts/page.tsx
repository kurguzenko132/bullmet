import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { ClockIcon, DraftIcon, FactoryIcon, MailIcon, PhoneIcon, PinIcon, ShieldIcon, ToolsIcon, TruckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Контакты Bullmet — связаться с производством',
  description: 'Контакты Bullmet: телефон, email, заявка на расчет, адрес производства, время работы, доставка и быстрые способы связи.',
  alternates: { canonical: '/contacts' },
};

const contactCards = [
  {
    icon: PhoneIcon,
    title: 'Телефон',
    text: '+375 29 123-45-67',
    note: 'Для заказов, уточнения наличия и консультаций по изделиям.',
    href: 'tel:+375291234567',
    action: 'Позвонить',
  },
  {
    icon: MailIcon,
    title: 'Email',
    text: 'info@bullmet.by',
    note: 'Можно отправить описание задачи, фото, размеры или чертеж.',
    href: 'mailto:info@bullmet.by',
    action: 'Написать',
  },
  {
    icon: PinIcon,
    title: 'Производство',
    text: 'Беларусь, адрес производства будет указан перед запуском',
    note: 'Самовывоз и встреча по предварительному согласованию.',
    href: '/request',
    action: 'Согласовать визит',
  },
  {
    icon: ClockIcon,
    title: 'Время работы',
    text: 'Пн–Пт: 9:00 — 18:00',
    note: 'Заявки через сайт принимаются круглосуточно.',
    href: '/request',
    action: 'Оставить заявку',
  },
];

const quickTopics = [
  { icon: FactoryIcon, title: 'Готовые изделия', text: 'Настенные часы, садовые качели, декор и товары из каталога.' },
  { icon: ToolsIcon, title: 'Резка металла и дерева', text: 'Расчет по размерам, эскизу, фото, макету или чертежу.' },
  { icon: DraftIcon, title: 'Изделия на заказ', text: 'Индивидуальная форма, цвет, размер, материал и тематика.' },
  { icon: TruckIcon, title: 'Доставка и самовывоз', text: 'Подберем удобный вариант получения после готовности заказа.' },
];

const steps = [
  { title: 'Опишите задачу', text: 'Напишите, что хотите заказать: готовое изделие, резку, часы, качели или индивидуальный проект.' },
  { title: 'Приложите материалы', text: 'Фото, эскиз, пример, размеры или файл помогут быстрее подготовить расчет.' },
  { title: 'Получите ответ', text: 'Мы уточним детали, подскажем по материалам, срокам и стоимости.' },
];

const departments = [
  { title: 'Каталог и наличие', text: 'Вопросы по готовым товарам, цветам, размерам и срокам изготовления.' },
  { title: 'Индивидуальный расчет', text: 'Резка металла, резка дерева, изделия по фото, эскизу или чертежу.' },
  { title: 'Доставка и получение', text: 'Самовывоз, передача заказа, упаковка и доставка по Беларуси.' },
];

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="contactsPage">
        <section className="contactsHero">
          <div className="container contactsHero__grid">
            <div className="contactsHero__content">
              <p className="sectionLabel">Контакты Bullmet</p>
              <h1>Свяжитесь с производством</h1>
              <p>
                Поможем выбрать готовое изделие, рассчитать резку металла или дерева, обсудить часы, качели, декор и индивидуальный заказ по вашей идее.
              </p>
              <div className="contactsHero__actions">
                <Link className="button button--orange" href="/request">Заказать расчет</Link>
                <Link className="button button--outline" href="/catalog">Перейти в каталог</Link>
              </div>
            </div>
            <div className="contactsHero__side">
              <div className="contactsHero__image">
                <Image src="/assets/production.jpg" alt="Производство Bullmet" fill priority sizes="(max-width: 900px) 100vw, 44vw" />
              </div>
              <div className="contactsHero__badge">
                <ShieldIcon />
                <span>Перед запуском уточняем размеры, материал, цвет, сроки и способ получения заказа.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container contactsCards" aria-label="Основные контакты Bullmet">
          {contactCards.map(({ icon: Icon, title, text, note, href, action }) => (
            <article key={title}>
              <Icon />
              <h2>{title}</h2>
              <strong>{text}</strong>
              <p>{note}</p>
              <Link href={href}>{action}</Link>
            </article>
          ))}
        </section>

        <section className="container contactsRequestBlock">
          <div className="contactsRequestBlock__content">
            <p className="sectionLabel">Быстрая заявка</p>
            <h2>Самый удобный способ получить расчет — отправить задачу через форму</h2>
            <p>
              Опишите изделие, укажите размеры и материал, приложите фото или чертеж. Так мы быстрее поймем задачу и подготовим ответ без лишней переписки.
            </p>
            <div className="contactsRequestBlock__actions">
              <Link className="button button--orange" href="/request">Заполнить заявку</Link>
              <Link className="button button--outline" href="/services">Смотреть услуги</Link>
            </div>
          </div>
          <div className="contactsSteps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contactsDarkSection">
          <div className="container contactsDarkSection__grid">
            <div>
              <p className="sectionLabel">С чем можно обратиться</p>
              <h2>Разделим вопрос по направлению и быстро сориентируем по следующему шагу</h2>
            </div>
            <div className="contactsTopicGrid">
              {quickTopics.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container contactsInfoSplit">
          <div className="contactsMapCard">
            <div className="contactsMapCard__map">
              <PinIcon />
              <div>
                <b>Карта будет подключена перед запуском</b>
                <span>Здесь можно разместить Яндекс/Google карту, точку производства или схему проезда.</span>
              </div>
            </div>
            <div className="contactsMapCard__details">
              <h2>Адрес и самовывоз</h2>
              <p>
                Точный адрес производства и условия самовывоза лучше согласовать заранее. Для индивидуальных заказов встреча возможна после уточнения задачи и времени.
              </p>
            </div>
          </div>

          <div className="contactsDepartments">
            <p className="sectionLabel">Куда писать</p>
            <h2>Основные темы обращений</h2>
            <div>
              {departments.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container contactsFinalCta">
          <div>
            <h2>Есть фото, чертеж или просто идея?</h2>
            <p>Отправьте заявку — мы подскажем, как лучше реализовать изделие, какие материалы подойдут и сколько это может стоить.</p>
          </div>
          <Link className="button button--orange" href="/request">Начать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
