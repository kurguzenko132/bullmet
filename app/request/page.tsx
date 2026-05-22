import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequestPage } from '@/components/RequestPage';
import { RequestForm } from '@/components/RequestForm';

export const metadata: Metadata = {
  title: 'Заявка на расчет',
  description: 'Оставьте заявку на расчет изделия, резки металла, резки дерева или индивидуального заказа Bullmet.',
  alternates: { canonical: '/request' },
};

export default function Page() {
  return (
    <RequestPage>
      <Suspense fallback={<div className="requestFormSkeleton">Загрузка формы...</div>}>
        <RequestForm />
      </Suspense>
    </RequestPage>
  );
}
