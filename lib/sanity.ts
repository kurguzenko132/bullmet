export type SanityConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
};

export type SanityQueryOptions = {
  revalidate?: number;
  tags?: string[];
};

export type SanityQueryResult<T> = {
  configured: boolean;
  data: T | null;
  error: string | null;
};

type SanityEnvironment = Partial<Pick<NodeJS.ProcessEnv,
  'NEXT_PUBLIC_SANITY_PROJECT_ID' | 'NEXT_PUBLIC_SANITY_DATASET' | 'SANITY_API_VERSION'
>>;

const projectIdPattern = /^[a-z0-9]+$/;
const datasetPattern = /^[a-z0-9][a-z0-9_-]{0,62}[a-z0-9]$|^[a-z0-9]$/;
const defaultApiVersion = '2026-09-22';

export function getSanityConfig(environment?: SanityEnvironment): SanityConfig | null {
  const source = environment || {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION
  };
  const projectId = source.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || '';
  const dataset = source.NEXT_PUBLIC_SANITY_DATASET?.trim() || '';
  const apiVersion = source.SANITY_API_VERSION?.trim() || defaultApiVersion;

  if (!projectIdPattern.test(projectId) || !datasetPattern.test(dataset)) return null;
  return { projectId, dataset, apiVersion };
}

export function buildSanityQueryUrl(config: SanityConfig, query: string, params: Record<string, unknown> = {}) {
  const url = new URL(`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`);
  url.searchParams.set('query', query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key.startsWith('$') ? key : `$${key}`, JSON.stringify(value));
  }
  return url;
}

/**
 * Reads published public content only. Callers must keep Supabase/default data
 * as a fallback until the relevant Sanity document has been accepted.
 */
export async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}, options: SanityQueryOptions = {}): Promise<SanityQueryResult<T>> {
  const config = getSanityConfig();
  if (!config) return { configured: false, data: null, error: null };

  try {
    const response = await fetch(buildSanityQueryUrl(config, query, params), {
      headers: { Accept: 'application/json' },
      next: { revalidate: options.revalidate ?? 60, tags: options.tags?.length ? options.tags : ['sanity'] }
    });
    if (!response.ok) return { configured: true, data: null, error: 'Sanity request failed.' };

    const payload = await response.json() as { result?: T };
    return { configured: true, data: payload.result ?? null, error: null };
  } catch {
    return { configured: true, data: null, error: 'Sanity request failed.' };
  }
}
