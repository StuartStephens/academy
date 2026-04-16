import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.PUBLIC_SANITY_DATASET?.trim();

export const SANITY_API_VERSION =
  import.meta.env.PUBLIC_SANITY_API_VERSION?.trim() || '2024-06-01';

export const isSanityConfigured = Boolean(projectId && dataset);

let cachedClient: ReturnType<typeof createClient> | undefined;

export function getSanityClient() {
  if (!isSanityConfigured) {
    throw new Error(
      'Sanity is not configured. Set PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET to enable CMS content.'
    );
  }

  if (!cachedClient) {
    cachedClient = createClient({
      projectId,
      dataset,
      apiVersion: SANITY_API_VERSION,
      useCdn: !import.meta.env.SANITY_API_READ_TOKEN,
      token: import.meta.env.SANITY_API_READ_TOKEN,
      perspective: 'published',
    });
  }

  return cachedClient;
}
