import { AdminModulePage } from '@/components/AdminModulePage';
import { getHomepageControlSettings } from '@/lib/homepageControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Производство | Админка Bullmet' };

export default async function AdminProductionPage() {
  const home = await getHomepageControlSettings();
  const benefits = home.productionBenefits.filter((item) => item.visible).length;
  const gallery = home.gallery.filter((item) => item.visible).length;

  return (
    <AdminModulePage
      eyebrow="Производство"
      title="Контент о производстве"
      description="Производственные блоки управляются через главную страницу, медиафайлы и категории."
      metrics={[
        { label: 'производственный блок', value: home.productionSection.enabled ? 'ON' : 'OFF', hint: 'видимость на главной' },
        { label: 'преимуществ', value: benefits, hint: 'карточки рядом с производством' },
        { label: 'фото в галерее', value: gallery, hint: 'производственная галерея' }
      ]}
      actions={[
        { label: 'Редактировать главную', href: '/admin/homepage', primary: true },
        { label: 'Медиафайлы', href: '/admin/media' },
        { label: 'Категории', href: '/admin/categories' },
        { label: 'Открыть производство', href: '/production', external: true }
      ]}
      checklist={[
        'Фото производства должны быть реальными или хотя бы не вводить клиента в заблуждение.',
        'На публичном запуске не обещать услуги, которые ещё не готовы.',
        'Проверить текст “с элементами дерева”.'
      ]}
    />
  );
}
