import { AdminSiteSettingsClient } from '@/components/AdminSiteSettingsClient';
import { getTelegramDiagnostics } from '@/lib/notifications';
import { getSiteControlSettings } from '@/lib/siteControl';
import { isSupabaseConfigured } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Настройки сайта | Админка Bullmet' };

export default async function AdminSettings() {
  const telegram = getTelegramDiagnostics();
  const settings = await getSiteControlSettings();

  return (
    <AdminSiteSettingsClient
      initialSettings={settings}
      diagnostics={{
        supabaseConfigured: isSupabaseConfigured(),
        telegramConfigured: telegram.configured,
        adminEmailConfigured: Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS),
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || ''
      }}
    />
  );
}
