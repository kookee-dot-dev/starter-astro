import type { APIRoute } from 'astro';
import { buildSitemap } from '@kookee/sdk';
import { exportEntries, getHelpCategories, ROADMAP_ENABLED } from '../lib/kookee';
import { getPath } from '../lib/paths';
import { baseUrl } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const [entries, categories] = await Promise.all([exportEntries(), getHelpCategories()]);
  const xml = buildSitemap(entries, {
    baseUrl: baseUrl(site),
    getPath,
    extraUrls: [
      '/',
      '/blog',
      '/changelog',
      '/help',
      ...(ROADMAP_ENABLED ? ['/roadmap'] : []),
      ...categories.map((category) => `/help/${category.slug}`),
    ],
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
