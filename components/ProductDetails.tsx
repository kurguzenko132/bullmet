'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartIcon, DraftIcon, FactoryIcon, ShieldIcon, ToolsIcon, TruckIcon } from './Icons';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { QuickOrderButton } from './QuickOrderButton';
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
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const zoomIndex = zoomImage ? Math.max(productImages.indexOf(zoomImage), 0) : 0;

  function openZoom(image: string) {
    setZoomImage(image);
  }

  function showZoomImage(direction: -1 | 1) {
    if (!productImages.length) return;
    const currentIndex = zoomImage ? Math.max(productImages.indexOf(zoomImage), 0) : Math.max(productImages.indexOf(activeImage), 0);
    const nextIndex = (currentIndex + direction + productImages.length) % productImages.length;
    setZoomImage(productImages[nextIndex]);
    setActiveImage(productImages[nextIndex]);
  }

  function handleZoomTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleZoomTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 42) return;
    showZoomImage(delta > 0 ? -1 : 1);
  }

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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!zoomImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomImage]);

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
        <button className="mainProductImage mainProductImage--zoomable" type="button" onClick={() => openZoom(activeImage)} aria-label="Открыть фото товара">
          <Image src={activeImage} alt={visibleProduct.title} fill priority sizes="55vw" style={{ objectFit: getImageSettings(visibleProduct, activeImage).productFit, objectPosition: getImageSettings(visibleProduct, activeImage).productPosition }} />
        </button>
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

        <div className="productTrustGrid">
          <div><b>3–7 дней</b><span>средний срок изготовления</span></div>
          <div><b>Гарантия</b><span>проверяем изделие перед передачей</span></div>
          <div><b>Доставка</b><span>самовывоз или отправка по Беларуси</span></div>
        </div>

        <ProductShareBlock title={visibleProduct.title} slug={visibleProduct.slug} />

        <div className="productActions"><AddToCartButton product={visibleProduct} quantity={qty} size={activeSize} className="button button--orange">В корзину</AddToCartButton><QuickOrderButton product={visibleProduct} quantity={qty} size={activeSize} className="button button--ghost" /><FavoriteButton product={product} variant="text" /><Link href={`/request?product=${visibleProduct.slug}`} className="button button--outline">Заказать похожее</Link></div>

        {/* Sticky mobile bar: on small screens shows price and add-to-cart button fixed at bottom */}
        <div className="productMobileBar">
          <b>от {visibleProduct.price} BYN</b>
          <AddToCartButton
            product={visibleProduct}
            quantity={qty}
            size={activeSize}
            className="button button--orange"
          >
            В корзину
          </AddToCartButton>
        </div>
      </div>
      {zoomImage && (
        <div className="bullmetPhotoViewer" role="dialog" aria-modal="true" aria-label="Просмотр фото" onClick={() => setZoomImage(null)}>
          <div
            className="bullmetPhotoViewer__dialog"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleZoomTouchStart}
            onTouchEnd={handleZoomTouchEnd}
          >
            <div
              className="bullmetPhotoViewer__close"
              role="button"
              tabIndex={0}
              onClick={() => setZoomImage(null)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setZoomImage(null);
              }}
              aria-label="Закрыть"
            >
              ×
            </div>

            {productImages.length > 1 && (
              <div
                className="bullmetPhotoViewer__arrow bullmetPhotoViewer__arrow--prev"
                role="button"
                tabIndex={0}
                onClick={() => showZoomImage(-1)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') showZoomImage(-1);
                }}
                aria-label="Предыдущее фото"
              >
                ‹
              </div>
            )}

            {productImages.length > 1 && (
              <div
                className="bullmetPhotoViewer__arrow bullmetPhotoViewer__arrow--next"
                role="button"
                tabIndex={0}
                onClick={() => showZoomImage(1)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') showZoomImage(1);
                }}
                aria-label="Следующее фото"
              >
                ›
              </div>
            )}

            <div className="bullmetPhotoViewer__imageWrap">
              <Image src={zoomImage} alt={visibleProduct.title} fill sizes="92vw" style={{ objectFit: 'contain' }} />
            </div>

            {productImages.length > 1 && (
              <div className="bullmetPhotoViewer__thumbs" aria-label="Миниатюры фото">
                {productImages.map((image, index) => (
                  <button
                    type="button"
                    className={zoomIndex === index ? 'active' : ''}
                    onClick={() => {
                      setZoomImage(image);
                      setActiveImage(image);
                    }}
                    key={`${image}-zoom-${index}`}
                    aria-label={`Открыть фото ${index + 1}`}
                  >
                    <Image src={image} alt="" fill sizes="74px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ProductShareBlock({ title, slug }: { title: string; slug: string }) {
  function copyLink() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/catalog/${slug}` : `/catalog/${slug}`;
    navigator.clipboard?.writeText(url);
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedPath = encodeURIComponent(`/catalog/${slug}`);

  return (
    <div className="productShareBlock">
      <span>Поделиться товаром</span>
      <button type="button" onClick={copyLink}>Скопировать ссылку</button>
      <a href={`https://t.me/share/url?url=${encodedPath}&text=${encodedTitle}`} target="_blank" rel="noreferrer">Telegram</a>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedPath}`} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
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

export function ProductFaqBlock() {
  const items = [
    { q: 'Можно изменить размер или цвет?', a: 'Да. Для большинства изделий мы можем подобрать другой размер, цвет покрытия или доработать дизайн под интерьер.' },
    { q: 'Сколько занимает изготовление?', a: 'Обычно 3–7 рабочих дней. Сложные индивидуальные изделия рассчитываем отдельно после уточнения размеров и материала.' },
    { q: 'Как происходит доставка?', a: 'Возможен самовывоз или доставка по Беларуси. Финальные условия менеджер уточняет после оформления заказа.' },
    { q: 'Можно заказать изделие по фото или эскизу?', a: 'Да. Загрузите фото, размеры и пожелания в заявке — мы оценим возможность изготовления и подготовим расчет.' },
  ];
  return (
    <section className="container productFaqBlock">
      <div className="sectionHead"><h3 className="blockTitle">Вопросы перед покупкой</h3><Link href="/request">Задать вопрос</Link></div>
      <div className="productFaqGrid">
        {items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
