import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Контакты', description: 'Свяжитесь с Bullmet для заказа изделий или расчета резки.' };

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="container-page py-10">
        <p className="text-sm text-bull-muted">Главная › Контакты</p>
        <h1 className="mt-4 text-5xl font-black">Контакты</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="contact-info-card">
            <p><b>Адрес:</b><br />г. Минск, ул. Промышленная, 11</p>
            <p><b>Телефон:</b><br />+375 29 123-45-67</p>
            <p><b>Email:</b><br />info@bullmet.by</p>
            <p><b>Режим работы:</b><br />Пн–Пт 9:00–18:00</p>
          </div>
          <div className="contact-map-card"><span>Bullmet на карте</span></div>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
