import type { Metadata } from 'next';
import { ContactsPageContent } from '@/components/ContactsPageContent';

export const metadata: Metadata = {
  title: 'Контакты Bullmet — связаться с производством',
  description: 'Контакты Bullmet: телефон, email, заявка на расчет, адрес производства, время работы, доставка и быстрые способы связи.',
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return <ContactsPageContent />;
}
