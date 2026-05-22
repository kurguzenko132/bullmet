import type { Metadata } from 'next';
import { RegisterPage } from '@/components/RegisterPage';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Регистрация аккаунта Bullmet.',
  robots: { index: false, follow: false },
};

export default function RegisterRoutePage() {
  return <RegisterPage />;
}
