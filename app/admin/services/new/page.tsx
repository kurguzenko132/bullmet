import { AdminServicesClient } from '@/components/AdminServicesClient';
import { getServicesControlSettings } from '@/lib/servicesControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Новая услуга | Админка Bullmet' };

export default async function NewAdminServicePage() {
  return <AdminServicesClient initialSettings={await getServicesControlSettings()} createNew />;
}
