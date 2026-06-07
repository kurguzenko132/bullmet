import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getProductBySlug } from '@/lib/products';

export const dynamic = 'force-dynamic';

type ProductPageProps = { params: { slug: string } };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: product?.title || 'Товар Bullmet',
    description: product?.description || 'Товар Bullmet собственного изготовления.'
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="container-page py-10">
        <p className="text-sm text-bull-muted">Главная › Каталог › {product.title}</p>
        <section className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-[110px_1fr]">
            <div className="hidden space-y-3 md:block">
              {[1, 2, 3, 4].map((item) => (
                <img key={item} src={product.image} alt="" className="h-[90px] w-[110px] border object-cover" />
              ))}
            </div>
            <img src={product.image} alt={product.title} className="h-[560px] w-full bg-white object-cover shadow-soft" />
          </div>
          <div>
            <h1 className="text-5xl font-black">{product.title}</h1>
            <p className="mt-2 text-green-600">● в наличии</p>
            <p className="mt-6 text-3xl font-black">от {product.price} BYN</p>
            <p className="mt-6 text-bull-muted">{product.description}</p>
            <div className="mt-8 grid gap-3 text-sm">
              <p>✓ Размер: под заказ</p>
              <p>✓ Материал: {product.material}</p>
              <p>✓ Покрытие: порошковая покраска</p>
              <p>✓ Производство: Bullmet</p>
            </div>
            <div className="mt-8 flex gap-3">
              <button className="bg-bull-orange px-8 py-4 font-bold text-white">В корзину</button>
              <button className="border px-8 py-4 font-bold">Купить в 1 клик</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
