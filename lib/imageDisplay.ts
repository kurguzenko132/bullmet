import type { CatalogProduct, ImageDisplaySettings, ImageFit } from './products';

function clampPercent(value: unknown, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function clampZoom(value: unknown, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(2.5, Math.max(1, Math.round(number * 100) / 100));
}

function imagePosition(x?: number, y?: number) {
  return `${clampPercent(x, 50)}% ${clampPercent(y, 50)}%`;
}

function normalizeImageDisplaySettings(value?: ImageDisplaySettings | null): Required<ImageDisplaySettings> {
  return {
    catalogFit: value?.catalogFit === 'contain' ? 'contain' : 'cover',
    catalogX: clampPercent(value?.catalogX, 50),
    catalogY: clampPercent(value?.catalogY, 50),
    catalogZoom: clampZoom(value?.catalogZoom, 1),
    productFit: value?.productFit === 'cover' ? 'cover' : 'contain',
    productX: clampPercent(value?.productX, 50),
    productY: clampPercent(value?.productY, 50),
    productZoom: clampZoom(value?.productZoom, 1)
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

export function getImageSettings(product: Pick<CatalogProduct, 'imageSettings' | 'catalogImageFit' | 'catalogImagePosition' | 'productImageFit' | 'productImagePosition'>, image?: string) {
  const byImage = image && product.imageSettings ? product.imageSettings[image] : undefined;
  const global = product.imageSettings?.__global;
  const baseCatalog = positionToNumbers(product.catalogImagePosition);
  const baseProduct = positionToNumbers(product.productImagePosition);
  const normalized = normalizeImageDisplaySettings(byImage || global || {
    catalogFit: product.catalogImageFit,
    catalogX: baseCatalog.x,
    catalogY: baseCatalog.y,
    productFit: product.productImageFit,
    productX: baseProduct.x,
    productY: baseProduct.y
  });

  return {
    catalogFit: (normalized.catalogFit || product.catalogImageFit || 'cover') as ImageFit,
    catalogPosition: imagePosition(normalized.catalogX, normalized.catalogY),
    catalogZoom: normalized.catalogZoom,
    productFit: (normalized.productFit || product.productImageFit || 'contain') as ImageFit,
    productPosition: imagePosition(normalized.productX, normalized.productY),
    productZoom: normalized.productZoom,
    raw: normalized
  };
}
