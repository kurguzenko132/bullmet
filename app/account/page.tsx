import type { Metadata } from 'next';
import { AccountDashboardPage } from '@/components/AccountDashboardPage';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Личный кабинет покупателя Bullmet.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountDashboardPage />;
}
