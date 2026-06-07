import type { CatalogProduct, ImageDisplaySettings, ImageFit } from './products';

function clampPercent(value: unknown, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function imagePosition(x?: number, y?: number) {
  return `${clampPercent(x, 50)}% ${clampPercent(y, 50)}%`;
}

function normalizeImageDisplaySettings(value?: ImageDisplaySettings | null): Required<ImageDisplaySettings> {
  return {
    catalogFit: value?.catalogFit === 'contain' ? 'contain' : 'cover',
    catalogX: clampPercent(value?.catalogX, 50),
    catalogY: clampPercent(value?.catalogY, 50),
    productFit: value?.productFit === 'cover' ? 'cover' : 'contain',
    productX: clampPercent(value?.productX, 50),
    productY: clampPercent(value?.productY, 50)
  };
}

export function getImageSettings(product: Pick<CatalogProduct, 'imageSettings' | 'catalogImageFit' | 'catalogImagePosition' | 'productImageFit' | 'productImagePosition'>, image?: string) {
  const byImage = image && product.imageSettings ? product.imageSettings[image] : undefined;
  const normalized = normalizeImageDisplaySettings(byImage);

  if (!byImage) {
    return {
      catalogFit: (product.catalogImageFit || normalized.catalogFit) as ImageFit,
      catalogPosition: product.catalogImagePosition || imagePosition(normalized.catalogX, normalized.catalogY),
      productFit: (product.productImageFit || normalized.productFit) as ImageFit,
      productPosition: product.productImagePosition || imagePosition(normalized.productX, normalized.productY),
      raw: normalized
    };
  }

  return {
    catalogFit: normalized.catalogFit,
    catalogPosition: imagePosition(normalized.catalogX, normalized.catalogY),
    productFit: normalized.productFit,
    productPosition: imagePosition(normalized.productX, normalized.productY),
    raw: normalized
  };
}
