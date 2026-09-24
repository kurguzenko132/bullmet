import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';
import { getSanityConfig } from './sanity';

type SanityPreviewEnvironment = Partial<Pick<NodeJS.ProcessEnv,
  'NEXT_PUBLIC_SANITY_PROJECT_ID' | 'NEXT_PUBLIC_SANITY_DATASET' | 'SANITY_API_VERSION' | 'SANITY_API_READ_TOKEN'
>>;

/**
 * Creates a server-only client able to read drafts. The token is intentionally
 * never read by the public Content Lake client in lib/sanity.ts.
 */
export function getSanityPreviewClient(environment?: SanityPreviewEnvironment): SanityClient | null {
  const source = environment || {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN
  };
  const config = getSanityConfig(source);
  const token = source.SANITY_API_READ_TOKEN?.trim();
  if (!config || !token) return null;

  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token,
    useCdn: false,
    perspective: 'drafts'
  });
}
