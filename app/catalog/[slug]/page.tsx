import { redirect } from 'next/navigation';

export default function LegacyCatalogProductRedirect({ params }: { params: { slug: string } }) {
  redirect(`/product/${params.slug}`);
}
