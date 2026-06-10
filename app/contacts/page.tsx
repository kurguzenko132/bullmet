import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Контакты', description: 'Свяжитесь с Bullmet для заказа изделий или расчета резки.' };

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="contacts-page-polished">
        <section className="container-page contacts-hero-polished">
          <p>Главная › Контакты</p>
          <h1>Контакты Bullmet</h1>
          <span>Напишите нам для расчета изделия, консультации по товарам или уточнения сроков изготовления.</span>
        </section>

        <section className="container-page contacts-grid-polished">
          <div className="contacts-info-polished">
            <div><Icon name="pin" /><span>Адрес</span><b>г. Минск, ул. Промышленная, 11</b></div>
            <div><Icon name="phone" /><span>Телефон</span><b>+375 29 123-45-67</b></div>
            <div><Icon name="mail" /><span>Email</span><b>info@bullmet.by</b></div>
            <div><Icon name="clock" /><span>Режим работы</span><b>Пн–Пт 9:00–18:00</b></div>
          </div>
          <div className="contacts-map-polished">
            <div>
              <b>Bullmet на карте</b>
              <span>Здесь можно подключить Google/Yandex карту или оставить ссылку на маршрут.</span>
              <Link href="/services#request">Заказать расчет</Link>
            </div>
          </div>
        </section>

        <section className="container-page contacts-form-section-polished">
          <div>
            <p>Обратная связь</p>
            <h2>Оставьте сообщение</h2>
            <span>Мы свяжемся с вами, уточним задачу и подскажем следующий шаг.</span>
          </div>
          <ContactForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
