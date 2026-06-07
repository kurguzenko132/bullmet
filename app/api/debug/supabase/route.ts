import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && supabase);
  if (!configured || !supabase) {
    return NextResponse.json({ configured: false, message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing' });
  }

  const { data, error } = await supabase.from('products').select('id, slug, title, image, images, color_group_id').limit(10);
  return NextResponse.json({
    configured: true,
    productsTableReadable: !error,
    error: error?.message || null,
    rawProductsCount: data?.length || 0,
    sample: data || []
  });
}
