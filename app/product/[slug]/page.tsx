import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { products } from '@/lib/data';

export function generateStaticParams() { return products.map(p => ({ slug: p.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = products.find(p => p.slug === params.slug);
  return { title: product?.title || 'Товар', description: product?.description };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find(p => p.slug === params.slug);
  if (!product) notFound();
  return <><Header/><main className="container-page py-10"><p className="text-sm text-bull-muted">Главная › Каталог › {product.title}</p><section className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]"><div className="grid gap-4 md:grid-cols-[110px_1fr]"><div className="hidden space-y-3 md:block">{[1,2,3,4].map(i => <Image key={i} src={product.image} alt="" width={110} height={90} className="border object-cover"/> )}</div><Image src={product.image} alt={product.title} width={900} height={650} className="h-[560px] w-full bg-white object-cover shadow-soft"/></div><div><h1 className="text-5xl font-black">{product.title}</h1><p className="mt-2 text-green-600">● в наличии</p><p className="mt-6 text-3xl font-black">от {product.price} BYN</p><p className="mt-6 text-bull-muted">{product.description}</p><div className="mt-8 grid gap-3 text-sm"><p>✓ Диаметр / размер: под заказ</p><p>✓ Материал: металл, дерево</p><p>✓ Покрытие: порошковая покраска</p><p>✓ Производство: Bullmet</p></div><div className="mt-8 flex gap-3"><button className="bg-bull-orange px-8 py-4 font-bold text-white">В корзину</button><button className="border px-8 py-4 font-bold">Купить в 1 клик</button></div></div></section></main><Footer/></>;
}
