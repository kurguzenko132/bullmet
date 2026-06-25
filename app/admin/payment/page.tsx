import { AdminModulePage } from '@/components/AdminModulePage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Оплата | Админка Bullmet' };

export default function AdminPaymentPage() {
  return (
    <AdminModulePage
      eyebrow="Оплата"
      title="Оплата заказов"
      description="Раздел фиксирует текущее состояние оплаты: пока заказы обрабатываются вручную менеджером."
      metrics={[
        { label: 'онлайн-оплата', value: 'OFF', hint: 'не подключена' },
        { label: 'статус оплаты', value: 'CRM', hint: 'через статус заказа' },
        { label: 'ручная обработка', value: 'ON', hint: 'менеджер связывается с клиентом' }
      ]}
      actions={[
        { label: 'Заказы', href: '/admin/orders', primary: true },
        { label: 'Настройки сайта', href: '/admin/settings' },
        { label: 'Резервные копии', href: '/admin/backup' }
      ]}
      checklist={[
        'Проверить статусы “Ожидает оплаты” и “Оплачен”.',
        'Не обещать онлайн-оплату, пока она не подключена.',
        'Перед запуском сделать тестовый заказ.'
      ]}
    />
  );
}
