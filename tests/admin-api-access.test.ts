import { describe, expect, it } from 'vitest';
import { canAccessAdminApi } from '../lib/serverAuth';

describe('admin API access matrix', () => {
  it('allows every administrative API only to an administrator', () => {
    expect(canAccessAdminApi('admin', '/api/admin/users/user-id')).toBe(true);
    expect(canAccessAdminApi('admin', '/api/admin/backup')).toBe(true);
    expect(canAccessAdminApi('admin', '/api/admin/export')).toBe(true);
  });

  it('limits a manager to operational APIs', () => {
    expect(canAccessAdminApi('manager', '/api/admin/orders')).toBe(true);
    expect(canAccessAdminApi('manager', '/api/admin/customers/customer-id/notes')).toBe(true);
    expect(canAccessAdminApi('manager', '/api/admin/products')).toBe(false);
    expect(canAccessAdminApi('manager', '/api/admin/users')).toBe(false);
    expect(canAccessAdminApi('manager', '/api/admin/backup')).toBe(false);
  });

  it('limits a content manager to catalog and content APIs', () => {
    expect(canAccessAdminApi('content_manager', '/api/admin/products/product-id')).toBe(true);
    expect(canAccessAdminApi('content_manager', '/api/admin/media')).toBe(true);
    expect(canAccessAdminApi('content_manager', '/api/admin/orders')).toBe(false);
    expect(canAccessAdminApi('content_manager', '/api/admin/customers')).toBe(false);
    expect(canAccessAdminApi('content_manager', '/api/admin/telegram/test')).toBe(false);
  });

  it('denies customers and unknown administrative routes', () => {
    expect(canAccessAdminApi('customer', '/api/admin/orders')).toBe(false);
    expect(canAccessAdminApi('manager', '/api/admin/unlisted-endpoint')).toBe(false);
  });
});
