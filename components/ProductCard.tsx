import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product }: { product: { slug: string; title: string; price: number; image: string; description: string } }) {
  return (
    <article className="overflow-hidden rounded-sm border border-bull-line bg-white shadow-soft">
      <Link href={`/product/${product.slug}`}>
        <Image src={product.image} alt={product.title} width={600} height={420} className="h-56 w-full object-cover" />
      </Link>
      <div className="p-5">
        <h3 className="text-lg font-bold">{product.title}</h3>
        <p className="mt-2 min-h-10 text-sm text-bull-muted">{product.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <b>от {product.price} BYN</b>
          <button className="grid h-10 w-10 place-items-center border border-bull-orange text-bull-orange"><ShoppingCart size={18}/></button>
        </div>
      </div>
    </article>
  );
}
