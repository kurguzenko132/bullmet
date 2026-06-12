import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Контакты Bullmet — заказать расчет изделий из металла',
  description: 'Контакты Bullmet: телефон, email, адрес, режим работы и форма для расчета изделий из металла, лазерной резки, гибки и товаров под заказ.'
};

const contacts = [
  { icon: 'phone', label: 'Телефон', value: '+375 29 123-45-67', href: 'tel:+375291234567', note: 'для звонков и консультаций' },
  { icon: 'mail', label: 'Email', value: 'info@bullmet.by', href: 'mailto:info@bullmet.by', note: 'для чертежей, файлов и задач' },
  { icon: 'pin', label: 'Адрес', value: 'г. Минск, ул. Промышленная, 11', href: 'https://maps.google.com/?q=Минск, ул. Промышленная, 11', note: 'самовывоз по согласованию' },
  { icon: 'clock', label: 'Режим работы', value: 'Пн–Пт 9:00–18:00', href: null, note: 'заявки с сайта принимаются круглосуточно' }
];

const quickReasons = [
  'рассчитать изделие по фото или чертежу',
  'уточнить стоимость лазерной резки',
  'заказать часы, качели или мебель лофт',
  'обсудить индивидуальный размер, цвет и материал'
];

const requestSteps = [
  ['01', 'Опишите задачу', 'Коротко напишите, что хотите изготовить или какой товар интересует.'],
  ['02', 'Приложите детали', 'Можно добавить размеры, фото, ссылку на пример или отправить чертеж на email.'],
  ['03', 'Мы свяжемся', 'Уточним нюансы, сроки и подготовим расчет стоимости.']
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
            <h1>Свяжитесь с нами для расчета или консультации</h1>
            <p>
              Поможем рассчитать изделие из металла с элементами дерева, уточнить
              стоимость лазерной резки, гибки металла, готовых товаров или индивидуального заказа.
            </p>
            <div className="contacts-hero-actions">
              <a href="tel:+375291234567">Позвонить</a>
              <Link href="/services#request">Отправить чертеж</Link>
            </div>
          </div>

          <div className="contacts-hero-card">
            <b>Быстрый расчет</b>
            <span>Пришлите фото, чертеж, ссылку на пример или просто описание задачи.</span>
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
                <h3>Минск, ул. Промышленная, 11</h3>
                <span>Точную точку самовывоза и время приезда лучше согласовать заранее.</span>
                <a href="https://maps.google.com/?q=Минск, ул. Промышленная, 11" target="_blank" rel="noreferrer">Открыть маршрут</a>
              </div>
            </div>

            <div className="contacts-help-rich">
              <h3>Что написать в заявке?</h3>
              <ul>
                <li>что нужно изготовить;</li>
                <li>примерный размер;</li>
                <li>материал или цвет, если уже знаете;</li>
                <li>фото, ссылку на пример или чертеж;</li>
                <li>город и желаемый срок.</li>
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
            <p className="section-kicker">Нужна стоимость?</p>
            <h2>Самый быстрый путь — отправить задачу на расчет</h2>
            <span>Для сложных изделий лучше сразу приложить фото, чертеж или ссылку на пример.</span>
          </div>
          <Link href="/services#request">Заказать расчет</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
