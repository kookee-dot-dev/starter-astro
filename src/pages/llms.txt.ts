import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '@kookee/sdk';
import { exportEntries, getProject } from '../lib/kookee';
import { getPath } from '../lib/paths';
import { baseUrl } from '../lib/seo';

export const GET: APIRoute = async ({ site }) => {
  const [project, entries] = await Promise.all([getProject(), exportEntries()]);
  const text = buildLlmsTxt(entries, {
    baseUrl: baseUrl(site),
    getPath,
    siteName: project?.name ?? 'Kookee starter',
    description: 'Blog posts, changelog entries, help articles and pages.',
  });
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
