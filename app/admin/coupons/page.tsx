import { AdminModulePage } from '@/components/AdminModulePage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Купоны и скидки | Админка Bullmet' };

export default function AdminCouponsPage() {
  return (
    <AdminModulePage
      eyebrow="Купоны"
      title="Купоны и скидки"
      description="Раздел подготовлен без битой ссылки. Купоны лучше включать после стабилизации заказов и каталога."
      metrics={[
        { label: 'активных купонов', value: 0, hint: 'модуль ещё не включён' },
        { label: 'скидочных правил', value: 0, hint: 'будет на следующем этапе' },
        { label: 'промо-баннеров', value: 'см. баннеры', hint: 'акции сейчас через /admin/banners' }
      ]}
      actions={[
        { label: 'Баннеры и акции', href: '/admin/banners', primary: true },
        { label: 'Товары', href: '/admin/products' },
        { label: 'Заказы', href: '/admin/orders' }
      ]}
      checklist={[
        'Не включать скидки до проверки цен и маржи.',
        'Акции лучше сначала показывать через баннеры.',
        'Для купонов позже нужна таблица discount_rules/coupons.'
      ]}
    />
  );
}
