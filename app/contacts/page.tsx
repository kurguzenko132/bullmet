import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, Wrench } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { ContactsFaq } from '@/components/ContactsFaq';

export const metadata = {
  title: 'Контакты Bullmet — настенные часы собственного производства',
  description: 'Контакты Bullmet: телефон, адрес производства, режим работы и консультация по настенным часам.'
};

const contacts = [
  { icon: Phone, title: 'Телефон', value: '+375 29 802 70 61', note: 'Связь по вопросам заказа и наличия', href: 'tel:+375298027061' },
  { icon: Send, title: 'Telegram', value: '@bullmet_by', note: 'Быстрые вопросы и консультации', href: 'https://t.me/bullmet_by' },
  { icon: Mail, title: 'Email', value: 'info@bullmet.by', note: 'Для сообщений, файлов и уточнений', href: 'mailto:info@bullmet.by' },
  { icon: MapPin, title: 'Адрес', value: 'Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А', note: 'Производство Bullmet', href: 'https://maps.google.com/?q=Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А' }
];

const benefits = [
  { icon: MessageCircle, title: 'Быстро отвечаем', text: 'В рабочее время' },
  { icon: ShieldCheck, title: 'Помогаем с выбором', text: 'Подскажем подходящую модель' },
  { icon: Wrench, title: 'Индивидуальные вопросы', text: 'Уточним детали по изделию' }
];

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="contacts-story-page">
        <section className="contacts-story-hero">
          <div className="contacts-story-copy">
            <nav className="contacts-story-breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>›</span><span>Контакты</span></nav>
            <p className="contacts-story-kicker">Контакты</p>
            <h1>Будем рады вашему обращению</h1>
            <p className="contacts-story-lead">Ответим на вопросы, поможем с выбором настенных часов и подскажем детали по изделиям Bullmet. Свяжитесь с нами удобным способом.</p>
            <div className="contacts-story-benefits">
              {benefits.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{text}</p></div></article>)}
            </div>
          </div>
          <div className="contacts-story-hero-image"><Image src="/assets/hero-machine.jpg" alt="Производство Bullmet" fill priority sizes="(max-width: 767px) 100vw, 55vw" /></div>
        </section>

        <section className="contacts-story-cards" aria-label="Способы связи">
          {contacts.map(({ icon: Icon, title, value, note, href }) => <article key={title}><Icon aria-hidden="true" /><h2>{title}</h2><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{value}</a><p>{note}</p></article>)}
        </section>

        <section className="contacts-story-main">
          <aside className="contacts-story-map">
            <div className="contacts-story-map-card"><MapPin aria-hidden="true" /><div><b>Наш адрес</b><p>Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А</p><span>ПН–ПТ: 9:00–18:00</span></div></div>
            <div className="contacts-story-map-pin"><span>⌖</span><b>BULLMET</b></div>
            <a href="https://maps.google.com/?q=Брестская обл., Ивацевичский р-н, д. Булла, ул. Школьная 10А" target="_blank" rel="noreferrer">Открыть в картах</a>
          </aside>
          <div className="contacts-story-form"><h2>Напишите нам</h2><p>Оставьте контакты и вопрос — мы свяжемся с вами и подскажем детали.</p><ContactForm /></div>
        </section>

        <section className="contacts-story-faq"><p className="contacts-story-kicker">Частые вопросы</p><h2>Возможно, здесь уже есть ответ</h2><ContactsFaq /></section>

        <section className="contacts-story-cta">
          <Image src="/assets/hero-machine.jpg" alt="Детали производства Bullmet" fill sizes="100vw" />
          <div className="contacts-story-cta-content"><p className="contacts-story-kicker">Остались вопросы?</p><h2>Мы всегда на связи</h2><p>Напишите нам или позвоните — поможем с выбором, подскажем по наличию и ответим на вопросы.</p><div><a href="https://t.me/bullmet_by" target="_blank" rel="noreferrer"><Send aria-hidden="true" />Написать в Telegram</a><a href="tel:+375298027061"><Phone aria-hidden="true" />Позвонить</a></div></div>
          <ul className="contacts-story-cta-list"><li><CheckCircle2 />Консультация по моделям</li><li><CheckCircle2 />Помощь в подборе</li><li><CheckCircle2 />Ответ в кратчайшие сроки</li></ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
