import { describe, expect, it } from 'vitest';
import { getSanityPreviewClient } from '../lib/sanityPreview.server';

describe('Sanity Draft Mode client', () => {
  it('does not create a draft client without a server-only token', () => {
    expect(getSanityPreviewClient({
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'n7arap96',
      NEXT_PUBLIC_SANITY_DATASET: 'development'
    })).toBeNull();
  });

  it('creates a draft-only client when the server token is available', () => {
    const client = getSanityPreviewClient({
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'n7arap96',
      NEXT_PUBLIC_SANITY_DATASET: 'development',
      SANITY_API_READ_TOKEN: 'test-server-token'
    });

    expect(client).not.toBeNull();
    expect(client?.config().perspective).toBe('drafts');
    expect(client?.config().useCdn).toBe(false);
  });
});
