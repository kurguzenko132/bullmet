'use client';

import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productAvailability, type CatalogProduct } from '@/lib/products';

type InteriorSlide = {
  image: string;
  alt: string;
  product: CatalogProduct;
};

function priceLabel(price: number) {
  return `от ${new Intl.NumberFormat('ru-RU').format(price)} BYN`;
}

const interiorImageSets = {
  left: ['/assets/result-home.jpg', '/assets/result-cafe.jpg'],
  right: ['/assets/result-office.jpg', '/assets/result-gift.jpg']
};
const leftMotions = ['slide-left', 'slide-top', 'slide-right', 'slide-bottom'];
const rightMotions = ['slide-right', 'slide-bottom', 'slide-left', 'slide-top'];

function addToCart(product: CatalogProduct) {
  if (productAvailability(product) === 'unavailable') return;
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(cart) ? cart : [];
    const size = product.sizes?.[0] || 'Под заказ';
    const index = list.findIndex((item) => item.slug === product.slug && item.size === size);
    const item = { productId: product.id, slug: product.slug, title: product.title, price: product.price, oldPrice: product.oldPrice, image: product.image, material: product.material, size, availability: productAvailability(product), quantity: 1 };
    const next = index >= 0
      ? list.map((cartItem, itemIndex) => itemIndex === index ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem)
      : [...list, item];
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  } catch {}
}

export function HomeInteriorGallery({ products }: { products: CatalogProduct[] }) {
  const makeSlides = (images: string[], offset: number): InteriorSlide[] => products.length
    ? images.map((image, index) => ({
      image,
      alt: `Часы Bullmet в интерьере ${offset + index + 1}`,
      product: products[(offset + index) % products.length]!
    }))
    : [];
  const leftSlides = makeSlides(interiorImageSets.left, 0);
  const rightSlides = makeSlides(interiorImageSets.right, 2);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [turn, setTurn] = useState<'left' | 'right'>('left');
  const [leftMotion, setLeftMotion] = useState('slide-left');
  const [rightMotion, setRightMotion] = useState('slide-right');
  const [leftMotionIndex, setLeftMotionIndex] = useState(0);
  const [rightMotionIndex, setRightMotionIndex] = useState(0);

  useEffect(() => {
    if (!leftSlides.length || !rightSlides.length) return;
    const timer = window.setTimeout(() => cycle(1), 3000);
    return () => window.clearTimeout(timer);
  }, [turn, leftMotionIndex, rightMotionIndex, leftSlides.length, rightSlides.length]);

  if (!leftSlides.length || !rightSlides.length) return null;

  function cycle(direction: 1 | -1) {
    if (turn === 'left') {
      setLeftIndex((index) => (index + direction + leftSlides.length) % leftSlides.length);
      setLeftMotion(leftMotions[leftMotionIndex]);
      setLeftMotionIndex((index) => (index + 1) % leftMotions.length);
      setTurn('right');
      return;
    }
    setRightIndex((index) => (index + direction + rightSlides.length) % rightSlides.length);
    setRightMotion(rightMotions[rightMotionIndex]);
    setRightMotionIndex((index) => (index + 1) % rightMotions.length);
    setTurn('left');
  }

  const left = leftSlides[leftIndex];
  const right = rightSlides[rightIndex];

  return (
    <section className="home-container home-interior-gallery" aria-labelledby="interior-gallery-title">
      <header className="home-interior-gallery__head">
        <h2 id="interior-gallery-title">Часы в интерьере</h2>
        <div className="home-interior-gallery__controls" aria-label="Переключить интерьерные фотографии">
          <button type="button" onClick={() => cycle(-1)} aria-label="Предыдущая фотография"><ArrowLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => cycle(1)} aria-label="Следующая фотография"><ArrowRight aria-hidden="true" /></button>
        </div>
      </header>
      <div className="home-interior-gallery__grid">
        <InteriorCard slide={left} motion={leftMotion} onAdd={() => addToCart(left.product)} />
        <InteriorCard slide={right} motion={rightMotion} onAdd={() => addToCart(right.product)} />
      </div>
    </section>
  );
}

function InteriorCard({ slide, motion, onAdd }: { slide: InteriorSlide; motion: string; onAdd: () => void }) {
  return (
    <article className="interior-gallery-card">
      <img key={`${slide.image}-${motion}`} className={`interior-gallery-card__image is-${motion}`} src={slide.image} alt={slide.alt} />
      <div className="interior-gallery-card__shade" />
      <div className="interior-gallery-card__content">
        <div><span>{slide.product.title}</span><small>{priceLabel(slide.product.price)}</small></div>
        <div className="interior-gallery-card__actions">
          <button type="button" onClick={onAdd}><ShoppingCart aria-hidden="true" />В корзину</button>
          <Link href={`/product/${slide.product.slug}`}>Подробнее <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
