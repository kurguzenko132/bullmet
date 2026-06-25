import { AdminModulePage } from '@/components/AdminModulePage';
import { getAdminRequests } from '@/lib/adminCommerce';
import { getCatalogControlSettings, visibleCatalogCategories } from '@/lib/catalogControl';
import { getSiteControlSettings, visibleDirections } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Услуги | Админка Bullmet' };

export default async function AdminServicesPage() {
  const [site, catalog, requests] = await Promise.all([getSiteControlSettings(), getCatalogControlSettings(), getAdminRequests()]);
  const serviceDirections = visibleDirections(site).filter((item) => item.key !== 'clocks').length;
  const serviceCategories = visibleCatalogCategories(catalog, 'service').length;

  return (
    <AdminModulePage
      eyebrow="Услуги"
      title="Управление услугами и заявками"
      description="Контролируйте, какие услуги видны клиенту, и обрабатывайте входящие заявки на расчёт."
      metrics={[
        { label: 'видимых направлений', value: serviceDirections, hint: 'из настроек сайта' },
        { label: 'видимых услуг', value: serviceCategories, hint: 'из категорий' },
        { label: 'заявок', value: requests.length, hint: 'в CRM обработке' }
      ]}
      actions={[
        { label: 'Видимость категорий', href: '/admin/categories', primary: true },
        { label: 'Настройки сайта', href: '/admin/settings' },
        { label: 'Заявки', href: '/admin/requests' },
        { label: 'Открыть услуги', href: '/services', external: true }
      ]}
      checklist={[
        'Если старт только с часов — услуги должны быть скрыты.',
        'Если услуга включена, форма заявки должна работать.',
        'Проверить, что услуга не попадает в sitemap, когда скрыта.'
      ]}
    />
  );
}
