import type { APIRoute } from 'astro';
import { buildFeed } from '@kookee/sdk';
import { getProject, hasKey, listFeed } from '../../lib/kookee';
import { getPath } from '../../lib/paths';
import { baseUrl } from '../../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const [project, entries] = await Promise.all([getProject(), hasKey() ? listFeed('changelog') : []]);
  const name = project?.name ?? 'Kookee starter';
  const xml = buildFeed(entries, {
    baseUrl: baseUrl(site),
    getPath,
    title: `${name} changelog`,
    description: `What changed in ${name}.`,
    feedPath: '/changelog/rss.xml',
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
