import { AdminServicesClient } from '@/components/AdminServicesClient';
import { getServicesControlSettings } from '@/lib/servicesControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Редактирование услуги | Админка Bullmet' };

export default async function AdminServiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminServicesClient initialSettings={await getServicesControlSettings()} initialEditorId={id} />;
}
