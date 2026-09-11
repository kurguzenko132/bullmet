import { AdminProductionClient } from '@/components/AdminProductionClient';
import { getProductionControlSettings } from '@/lib/productionControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Производство | Админка Bullmet' };

export default async function AdminProductionPage() { return <AdminProductionClient initialSettings={await getProductionControlSettings()} />; }
