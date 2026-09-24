import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSanityQueryUrl, fetchSanity, getSanityConfig } from '../lib/sanity';

describe('Sanity client configuration', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses only valid public project and dataset settings', () => {
    expect(getSanityConfig({ NEXT_PUBLIC_SANITY_PROJECT_ID: 'n7arap96', NEXT_PUBLIC_SANITY_DATASET: 'development' })).toEqual({
      projectId: 'n7arap96', dataset: 'development', apiVersion: '2026-09-22'
    });
    expect(getSanityConfig({ NEXT_PUBLIC_SANITY_PROJECT_ID: 'n7arap96', NEXT_PUBLIC_SANITY_DATASET: 'invalid dataset' })).toBeNull();
    expect(getSanityConfig({ NEXT_PUBLIC_SANITY_PROJECT_ID: 'n7arap96' })).toBeNull();
  });

  it('builds parameterized public Content Lake queries', () => {
    const url = buildSanityQueryUrl({ projectId: 'n7arap96', dataset: 'development', apiVersion: '2026-09-22' }, '*[_type == "page" && slug.current == $slug][0]', { slug: 'about' });
    expect(url.hostname).toBe('n7arap96.api.sanity.io');
    expect(url.pathname).toBe('/v2026-09-22/data/query/development');
    expect(url.searchParams.get('$slug')).toBe('"about"');
  });

  it('returns a safe fallback when Sanity is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', '');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', '');

    await expect(fetchSanity<number>('count(*)')).resolves.toEqual({ configured: false, data: null, error: null });
  });
});
