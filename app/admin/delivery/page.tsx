import { AdminModulePage } from '@/components/AdminModulePage';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Доставка | Админка Bullmet' };

export default async function AdminDeliveryPage() {
  const site = await getSiteControlSettings();
  return (
    <AdminModulePage
      eyebrow="Доставка"
      title="Доставка и получение"
      description="Контакты и адрес выдачи сейчас управляются в настройках сайта."
      metrics={[
        { label: 'телефон', value: site.contacts.phone || '—', hint: 'для согласования доставки' },
        { label: 'адрес', value: '1', hint: site.contacts.address || 'не указан' },
        { label: 'график', value: site.contacts.hours || '—', hint: 'режим работы' }
      ]}
      actions={[
        { label: 'Настройки контактов', href: '/admin/settings', primary: true },
        { label: 'Заказы', href: '/admin/orders' },
        { label: 'Открыть контакты', href: '/contacts', external: true }
      ]}
      checklist={[
        'Проверить корректность адреса в футере и на странице контактов.',
        'Уточнить способ доставки по Беларуси в карточке товара/корзине.',
        'Проверить телефон для связи.'
      ]}
    />
  );
}
