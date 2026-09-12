import { NextResponse } from 'next/server';
import { getSiteControlSettings, visibleDeliveryMethods } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSiteControlSettings();
  return NextResponse.json({
    methods: visibleDeliveryMethods(settings),
    settings: settings.commerce.deliverySettings,
    address: settings.contacts.address,
    hours: settings.contacts.hours
  });
}
