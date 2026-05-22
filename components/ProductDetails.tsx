'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartIcon, DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from './Icons';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import type { Product } from './shopData';

export function ProductDetails({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [activeSize, setActiveSize] = useState(product.sizes?.[1] ?? product.sizes?.[0] ?? '60 см');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setActiveImage(product.images[0]);
    setActiveSize(product.sizes?.[1] ?? product.sizes?.[0] ?? '60 см');
    setQty(1);
  }, [product.slug, product.images, product.sizes]);

  return (
    <section className="container productDetails">
      <div className="productGallery">
        <div className="thumbs">
          {product.images.map((image) => (
            <button className={activeImage === image ? 'active' : ''} onClick={() => setActiveImage(image)} key={image} aria-label="Показать фото товара">
              <Image src={image} alt="" fill sizes="90px" />
            </button>
          ))}
        </div>
        <div className="mainProductImage">
          <Image src={activeImage} alt={product.title} fill priority sizes="55vw" />
        </div>
      </div>

      <div className="productPanel">
        <h1>{product.title}</h1>
        <p className="productMaterial">Материал: {product.material}</p>
        <p className="availability"><span />В наличии</p>
        <div className="productPrice">от {product.price} BYN {product.oldPrice && <em>{product.oldPrice} BYN</em>}</div>
        <p className="productDescription">{product.description}</p>

        <ul className="specList">
          {product.specs.map((spec, index) => <li key={spec}><SpecIcon index={index} />{spec}</li>)}
        </ul>

        <div className="choiceBlock">
          <p>Диаметр</p>
          <div className="sizeOptions">
            {(product.sizes ?? ['40 см', '60 см', '80 см']).map((size) => <button className={activeSize === size ? 'active' : ''} onClick={() => setActiveSize(size)} key={size}>{size}</button>)}
          </div>
        </div>

        <div className="choiceBlock">
          <p>Количество</p>
          <div className="qtyControl"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(qty + 1)}>+</button></div>
        </div>

        <div className="productActions"><AddToCartButton product={product} quantity={qty} size={activeSize} className="button button--orange">В корзину</AddToCartButton><FavoriteButton product={product} variant="text" /><Link href={`/request?product=${product.slug}`} className="button button--outline">Заказать похожее</Link><Link href="/checkout" className="button button--ghost">Купить в 1 клик</Link></div>
      </div>
    </section>
  );
}

export function ProductServiceStrip() {
  return (
    <section className="container productServiceStrip">
      <div><FactoryIcon /><b>Собственное производство</b><span>Контроль качества на каждом этапе</span></div>
      <div><DraftIcon /><b>Натуральные материалы</b><span>Металл и дерево высокого качества</span></div>
      <div><ToolsIcon /><b>Индивидуальные размеры</b><span>Изготовим по вашим параметрам</span></div>
      <div><TruckIcon /><b>Доставка и оплата</b><span>Самовывоз или доставка по Беларуси</span></div>
      <div><ShieldIcon /><b>Гарантия качества</b><span>Проверяем изделие перед передачей</span></div>
    </section>
  );
}

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className="container relatedProducts">
      <div className="sectionHead"><h3 className="blockTitle">Похожие товары</h3><Link href="/catalog">В каталог</Link></div>
      <div className="productCatalogGrid productCatalogGrid--related">
        {products.slice(0, 4).map((product) => (
          <article className="catalogCard" key={product.slug}>
            <Link href={`/catalog/${product.slug}`} className="catalogCard__overlay" aria-label={`Открыть ${product.title}`} />
            <Link href={`/catalog/${product.slug}`} className="catalogCard__image"><Image src={product.image} alt={product.title} fill sizes="25vw" /></Link><div className="catalogCard__fav"><FavoriteButton product={product} /></div>
            <div className="catalogCard__body"><Link href={`/catalog/${product.slug}`} className="catalogCard__title">{product.title}</Link><p>{product.short}</p><div className="catalogCard__bottom"><b>от {product.price} BYN</b><AddToCartButton product={product} iconOnly /></div></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SpecIcon({ index }: { index: number }) {
  const icons = ['◇', '⌁', '✕', '◌', '✧'];
  return <i>{icons[index % icons.length]}</i>;
}
