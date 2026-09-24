import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Технические работы | Bullmet', robots: { index: false, follow: false } };

export default async function MaintenancePage() {
  const site = await getSiteControlSettings();
  return <main className="maintenance-page"><section><p>{site.general.logoText || 'BULLMET'}</p><h1>Сайт временно на обслуживании</h1><span>Мы обновляем сайт и скоро вернёмся. Спасибо за понимание.</span></section></main>;
}
