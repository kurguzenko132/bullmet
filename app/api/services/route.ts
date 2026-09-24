import { NextResponse } from 'next/server';
import { getServicesControlSettings, visibleServicesItems } from '@/lib/servicesControl';
import { getSiteControlSettings, isClocksOnly } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, site] = await Promise.all([getServicesControlSettings(), getSiteControlSettings()]);
  const services = isClocksOnly(site) ? [] : visibleServicesItems(settings.services)
    .filter((service) => service.showInNavigation)
    .map((service) => ({ id: service.id, title: service.title, href: `/services/${service.slug}` }));
  return NextResponse.json({ ok: true, services });
}
