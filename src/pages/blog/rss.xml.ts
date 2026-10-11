import type { APIRoute } from 'astro';
import { buildFeed } from '@kookee/sdk';
import { getProject, hasKey, listFeed } from '../../lib/kookee';
import { getPath } from '../../lib/paths';
import { baseUrl } from '../../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const [project, posts] = await Promise.all([getProject(), hasKey() ? listFeed('blog') : []]);
  const name = project?.name ?? 'Kookee starter';
  const xml = buildFeed(posts, {
    baseUrl: baseUrl(site),
    getPath,
    title: `${name} blog`,
    description: `The latest posts from ${name}.`,
    feedPath: '/blog/rss.xml',
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
