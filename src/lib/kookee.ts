import { Kookee, type ExportEntry } from '@kookee/sdk';
import { getPath } from './paths';

/**
 * Every Kookee read of the build goes through here. Reads are spaced to at most three a second
 * (180 a minute), under the Free plan's 300 a minute per project, which the live site's browser
 * reads share. Reads every page repeats (the project, the header's changelog and announcements,
 * the footer's pages, the help categories) happen once per build.
 */

export const PAGE_SIZE = 12;
const MIN_INTERVAL_MS = 334;

export const SITE_TYPES = ['blog', 'changelog', 'help_article', 'page'] as const;
export type SiteType = (typeof SITE_TYPES)[number];

const apiKey = import.meta.env.KOOKEE_API_KEY || null;
const client = apiKey ? new Kookee({ apiKey, timeoutMs: 10_000, getPath }) : null;

/** The key the browser pieces (reactions, helpful vote, help search, widget) send. It is public by design. */
export const API_KEY = apiKey;

export const ROADMAP_ENABLED = import.meta.env.KOOKEE_ROADMAP !== 'false';
export const STATUS_ENABLED = import.meta.env.KOOKEE_STATUS === 'true';

let nextSlot = 0;

async function throttled<T>(read: (kookee: Kookee) => Promise<T>): Promise<T> {
  if (!client) throw new Error('KOOKEE_API_KEY is not set');
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + MIN_INTERVAL_MS;
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  return read(client);
}

const once = new Map<string, Promise<unknown>>();

function readOnce<T>(key: string, read: (kookee: Kookee) => Promise<T>): Promise<T> {
  if (!once.has(key)) once.set(key, throttled(read));
  return once.get(key) as Promise<T>;
}

export const hasKey = () => client !== null;

export const getProject = () => (client ? readOnce('project', (kookee) => kookee.project.get()) : Promise.resolve(null));

export const listBlogPosts = (page: number) =>
  readOnce(`blog:${page}`, (kookee) => kookee.blog.list({ page, limit: PAGE_SIZE }));

export const listChangelog = (page: number) =>
  readOnce(`changelog:${page}`, (kookee) => kookee.changelog.list({ page, limit: PAGE_SIZE }));

export const listPages = () => readOnce('pages', (kookee) => kookee.entries.list({ type: 'page', limit: 20 }));

export const getHelpCategories = () =>
  client ? readOnce('help-categories', (kookee) => kookee.help.categories()) : Promise.resolve([]);

export const listHelpArticles = (category: string) =>
  readOnce(`help:${category}`, async (kookee) => (await kookee.help.list({ category, limit: 100 })).data);

/** The ten newest announcements in full, so the header's pill opens them without a request from the browser. */
export const getAnnouncements = () =>
  readOnce('announcements', async (kookee) => {
    const list = await kookee.announcements.list({ limit: 10 });
    return Promise.all(list.data.map((item) => throttled((next) => next.announcements.getById(item.id))));
  });

export const getBlogPost = (slug: string) => throttled((kookee) => kookee.blog.getBySlug(slug));
export const getChangelogEntry = (slug: string) => throttled((kookee) => kookee.changelog.getBySlug(slug));
export const getHelpArticle = (slug: string) => throttled((kookee) => kookee.help.getBySlug(slug));
export const getPage = (slug: string) => throttled((kookee) => kookee.pages.getBySlug(slug));

export const getRoadmap = () =>
  readOnce('roadmap', async (kookee) => {
    const [columns, posts] = await Promise.all([
      kookee.feedback.getColumns(),
      throttled((next) => next.feedback.list({ sort: 'top', limit: 100, columnType: 'open' })),
    ]);
    // Only open posts are read, so closed columns (Done, Declined) would render empty.
    return { columns: columns.filter((column) => column.type === 'open'), posts: posts.data };
  });

/** Every published entry of the given types in the project's default locale that has a page here. */
export async function exportEntries(types: readonly SiteType[] = SITE_TYPES): Promise<ExportEntry[]> {
  if (!client) return [];
  const [project, rows] = await Promise.all([
    getProject(),
    // One export per build serves every page list, the sitemap and llms.txt.
    readOnce('export', (kookee) => kookee.entries.export({ type: [...SITE_TYPES] })),
  ]);
  // The export holds every locale; this site has pages in the default one only.
  return rows.filter(
    (row) => types.includes(row.type as SiteType) && row.locale === project?.defaultLocale && getPath(row),
  );
}

/** The 50 newest entries for a feed, from a list read: it holds the default locale only. */
export const listFeed = (type: 'blog' | 'changelog') =>
  readOnce(`feed:${type}`, async (kookee) => (await kookee.entries.list({ type, limit: 50 })).data);
