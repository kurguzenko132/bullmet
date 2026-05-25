export type ImageFit = 'cover' | 'contain';

export type ImageDisplaySettings = {
  catalogFit?: ImageFit;
  catalogX?: number;
  catalogY?: number;
  productFit?: ImageFit;
  productX?: number;
  productY?: number;
};

export function clampPercent(value: unknown, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export function normalizeImageDisplaySettings(value: Partial<ImageDisplaySettings> | undefined | null): Required<ImageDisplaySettings> {
  return {
    catalogFit: value?.catalogFit === 'contain' ? 'contain' : 'cover',
    catalogX: clampPercent(value?.catalogX, 50),
    catalogY: clampPercent(value?.catalogY, 50),
    productFit: value?.productFit === 'contain' ? 'contain' : 'cover',
    productX: clampPercent(value?.productX, 50),
    productY: clampPercent(value?.productY, 50),
  };
}

export function imagePosition(x?: number, y?: number) {
  return `${clampPercent(x, 50)}% ${clampPercent(y, 50)}%`;
}

export function getImageSettings(product: { imageSettings?: Record<string, ImageDisplaySettings>; catalogImageFit?: ImageFit; catalogImagePosition?: string; productImageFit?: ImageFit; productImagePosition?: string }, image?: string) {
  const byImage = image && product.imageSettings ? product.imageSettings[image] : undefined;
  const normalized = normalizeImageDisplaySettings(byImage);

  if (!byImage) {
    return {
      catalogFit: product.catalogImageFit ?? normalized.catalogFit,
      catalogPosition: product.catalogImagePosition ?? imagePosition(normalized.catalogX, normalized.catalogY),
      productFit: product.productImageFit ?? normalized.productFit,
      productPosition: product.productImagePosition ?? imagePosition(normalized.productX, normalized.productY),
      raw: normalized,
    };
  }

  return {
    catalogFit: normalized.catalogFit,
    catalogPosition: imagePosition(normalized.catalogX, normalized.catalogY),
    productFit: normalized.productFit,
    productPosition: imagePosition(normalized.productX, normalized.productY),
    raw: normalized,
  };
}
