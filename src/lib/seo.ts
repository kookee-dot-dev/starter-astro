import { getEntrySeo, type BaseEntry } from '@kookee/sdk';
import { getPath } from './paths';

/** `site` from astro.config, without a trailing slash. */
export function baseUrl(site: URL | undefined): string {
  return (site?.href ?? 'http://localhost:4321').replace(/\/+$/, '');
}

/** The props `Base` takes for an entry's page: title, description, canonical URL, image and JSON-LD. */
export function entryHead(entry: BaseEntry, siteName: string, site: URL | undefined) {
  const seo = getEntrySeo(entry, { baseUrl: baseUrl(site), getPath, siteName });
  return {
    title: entry.title,
    // A meta title is written whole, so it skips the "· Site name" suffix.
    absoluteTitle: entry.metaTitle || undefined,
    description: seo.description,
    canonical: seo.canonical,
    image: seo.image,
    type: seo.type,
    jsonLd: seo.jsonLd,
  };
}
