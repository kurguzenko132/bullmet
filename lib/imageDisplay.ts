import type { CatalogProduct, ImageDisplayContext, ImageDisplaySettings, ImageFit } from './products';

type NormalizedImageDisplaySettings = Required<ImageDisplaySettings>;

const CONTEXT_DEFAULT_FIT: Record<ImageDisplayContext, ImageFit> = {
  catalog: 'cover',
  product: 'contain',
  thumb: 'cover',
  variant: 'cover',
  related: 'cover',
  modal: 'contain',
  home: 'cover'
};

function clampPercent(value: unknown, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function clampZoom(value: unknown, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(3, Math.max(1, Math.round(number * 100) / 100));
}

function imagePosition(x?: number, y?: number) {
  return `${clampPercent(x, 50)}% ${clampPercent(y, 50)}%`;
}

function normalizeFit(value: unknown, fallback: ImageFit): ImageFit {
  return value === 'contain' || value === 'cover' ? value : fallback;
}

function normalizeImageDisplaySettings(value?: ImageDisplaySettings | null): NormalizedImageDisplaySettings {
  return {
    catalogFit: normalizeFit(value?.catalogFit, 'cover'),
    catalogX: clampPercent(value?.catalogX, 50),
    catalogY: clampPercent(value?.catalogY, 50),
    catalogZoom: clampZoom(value?.catalogZoom, 1),

    productFit: normalizeFit(value?.productFit, 'contain'),
    productX: clampPercent(value?.productX, 50),
    productY: clampPercent(value?.productY, 50),
    productZoom: clampZoom(value?.productZoom, 1),

    thumbFit: normalizeFit(value?.thumbFit ?? value?.catalogFit, 'cover'),
    thumbX: clampPercent(value?.thumbX ?? value?.catalogX, 50),
    thumbY: clampPercent(value?.thumbY ?? value?.catalogY, 50),
    thumbZoom: clampZoom(value?.thumbZoom ?? value?.catalogZoom, 1),

    variantFit: normalizeFit(value?.variantFit ?? value?.catalogFit, 'cover'),
    variantX: clampPercent(value?.variantX ?? value?.catalogX, 50),
    variantY: clampPercent(value?.variantY ?? value?.catalogY, 50),
    variantZoom: clampZoom(value?.variantZoom ?? value?.catalogZoom, 1),

    relatedFit: normalizeFit(value?.relatedFit ?? value?.catalogFit, 'cover'),
    relatedX: clampPercent(value?.relatedX ?? value?.catalogX, 50),
    relatedY: clampPercent(value?.relatedY ?? value?.catalogY, 50),
    relatedZoom: clampZoom(value?.relatedZoom ?? value?.catalogZoom, 1),

    modalFit: normalizeFit(value?.modalFit ?? value?.productFit, 'contain'),
    modalX: clampPercent(value?.modalX ?? value?.productX, 50),
    modalY: clampPercent(value?.modalY ?? value?.productY, 50),
    modalZoom: clampZoom(value?.modalZoom ?? value?.productZoom, 1),

    homeFit: normalizeFit(value?.homeFit ?? value?.catalogFit, 'cover'),
    homeX: clampPercent(value?.homeX ?? value?.catalogX, 50),
    homeY: clampPercent(value?.homeY ?? value?.catalogY, 50),
    homeZoom: clampZoom(value?.homeZoom ?? value?.catalogZoom, 1)
  };
}

function positionToNumbers(position?: string) {
  if (!position) return { x: 50, y: 50 };
  const parts = position.split(/\s+/);
  const toNumber = (part?: string, fallback = 50) => {
    if (!part) return fallback;
    if (part === 'left' || part === 'top') return 0;
    if (part === 'center') return 50;
    if (part === 'right' || part === 'bottom') return 100;
    return clampPercent(part.replace('%', ''), fallback);
  };
  return { x: toNumber(parts[0], 50), y: toNumber(parts[1], 50) };
}

function getBaseSettings(
  product: Pick<CatalogProduct, 'imageSettings' | 'catalogImageFit' | 'catalogImagePosition' | 'productImageFit' | 'productImagePosition'>,
  image?: string
) {
  const byImage = image && product.imageSettings ? product.imageSettings[image] : undefined;
  const global = product.imageSettings?.__global;
  const baseCatalog = positionToNumbers(product.catalogImagePosition);
  const baseProduct = positionToNumbers(product.productImagePosition);

  return normalizeImageDisplaySettings(byImage || global || {
    catalogFit: product.catalogImageFit,
    catalogX: baseCatalog.x,
    catalogY: baseCatalog.y,
    productFit: product.productImageFit,
    productX: baseProduct.x,
    productY: baseProduct.y
  });
}

export function getImageSettings(
  product: Pick<CatalogProduct, 'imageSettings' | 'catalogImageFit' | 'catalogImagePosition' | 'productImageFit' | 'productImagePosition'>,
  image?: string
) {
  const normalized = getBaseSettings(product, image);

  return {
    catalogFit: normalized.catalogFit,
    catalogPosition: imagePosition(normalized.catalogX, normalized.catalogY),
    catalogZoom: normalized.catalogZoom,
    productFit: normalized.productFit,
    productPosition: imagePosition(normalized.productX, normalized.productY),
    productZoom: normalized.productZoom,
    raw: normalized
  };
}

export function getImagePreset(
  product: Pick<CatalogProduct, 'imageSettings' | 'catalogImageFit' | 'catalogImagePosition' | 'productImageFit' | 'productImagePosition'>,
  image: string | undefined,
  context: ImageDisplayContext
) {
  const normalized = getBaseSettings(product, image);
  const fit = normalizeFit(normalized[`${context}Fit` as keyof NormalizedImageDisplaySettings], CONTEXT_DEFAULT_FIT[context]) as ImageFit;
  const x = clampPercent(normalized[`${context}X` as keyof NormalizedImageDisplaySettings], 50);
  const y = clampPercent(normalized[`${context}Y` as keyof NormalizedImageDisplaySettings], 50);
  const zoom = clampZoom(normalized[`${context}Zoom` as keyof NormalizedImageDisplaySettings], 1);

  return {
    fit,
    position: imagePosition(x, y),
    zoom,
    style: {
      objectFit: fit,
      objectPosition: imagePosition(x, y),
      transform: `scale(${zoom})`
    } as const,
    raw: normalized
  };
}
