import { describe, expect, it } from 'vitest';
import { productAvailability } from '../lib/products';

describe('product availability', () => {
  it('does not sell an out-of-stock product', () => {
    expect(productAvailability({ inStock: false, status: 'active', sizes: [] })).toBe('unavailable');
  });

  it('marks configured made-to-order products correctly', () => {
    expect(productAvailability({ inStock: true, status: 'active', sizes: ['60 см', 'Под заказ'] })).toBe('made_to_order');
  });
});
