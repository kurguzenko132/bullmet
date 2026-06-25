import { AdminModulePage } from '@/components/AdminModulePage';
import { getAuditReport, getBackupOverview } from '@/lib/adminBackup';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Отчеты | Админка Bullmet' };

export default async function AdminReportsPage() {
  const [overview, audit] = await Promise.all([getBackupOverview(), getAuditReport()]);
  const bad = audit.items.filter((item) => item.status === 'bad').length;
  const warn = audit.items.filter((item) => item.status === 'warn').length;

  return (
    <AdminModulePage
      eyebrow="Отчеты"
      title="Отчеты и выгрузки"
      description="Быстрая сводка по готовности сайта, данным и экспортам."
      metrics={[
        { label: 'оценка готовности', value: audit.score, hint: 'из технического аудита' },
        { label: 'критичных проблем', value: bad, hint: 'нужно исправить' },
        { label: 'предупреждений', value: warn, hint: 'желательно проверить' },
        { label: 'товаров', value: overview.products, hint: 'в каталоге/админке' }
      ]}
      actions={[
        { label: 'Резервные копии и аудит', href: '/admin/backup', primary: true },
        { label: 'Скачать полный JSON', href: '/api/admin/export?type=all&format=json', external: true },
        { label: 'Товары CSV', href: '/api/admin/export?type=products&format=csv', external: true },
        { label: 'Заказы CSV', href: '/api/admin/export?type=orders&format=csv', external: true }
      ]}
      checklist={[
        'Перед деплоем открыть /admin/backup и проверить красные пункты.',
        'Скачать полный JSON перед массовыми изменениями.',
        'После деплоя проверить /sitemap.xml и /robots.txt.'
      ]}
    />
  );
}
