import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/HomePage';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Контакты Bullmet',
  description: 'Контакты Bullmet: заявка на расчет, телефон, email, адрес производства и время работы.',
  alternates: { canonical: '/contacts' },
};

const contacts = [
  { icon: PhoneIcon, title: 'Телефон', text: '+375 29 123-45-67' },
  { icon: MailIcon, title: 'Email', text: 'info@bullmet.by' },
  { icon: PinIcon, title: 'Адрес производства', text: 'Беларусь, адрес производства будет указан перед запуском' },
  { icon: ClockIcon, title: 'Время работы', text: 'Пн–Пт: 9:00 — 18:00, заявки на сайте принимаются круглосуточно' },
];

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="innerPage">
        <section className="container innerHero">
          <p className="sectionLabel">Контакты</p>
          <h1>Связаться с Bullmet</h1>
          <p>Напишите нам, если хотите купить готовое изделие, заказать резку металла или дерева, обсудить индивидуальный проект.</p>
          <div className="innerHero__actions">
            <Link className="button button--orange" href="/request">Заказать расчет</Link>
            <Link className="button button--outline" href="/catalog">Открыть каталог</Link>
          </div>
        </section>
        <section className="container contactGrid">
          {contacts.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <section className="container contactPanel">
          <div><h2>Нужен расчет изделия?</h2><p>Опишите задачу, прикрепите фото или чертеж, укажите размеры и материал — менеджер свяжется с вами для уточнения деталей.</p></div>
          <Link className="button button--orange" href="/request">Заполнить заявку</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
