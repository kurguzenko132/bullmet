import type { Metadata } from 'next';
import { AdminHomeSettings } from '../../../components/AdminHomeSettings';

export const metadata: Metadata = {
  title: 'Настройки главной страницы — Bullmet Admin',
  robots: { index: false, follow: false },
};

export default function AdminHomeSettingsRoute() {
  return <AdminHomeSettings />;
}
