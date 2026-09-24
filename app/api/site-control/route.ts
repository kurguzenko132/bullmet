import { NextResponse } from 'next/server';
import { getSiteControlSettings, visibleDirections, visibleNavigation } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSiteControlSettings();
  return NextResponse.json({
    settings: {
      general: { logoText: settings.general.logoText, tagline: settings.general.tagline },
      contacts: {
        phone: settings.contacts.phone,
        email: settings.contacts.email,
        address: settings.contacts.address,
        hours: settings.contacts.hours,
        telegram: settings.contacts.telegram,
        instagram: settings.contacts.instagram
      },
      directions: visibleDirections(settings).map(({ key, title, href, visible, order }) => ({ key, title, href, visible, order })),
      navigation: (['header', 'mobile', 'footer'] as const).flatMap((location) => visibleNavigation(settings, location)).map(({ id, label, href, location, visible, order }) => ({ id, label, href, location, visible, order }))
    }
  });
}
