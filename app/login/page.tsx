import type { Metadata } from 'next';
import { AuthPage } from '@/components/AuthPage';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Вход в аккаунт Bullmet.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthPage />;
}
