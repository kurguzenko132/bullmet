import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Контакты Bullmet: телефон, email, адрес производства и время работы.',
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return (
    <InfoPage
      eyebrow="Контакты"
      title="Связаться с Bullmet"
      description="Напишите нам, если хотите купить готовое изделие, заказать резку металла или дерева, обсудить индивидуальный проект."
      sections={[
        { title: 'Телефон', text: '+375 29 123-45-67. Перед запуском замените номер на актуальный контакт компании.' },
        { title: 'Email', text: 'info@bullmet.by. Используйте эту почту для заявок, чертежей, фото и коммерческих предложений.' },
        { title: 'Адрес', text: 'г. Минск, ул. Промышленная, 11. Адрес указан как пример, перед публикацией замените его на реальный.' },
        { title: 'Время работы', text: 'Пн–Пт: 9:00 — 18:00. Заявки на сайте принимаются круглосуточно.' },
      ]}
    />
  );
}
