import { AdminServicesClient } from '@/components/AdminServicesClient';
import { getServicesControlSettings } from '@/lib/servicesControl';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Услуги | Админка Bullmet' };
export default async function AdminServicesPage() { return <AdminServicesClient initialSettings={await getServicesControlSettings()} />; }
