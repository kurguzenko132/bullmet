import { AdminModulePage } from '@/components/AdminModulePage';
import { getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отчеты | Админка Bullmet' };

export default async function AdminReportsPage() {
  const overview = await getBackupOverview();

  return (
    <AdminModulePage
      eyebrow="Отчеты"
      title="Отчеты и выгрузки"
      description="Быстрая сводка по данным сайта и готовые выгрузки для таблиц."
      metrics={[
        { label: 'товаров', value: overview.products, hint: 'в каталоге/админке' },
        { label: 'заказов', value: overview.orders, hint: 'в CRM' },
        { label: 'заявок', value: overview.requests, hint: 'из форм сайта' },
        { label: 'CMS-страниц', value: overview.pages, hint: 'созданы через админку' }
      ]}
      actions={[
        { label: 'Экспорт данных', href: '/admin/backup', primary: true },
        { label: 'Скачать полный JSON', href: '/api/admin/export?type=all&format=json', external: true },
        { label: 'Товары CSV', href: '/api/admin/export?type=products&format=csv', external: true },
        { label: 'Заказы CSV', href: '/api/admin/export?type=orders&format=csv', external: true }
      ]}
      checklist={[
        'Скачать полный JSON перед массовыми изменениями.',
        'Выгрузить товары в CSV перед обновлением цен.',
        'Сверить заказы и заявки перед передачей менеджеру.'
      ]}
    />
  );
}
