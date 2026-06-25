import { AdminModulePage } from '@/components/AdminModulePage';
import { getSiteControlSettings, visibleNavigation } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Страницы | Админка Bullmet' };

export default async function AdminPagesPage() {
  const settings = await getSiteControlSettings();
  const header = visibleNavigation(settings, 'header').length;
  const mobile = visibleNavigation(settings, 'mobile').length;
  const footer = visibleNavigation(settings, 'footer').length;

  return (
    <AdminModulePage
      eyebrow="Страницы"
      title="Публичные страницы сайта"
      description="Карта рабочих страниц Bullmet и быстрые переходы к разделам, которые ими управляют."
      metrics={[
        { label: 'пунктов в шапке', value: header, hint: 'управляются в настройках сайта' },
        { label: 'пунктов в мобильном меню', value: mobile, hint: 'быстрая нижняя навигация' },
        { label: 'пунктов в футере', value: footer, hint: 'дополнительные ссылки' }
      ]}
      actions={[
        { label: 'Настройки сайта', href: '/admin/settings', primary: true },
        { label: 'Главная страница', href: '/admin/homepage' },
        { label: 'Категории', href: '/admin/categories' },
        { label: 'Баннеры', href: '/admin/banners' },
        { label: 'Открыть главную', href: '/', external: true },
        { label: 'Открыть каталог', href: '/catalog', external: true },
        { label: 'Открыть контакты', href: '/contacts', external: true }
      ]}
      checklist={[
        'Проверить, что скрытые пункты меню не видны клиенту.',
        'Проверить, что /services скрыт, если услуги не готовы.',
        'Проверить title/description после изменения SEO-настроек.'
      ]}
    />
  );
}
