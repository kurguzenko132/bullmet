import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Контакты Bullmet — настенные часы собственного производства',
  description: 'Контакты Bullmet: телефон, адрес, режим работы и консультация по настенным часам собственного производства.'
};

const contacts = [
  { icon: 'phone', label: 'Телефон', value: '+375 29 802 70 61', href: 'tel:+375298027061', note: 'для звонков и консультаций' },
  { icon: 'pin', label: 'Адрес', value: 'Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А', href: 'https://maps.google.com/?q=Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А', note: 'самовывоз по согласованию' },
  { icon: 'clock', label: 'Режим работы', value: 'ПН–ПТ: 9:00–18:00', href: null, note: 'заявки с сайта принимаются круглосуточно' }
];

const quickReasons = [
  'уточнить наличие модели часов',
  'обсудить размер и цвет',
  'узнать сроки изготовления',
  'согласовать самовывоз или доставку'
];

const requestSteps = [
  ['01', 'Вы пишете нам', 'Укажите модель часов или вопрос, который хотите уточнить.'],
  ['02', 'Мы связываемся', 'Подскажем по наличию, размеру, цвету, срокам и способу получения.'],
  ['03', 'Оформляем заказ', 'После согласования вы сможете оформить заказ или забрать готовое изделие.']
];

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="contacts-page contacts-page--rich">
        <section className="contacts-hero-rich">
          <div className="contacts-hero-content">
            <nav className="contacts-breadcrumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link>
              <span>›</span>
              <span>Контакты</span>
            </nav>
            <p className="section-kicker">Контакты Bullmet</p>
            <h1>Свяжитесь с нами по настенным часам</h1>
            <p>
              Подскажем по моделям настенных часов, наличию, срокам изготовления,
              самовывозу и доставке по Беларуси.
            </p>
            <div className="contacts-hero-actions">
              <a href="tel:+375298027061">Позвонить</a>
              <Link href="/catalog">Смотреть часы</Link>
            </div>
          </div>

          <div className="contacts-hero-card">
            <b>Быстрая консультация</b>
            <span>Напишите, какая модель часов интересует, или уточните размер, цвет и сроки.</span>
            <ul>
              {quickReasons.map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
          </div>
        </section>

        <section className="contacts-cards-rich" aria-label="Контактная информация">
          {contacts.map((item) => (
            <article key={item.label}>
              <Icon name={item.icon as any} />
              <span>{item.label}</span>
              {item.href ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>{item.value}</a> : <b>{item.value}</b>}
              <small>{item.note}</small>
            </article>
          ))}
        </section>

        <section className="contacts-main-rich">
          <div className="contacts-form-card-rich">
            <div className="contacts-section-head">
              <p className="section-kicker">Обратная связь</p>
              <h2>Оставьте сообщение</h2>
              <span>Заполните форму — мы свяжемся с вами, уточним детали и подскажем следующий шаг.</span>
            </div>
            <ContactForm />
          </div>

          <aside className="contacts-side-rich">
            <div className="contacts-map-rich">
              <div>
                <p className="section-kicker">Адрес</p>
                <h3>Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А</h3>
                <span>Точную точку самовывоза и время приезда лучше согласовать заранее.</span>
                <a href="https://maps.google.com/?q=Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А" target="_blank" rel="noreferrer">Открыть маршрут</a>
              </div>
            </div>

            <div className="contacts-help-rich">
              <h3>Что написать в заявке?</h3>
              <ul>
                <li>какая модель часов интересует;</li>
                <li>желаемый размер;</li>
                <li>цвет или оформление, если уже знаете;</li>
                <li>ссылку на товар или фото примера;</li>
                <li>город и удобный способ получения.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="contacts-steps-rich">
          {requestSteps.map(([number, title, text]) => (
            <article key={number}>
              <b>{number}</b>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="contacts-cta-rich">
          <div>
            <p className="section-kicker">Нужна консультация?</p>
            <h2>Самый быстрый путь — написать нам по часам</h2>
            <span>Подскажем по наличию, срокам, размеру и доставке.</span>
          </div>
          <Link href="/catalog">Перейти в каталог часов</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
