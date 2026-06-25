import { AdminModulePage } from '@/components/AdminModulePage';
import { getAdminOrders, getAdminRequests } from '@/lib/adminCommerce';
import { getAdminProfiles } from '@/lib/adminPeople';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Покупатели | Админка Bullmet' };

export default async function AdminCustomersPage() {
  const [profiles, orders, requests] = await Promise.all([getAdminProfiles(), getAdminOrders(), getAdminRequests()]);
  const customers = profiles.filter((profile) => !profile.role || profile.role === 'customer').length;
  const orderPhones = new Set(orders.map((order) => order.customer?.phone).filter(Boolean)).size;
  const requestPhones = new Set(requests.map((request) => request.customer?.phone).filter(Boolean)).size;

  return (
    <AdminModulePage
      eyebrow="Покупатели"
      title="Клиенты и покупатели"
      description="Сводка по клиентам из профилей, заказов и заявок. Полная CRM-карточка клиента будет следующим крупным развитием."
      metrics={[
        { label: 'профилей клиентов', value: customers, hint: 'роль customer' },
        { label: 'телефонов из заказов', value: orderPhones, hint: 'уникальные контакты' },
        { label: 'телефонов из заявок', value: requestPhones, hint: 'потенциальные клиенты' }
      ]}
      actions={[
        { label: 'Пользователи', href: '/admin/users', primary: true },
        { label: 'Заказы', href: '/admin/orders' },
        { label: 'Заявки', href: '/admin/requests' },
        { label: 'Экспорт пользователей', href: '/api/admin/export?type=users&format=csv', external: true }
      ]}
      checklist={[
        'Проверить, что телефоны клиентов сохраняются в заказах и заявках.',
        'Перед рекламой сделать тестовый заказ и тестовую заявку.',
        'Экспортировать клиентов перед массовыми изменениями.'
      ]}
    />
  );
}
