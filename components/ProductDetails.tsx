'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartIcon, DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from './Icons';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import type { Product } from './shopData';
import { getImageSettings } from '../lib/imageDisplay';
import { ProductReviews } from './ProductReviews';

export function ProductDetails({ product }: { product: Product }) {
  const [activeVariantId, setActiveVariantId] = useState(product.activeVariantId ?? product.variants?.[0]?.id ?? '');
  const activeVariant = product.variants?.find((variant) => variant.id === activeVariantId);
  const visibleProduct = activeVariant ? {
    ...product,
    slug: activeVariant.slug,
    image: activeVariant.image,
    images: activeVariant.images,
    imageSettings: activeVariant.imageSettings ?? product.imageSettings,
    catalogImageFit: activeVariant.catalogImageFit ?? product.catalogImageFit,
    catalogImagePosition: activeVariant.catalogImagePosition ?? product.catalogImagePosition,
    productImageFit: activeVariant.productImageFit ?? product.productImageFit,
    productImagePosition: activeVariant.productImagePosition ?? product.productImagePosition,
    title: activeVariant.title ?? product.title,
    short: activeVariant.short ?? product.short,
    material: activeVariant.material ?? product.material,
    description: activeVariant.description ?? product.description,
    price: activeVariant.price ?? product.price,
    oldPrice: activeVariant.oldPrice ?? product.oldPrice,
    sizes: activeVariant.sizes ?? product.sizes,
    specs: activeVariant.specs ?? product.specs,
    variantName: activeVariant.name,
    variantColorHex: activeVariant.colorHex,
  } : product;
  const productImages = (visibleProduct.images?.length ? visibleProduct.images : [visibleProduct.image]).filter(Boolean);
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [activeSize, setActiveSize] = useState(product.sizes?.[1] ?? product.sizes?.[0] ?? '60 см');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setActiveVariantId(product.activeVariantId ?? product.variants?.[0]?.id ?? '');
    const initialVariant = product.variants?.find((variant) => variant.id === (product.activeVariantId ?? product.variants?.[0]?.id ?? ''));
    const nextImages = (initialVariant?.images?.length ? initialVariant.images : product.images?.length ? product.images : [product.image]).filter(Boolean);
    setActiveImage(nextImages[0]);
    setActiveSize(product.sizes?.[1] ?? product.sizes?.[0] ?? '60 см');
    setQty(1);
  }, [product.slug]);

  useEffect(() => {
    setActiveImage(productImages[0]);
  }, [activeVariantId]);

  return (
    <section className="container productDetails">
      <div className="productGallery">
        <div className="thumbs">
          {productImages.map((image, index) => (
            <button className={activeImage === image ? 'active' : ''} onClick={() => setActiveImage(image)} key={`${image}-${index}`} aria-label={`Показать фото товара ${index + 1}`}>
              <Image src={image} alt="" fill sizes="90px" />
            </button>
          ))}
        </div>
        <div className="mainProductImage">
          <Image src={activeImage} alt={visibleProduct.title} fill priority sizes="55vw" style={{ objectFit: getImageSettings(visibleProduct, activeImage).productFit, objectPosition: getImageSettings(visibleProduct, activeImage).productPosition }} />
        </div>
      </div>

      <div className="productPanel">
        <h1>{visibleProduct.title}</h1>
        {visibleProduct.variantName && <p className="productColorName">Цвет: {visibleProduct.variantName}</p>}
        <p className="productMaterial">Материал: {visibleProduct.material}</p>
        <p className="availability"><span />В наличии</p>
        <div className="productPrice">от {visibleProduct.price} BYN {visibleProduct.oldPrice && <em>{visibleProduct.oldPrice} BYN</em>}</div>
        <p className="productDescription">{visibleProduct.description}</p>

        {product.variants?.length ? (
          <div className="choiceBlock productColorChooser">
            <p>Расцветка</p>
            <div className="colorOptions colorOptions--photo">
              {product.variants.map((variant) => (
                <button type="button" className={activeVariantId === variant.id ? 'active' : ''} onClick={() => setActiveVariantId(variant.id)} key={variant.id} aria-label={`Выбрать цвет ${variant.name}`}>
                  <span className="colorOptionImage">
                    <Image src={variant.image} alt={variant.name} fill sizes="82px" style={{ objectFit: getImageSettings(variant as unknown as Product, variant.image).catalogFit, objectPosition: getImageSettings(variant as unknown as Product, variant.image).catalogPosition }} />
                  </span>
                  <span className="colorOptionText">{variant.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <ul className="specList">
          {visibleProduct.specs.map((spec, index) => <li key={spec}><SpecIcon index={index} />{spec}</li>)}
        </ul>

        <div className="choiceBlock">
          <p>Диаметр</p>
          <div className="sizeOptions">
            {(visibleProduct.sizes ?? ['40 см', '60 см', '80 см']).map((size) => <button className={activeSize === size ? 'active' : ''} onClick={() => setActiveSize(size)} key={size}>{size}</button>)}
          </div>
        </div>

        <div className="choiceBlock">
          <p>Количество</p>
          <div className="qtyControl"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(qty + 1)}>+</button></div>
        </div>

        <div className="productActions"><AddToCartButton product={visibleProduct} quantity={qty} size={activeSize} className="button button--orange">В корзину</AddToCartButton><FavoriteButton product={product} variant="text" /><Link href={`/request?product=${visibleProduct.slug}`} className="button button--outline">Заказать похожее</Link><Link href="/checkout" className="button button--ghost">Купить в 1 клик</Link></div>
      </div>
    </section>
  );
}

export function ProductReviewsBlock({ productSlug }: { productSlug: string }) {
  return <ProductReviews productSlug={productSlug} />;
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
            <Link href={`/catalog/${product.slug}`} className="catalogCard__image"><Image src={product.image} alt={product.title} fill sizes="25vw" style={{ objectFit: getImageSettings(product, product.image).catalogFit, objectPosition: getImageSettings(product, product.image).catalogPosition }} /></Link><div className="catalogCard__fav"><FavoriteButton product={product} /></div>
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
